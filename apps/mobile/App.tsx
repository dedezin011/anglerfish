import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";

import { betaTournament, seedRanking } from "./src/data/beta";
import { isSupabaseConfigured, supabase } from "./src/lib/supabase";
import { colors, spacing } from "./src/theme";
import type {
  CaptureForm,
  CaptureSubmission,
  FishingRoute,
  FishingRouteDifficulty,
  FishingRouteDraftPoint,
  FishingRouteForm,
  FishingRoutePoint,
  SubmissionStatus,
  Tournament
} from "./src/types";

type AppScreen = "campeonato" | "captura" | "envios" | "mapa" | "ranking" | "perfil";

type CatchSubmissionRow = {
  id: string;
  tournament_id: string;
  fish_species: string;
  length_cm: number | string;
  city: string;
  state: string;
  modality: string;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  created_at: string;
};

type TournamentRow = {
  id: string;
  name: string;
  slug: string;
  code: string;
  status: Tournament["status"];
  starts_at: string | null;
  ends_at: string | null;
  prize: string;
  description: string;
  cover_image_path?: string | null;
  rules: string[] | null;
};

type ParticipantRow = {
  tournament_id: string;
};

type FishingRoutePointRow = {
  id: string;
  title: string;
  notes: string | null;
  latitude: number | string;
  longitude: number | string;
  sort_order: number | null;
};

type FishingRouteRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  modality: string;
  target_species: string[] | null;
  difficulty: FishingRouteDifficulty;
  price_cents: number | string;
  is_published: boolean;
  active_until: string | null;
  preview_lat: number | string;
  preview_lng: number | string;
  created_at: string;
  fishing_route_points?: FishingRoutePointRow[] | null;
};

type FishingRouteUnlockRow = {
  route_id: string;
};

const logo = require("./assets/anglerfish-logo.png");
const mark = require("./assets/anglerfish-mark.png");

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const MAX_VIDEO_DURATION_MS = 30 * 1000;

const DEFAULT_MAP_REGION: Region = {
  latitude: -22.734,
  longitude: -47.647,
  latitudeDelta: 8,
  longitudeDelta: 8
};

const demoFishingRoutes: FishingRoute[] = [
  {
    id: "demo-route-1",
    ownerId: "demo-owner",
    title: "Manha de tucuna no lago",
    description:
      "Ponto demonstrativo com estrutura, dica de isca e melhor horario para bater margem.",
    city: "Presidente Epitacio",
    state: "SP",
    modality: "Pesca embarcada",
    targetSpecies: ["Tucunare", "Traira"],
    difficulty: "media",
    priceCents: 2900,
    isPublished: true,
    activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    previewLatitude: -21.765,
    previewLongitude: -52.115,
    unlocked: true,
    owned: false,
    createdAt: new Date().toISOString(),
    points: [
      {
        id: "demo-route-1-point-1",
        title: "Entrada do corixo",
        notes: "Comece com meia agua e recolhimento curto.",
        latitude: -21.765,
        longitude: -52.115,
        sortOrder: 1
      },
      {
        id: "demo-route-1-point-2",
        title: "Ponta com galhada",
        notes: "Bom ao nascer do sol. Evite motor perto da margem.",
        latitude: -21.752,
        longitude: -52.082,
        sortOrder: 2
      }
    ]
  }
];

function createEmptyForm(tournament: Tournament = betaTournament): CaptureForm {
  return {
    fishSpecies: "",
    lengthCm: "",
    city: "",
    state: "",
    modality: "Pesca embarcada",
    codeSpoken: tournament.code,
    photo: null,
    video: null
  };
}

function createEmptyRouteForm(): FishingRouteForm {
  return {
    title: "",
    description: "",
    city: "",
    state: "",
    modality: "Pesca embarcada",
    targetSpecies: "",
    difficulty: "media",
    price: "",
    saleDurationDays: "30",
    isPublished: true,
    currentPointTitle: "Ponto 1",
    currentPointNotes: "",
    currentLatitude: "",
    currentLongitude: "",
    points: []
  };
}

function normalizeDecimal(value: string) {
  return Number(value.replace(",", ".").trim());
}

function parsePriceToCents(value: string) {
  if (!value.trim()) {
    return 0;
  }

  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  if (Number.isNaN(parsed) || parsed < 0) {
    return Number.NaN;
  }

  return Math.round(parsed * 100);
}

function formatPriceCents(value: number) {
  if (value <= 0) {
    return "Gratuita";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function parseSaleDurationDays(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return Number.NaN;
  }

  return parsed;
}

function formatActiveUntil(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function isRouteActiveForSale(route: Pick<FishingRoute, "owned" | "activeUntil" | "isPublished">) {
  if (route.owned) {
    return true;
  }

  return route.isPublished && new Date(route.activeUntil).getTime() > Date.now();
}

function shouldShowRoute(route: FishingRoute) {
  return route.owned || route.unlocked || isRouteActiveForSale(route);
}


function getDifficultyLabel(value: FishingRouteDifficulty) {
  if (value === "facil") {
    return "Facil";
  }

  if (value === "dificil") {
    return "Dificil";
  }

  return "Media";
}

function mapFishingRoutePoint(row: FishingRoutePointRow): FishingRoutePoint {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? "",
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    sortOrder: row.sort_order ?? 0
  };
}

function mapFishingRoute(
  row: FishingRouteRow,
  userId: string,
  unlockedRouteIds: Set<string>
): FishingRoute {
  const owned = row.owner_id === userId;
  const priceCents = Number(row.price_cents);
  const unlocked = owned || priceCents <= 0 || unlockedRouteIds.has(row.id);

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    city: row.city,
    state: row.state,
    modality: row.modality,
    targetSpecies: row.target_species ?? [],
    difficulty: row.difficulty,
    priceCents,
    isPublished: row.is_published,
    activeUntil: row.active_until ?? addDays(30),
    previewLatitude: Number(row.preview_lat),
    previewLongitude: Number(row.preview_lng),
    points: unlocked
      ? [...(row.fishing_route_points ?? [])]
          .map(mapFishingRoutePoint)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : [],
    unlocked,
    owned,
    createdAt: row.created_at
  };
}

function getRoutesMapRegion(routes: FishingRoute[], selectedRoute?: FishingRoute | null): Region {
  const sourcePoints = selectedRoute?.points.length
    ? selectedRoute.points.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude
      }))
    : routes.map((route) => ({
        latitude: route.previewLatitude,
        longitude: route.previewLongitude
      }));

  if (sourcePoints.length === 0) {
    return DEFAULT_MAP_REGION;
  }

  const latitudes = sourcePoints.map((point) => point.latitude);
  const longitudes = sourcePoints.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.03, (maxLat - minLat) * 2 || 0.08),
    longitudeDelta: Math.max(0.03, (maxLng - minLng) * 2 || 0.08)
  };
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`;
  }

  return `${Math.ceil(bytes / 1024)} KB`;
}

function formatDuration(milliseconds?: number | null) {
  if (!milliseconds) {
    return null;
  }

  return `${Math.ceil(milliseconds / 1000)}s`;
}

function assertAssetCanBeUploaded(asset: ImagePicker.ImagePickerAsset, kind: "photo" | "video") {
  const maxBytes = kind === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
  const label = kind === "photo" ? "foto" : "vídeo";

  if (!asset.fileSize) {
    throw new Error(
      `Não foi possível ler o tamanho do ${label}. Escolha outro arquivo ou grave novamente pelo celular.`
    );
  }

  if (asset.fileSize > maxBytes) {
    throw new Error(
      `O ${label} selecionado tem ${formatFileSize(asset.fileSize)}. O limite é ${formatFileSize(
        maxBytes
      )}. Grave em resolução menor e com duração curta.`
    );
  }

  if (kind === "video" && asset.duration && asset.duration > MAX_VIDEO_DURATION_MS) {
    throw new Error(
      `O vídeo selecionado tem ${formatDuration(asset.duration)}. O limite do beta é ${formatDuration(
        MAX_VIDEO_DURATION_MS
      )}.`
    );
  }
}

function getAssetLabel(asset: ImagePicker.ImagePickerAsset, fallback: string) {
  const size = asset.fileSize ? ` · ${formatFileSize(asset.fileSize)}` : "";
  const duration = asset.type === "video" ? formatDuration(asset.duration) : null;
  const durationText = duration ? ` · ${duration}` : "";

  return `${asset.fileName ?? fallback}${size}${durationText}`;
}

function formatSubmissionDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatTournamentRange(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) {
    return "Período aberto";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });

  if (startsAt && endsAt) {
    return `${formatter.format(new Date(startsAt))} até ${formatter.format(new Date(endsAt))}`;
  }

  if (startsAt) {
    return `Início ${formatter.format(new Date(startsAt))}`;
  }

  return `Até ${formatter.format(new Date(endsAt as string))}`;
}

function mapTournament(row: TournamentRow): Tournament {
  const coverImageUrl =
    row.cover_image_path && supabase
      ? supabase.storage.from("tournament-assets").getPublicUrl(row.cover_image_path).data.publicUrl
      : null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    code: row.code,
    status: row.status,
    dateRange: formatTournamentRange(row.starts_at, row.ends_at),
    prize: row.prize,
    description: row.description,
    coverImageUrl,
    rules: Array.isArray(row.rules) && row.rules.length ? row.rules : betaTournament.rules
  };
}

function mapCatchSubmission(row: CatchSubmissionRow, anglerName: string): CaptureSubmission {
  return {
    id: row.id,
    anglerName,
    fishSpecies: row.fish_species,
    lengthCm: Number(row.length_cm),
    city: row.city,
    state: row.state,
    modality: row.modality,
    status: row.status,
    createdAt: row.created_at,
    reviewerNotes: row.reviewer_notes
  };
}

function getStatusLabel(status: SubmissionStatus) {
  if (status === "approved") {
    return "Aprovada";
  }

  if (status === "rejected") {
    return "Reprovada";
  }

  return "Em análise";
}

function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = "primary"
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "ghost" && styles.ghostButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && styles.secondaryButtonText,
          variant === "ghost" && styles.ghostButtonText
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry,
  autoCapitalize = "sentences"
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8aa0b5"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.pill, active && styles.activePill]}>
      <Text style={[styles.pillText, active && styles.activePillText]}>{label}</Text>
    </View>
  );
}

async function uploadAsset(
  asset: ImagePicker.ImagePickerAsset,
  kind: "photo" | "video",
  userId: string,
  tournamentId: string
) {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  assertAssetCanBeUploaded(asset, kind);

  const { uri, mimeType, fileName } = asset;

  const extension =
    fileName?.split(".").pop() ??
    mimeType?.split("/").pop() ??
    (kind === "photo" ? "jpg" : "mp4");
  const path = `${userId}/${tournamentId}/${kind}-${Date.now()}.${extension}`;
  const response = await fetch(uri);
  const file = await response.arrayBuffer();
  const { error } = await supabase.storage.from("catch-media").upload(path, file, {
    contentType: mimeType ?? (kind === "photo" ? "image/jpeg" : "video/mp4"),
    upsert: true
  });

  if (error) {
    throw error;
  }

  return path;
}

function AuthScreen({
  onDemoMode,
  onSession
}: {
  onDemoMode: () => void;
  onSession: (session: Session | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!supabase) {
      Alert.alert("Configure o Supabase", "Preencha o .env do app mobile para usar login real.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    setLoading(false);

    if (error) {
      Alert.alert("Não foi possível entrar", error.message);
      return;
    }

    onSession(data.session);
  }

  async function signUp() {
    if (!supabase) {
      Alert.alert("Configure o Supabase", "Preencha o .env do app mobile para cadastrar usuários reais.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: name.trim()
        }
      }
    });

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name.trim() || email.trim(),
        updated_at: new Date().toISOString()
      });
    }

    setLoading(false);

    if (error) {
      Alert.alert("Não foi possível cadastrar", error.message);
      return;
    }

    Alert.alert(
      "Cadastro iniciado",
      "Se o Supabase pedir confirmação, verifique seu email. Depois faça login no app."
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.midnight, colors.harbor, "#052033"]}
        style={styles.authHero}
      >
        <Image source={logo} resizeMode="contain" style={styles.logo} />
        <Text style={styles.authTitle}>Campeonatos digitais de pesca esportiva.</Text>
        <Text style={styles.authText}>
          Entre no beta para testar envio de captura, ranking e validação com foto e vídeo.
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.authContent}
      >
        <ScrollView contentContainerStyle={styles.authForm}>
          {!isSupabaseConfigured ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Modo desenvolvimento</Text>
              <Text style={styles.warningText}>
                O app já está pronto para Supabase. Preencha o arquivo .env para ativar login real.
              </Text>
            </View>
          ) : null}

          <TextField label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
          />

          {loading ? (
            <ActivityIndicator color={colors.reef} style={styles.loader} />
          ) : (
            <View style={styles.buttonStack}>
              <PrimaryButton label="Entrar" onPress={signIn} />
              <PrimaryButton label="Criar conta beta" onPress={signUp} variant="secondary" />
              <PrimaryButton label="Ver demonstração" onPress={onDemoMode} variant="ghost" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TournamentScreen({
  tournaments,
  selectedTournament,
  joinedTournamentIds,
  loading,
  demoMode,
  onSelectTournament,
  onStartCapture,
  onJoin,
  onRefresh
}: {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  joinedTournamentIds: string[];
  loading: boolean;
  demoMode: boolean;
  onSelectTournament: (tournamentId: string) => void;
  onStartCapture: () => void;
  onJoin: (tournamentId: string) => void;
  onRefresh: () => void;
}) {
  const joinedSelected = Boolean(
    selectedTournament && (demoMode || joinedTournamentIds.includes(selectedTournament.id))
  );
  const heroContent = selectedTournament ? (
    <>
      <Image source={mark} resizeMode="contain" style={styles.heroMark} />
      <Text style={styles.heroEyebrow}>
        {joinedSelected ? "Você está dentro" : "Aberto para entrada"}
      </Text>
      <Text style={styles.heroTitle}>{selectedTournament.name}</Text>
      <Text style={styles.heroDescription}>{selectedTournament.description}</Text>
      <View style={styles.heroPills}>
        <Pill label={selectedTournament.code} active />
        <Pill label={selectedTournament.dateRange} />
      </View>
    </>
  ) : null;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      {selectedTournament?.coverImageUrl ? (
        <ImageBackground
          source={{ uri: selectedTournament.coverImageUrl }}
          resizeMode="cover"
          style={[styles.heroCard, styles.heroImageCard]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={["rgba(2,18,32,0.45)", "rgba(2,18,32,0.92)"]}
            style={styles.heroCoverOverlay}
          >
            {heroContent}
          </LinearGradient>
        </ImageBackground>
      ) : selectedTournament ? (
        <LinearGradient colors={[colors.midnight, colors.harbor]} style={styles.heroCard}>
          {heroContent}
        </LinearGradient>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrar em torneio</Text>
        <Text style={styles.bodyText}>
          Escolha um campeonato ativo, confirme sua participação e depois envie suas capturas para análise.
        </Text>
      </View>

      <PrimaryButton
        label={loading ? "Atualizando torneios..." : "Atualizar torneios"}
        onPress={onRefresh}
        disabled={loading}
        variant="secondary"
      />

      {loading && tournaments.length === 0 ? (
        <ActivityIndicator color={colors.reef} style={styles.loader} />
      ) : null}

      {tournaments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Nenhum torneio aberto</Text>
          <Text style={styles.emptyStateText}>
            Assim que um campeonato ficar ativo, ele aparecerá aqui para entrada.
          </Text>
        </View>
      ) : null}

      {tournaments.map((tournament) => {
        const selected = selectedTournament?.id === tournament.id;
        const joined = demoMode || joinedTournamentIds.includes(tournament.id);

        return (
          <Pressable
            key={tournament.id}
            accessibilityRole="button"
            onPress={() => onSelectTournament(tournament.id)}
            style={[styles.tournamentCard, selected && styles.selectedTournamentCard]}
          >
            <View style={styles.tournamentHeader}>
              <View style={styles.tournamentTitleWrap}>
                <Text style={styles.tournamentTitle}>{tournament.name}</Text>
                <Text style={styles.tournamentMeta}>{tournament.dateRange}</Text>
              </View>
              <View style={[styles.joinBadge, joined && styles.joinedBadge]}>
                <Text style={[styles.joinBadgeText, joined && styles.joinedBadgeText]}>
                  {joined ? "Inscrito" : "Aberto"}
                </Text>
              </View>
            </View>
            <Text style={styles.tournamentDescription}>{tournament.description}</Text>
            {tournament.coverImageUrl ? (
              <Image source={{ uri: tournament.coverImageUrl }} resizeMode="cover" style={styles.tournamentCover} />
            ) : null}
            <View style={styles.tournamentFooter}>
              <View style={[styles.tournamentBadge, selected && styles.selectedTournamentBadge]}>
                <Text
                  style={[
                    styles.tournamentBadgeText,
                    selected && styles.selectedTournamentBadgeText
                  ]}
                >
                  {tournament.code}
                </Text>
              </View>
              <View style={styles.tournamentBadge}>
                <Text style={styles.tournamentBadgeText}>{tournament.prize}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Regras do envio</Text>
        {(selectedTournament?.rules ?? betaTournament.rules).map((rule, index) => (
          <View key={rule} style={styles.ruleRow}>
            <Text style={styles.ruleIndex}>{index + 1}</Text>
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonStack}>
        <PrimaryButton
          label={joinedSelected ? "Participação confirmada" : "Entrar no torneio"}
          onPress={() => selectedTournament && onJoin(selectedTournament.id)}
          disabled={!selectedTournament || joinedSelected || loading}
        />
        <PrimaryButton
          label="Enviar captura"
          onPress={onStartCapture}
          disabled={!selectedTournament}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

function CaptureScreen({
  tournament,
  form,
  setForm,
  onSubmit,
  loading,
  submitStatus
}: {
  tournament: Tournament | null;
  form: CaptureForm;
  setForm: (form: CaptureForm) => void;
  onSubmit: () => void;
  loading: boolean;
  submitStatus: string | null;
}) {
  async function pickMedia(kind: "photo" | "video") {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Autorize acesso à galeria para escolher o arquivo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === "photo" ? ["images"] : ["videos"],
      allowsEditing: kind === "photo",
      quality: kind === "photo" ? 0.7 : 0.4,
      selectionLimit: 1,
      videoExportPreset: ImagePicker.VideoExportPreset.H264_640x480,
      videoMaxDuration: 30,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      try {
        assertAssetCanBeUploaded(asset, kind);
      } catch (error) {
        Alert.alert(
          "Arquivo muito grande",
          error instanceof Error ? error.message : "Selecione outro arquivo."
        );
        return;
      }

      setForm({ ...form, [kind]: asset });
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enviar captura</Text>
        <Text style={styles.bodyText}>
          Use o código {tournament?.code ?? betaTournament.code} no vídeo para ajudar a validar que a captura é do desafio.
        </Text>
      </View>

      <TextField
        label="Espécie"
        value={form.fishSpecies}
        onChangeText={(fishSpecies) => setForm({ ...form, fishSpecies })}
        placeholder="Ex: tucunaré, traíra, tilápia"
      />
      <TextField
        label="Tamanho em cm"
        value={form.lengthCm}
        onChangeText={(lengthCm) => setForm({ ...form, lengthCm })}
        placeholder="Ex: 58.5"
        keyboardType="numeric"
      />
      <TextField
        label="Cidade"
        value={form.city}
        onChangeText={(city) => setForm({ ...form, city })}
        placeholder="Sua cidade"
      />
      <TextField
        label="Estado"
        value={form.state}
        onChangeText={(state) => setForm({ ...form, state })}
        placeholder="UF"
        autoCapitalize="characters"
      />
      <TextField
        label="Modalidade"
        value={form.modality}
        onChangeText={(modality) => setForm({ ...form, modality })}
        placeholder="Pesca embarcada, barranco, caiaque..."
      />
      <TextField
        label="Código falado no vídeo"
        value={form.codeSpoken}
        onChangeText={(codeSpoken) => setForm({ ...form, codeSpoken })}
        placeholder={tournament?.code ?? betaTournament.code}
        autoCapitalize="characters"
      />

      <View style={styles.mediaGrid}>
        <Pressable
          disabled={loading}
          style={[styles.mediaCard, loading && styles.disabledButton]}
          onPress={() => pickMedia("photo")}
        >
          <Text style={styles.mediaTitle}>Foto na régua</Text>
          <Text style={styles.mediaText}>
            {form.photo ? getAssetLabel(form.photo, "Foto selecionada") : "Selecionar foto"}
          </Text>
        </Pressable>
        <Pressable
          disabled={loading}
          style={[styles.mediaCard, loading && styles.disabledButton]}
          onPress={() => pickMedia("video")}
        >
          <Text style={styles.mediaTitle}>Vídeo curto</Text>
          <Text style={styles.mediaText}>
            {form.video ? getAssetLabel(form.video, "Vídeo selecionado") : "Selecionar vídeo"}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.uploadStatus}>
          <ActivityIndicator color={colors.reef} />
          <View style={styles.uploadStatusTextWrap}>
            <Text style={styles.uploadStatusTitle}>{submitStatus ?? "Preparando envio..."}</Text>
            <Text style={styles.uploadStatusText}>Mantenha o app aberto até a conclusão.</Text>
          </View>
        </View>
      ) : (
        <PrimaryButton label="Enviar para análise" onPress={onSubmit} disabled={loading} />
      )}
    </ScrollView>
  );
}

function RankingScreen({ submissions }: { submissions: CaptureSubmission[] }) {
  const sorted = [...submissions].sort((a, b) => b.lengthCm - a.lengthCm);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ranking do desafio</Text>
        <Text style={styles.bodyText}>
          Entram no ranking apenas capturas aprovadas. Envios pendentes ficam separados para análise.
        </Text>
      </View>

      {sorted.map((submission, index) => (
        <View key={submission.id} style={styles.rankCard}>
          <View style={styles.rankPosition}>
            <Text style={styles.rankPositionText}>{index + 1}</Text>
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankName}>{submission.anglerName}</Text>
            <Text style={styles.rankMeta}>
              {submission.fishSpecies} · {submission.city}/{submission.state}
            </Text>
            <Text style={styles.rankMeta}>{submission.modality}</Text>
          </View>
          <View style={styles.rankLength}>
            <Text style={styles.rankLengthValue}>{submission.lengthCm}</Text>
            <Text style={styles.rankLengthUnit}>cm</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function EnviosScreen({
  submissions,
  loading,
  onRefresh
}: {
  submissions: CaptureSubmission[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const sorted = [...submissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seus envios</Text>
        <Text style={styles.bodyText}>
          Acompanhe aqui as capturas enviadas para análise antes de entrarem no ranking.
        </Text>
      </View>

      <PrimaryButton
        label={loading ? "Atualizando..." : "Atualizar envios"}
        onPress={onRefresh}
        disabled={loading}
        variant="secondary"
      />

      {loading && sorted.length === 0 ? (
        <ActivityIndicator color={colors.reef} style={styles.loader} />
      ) : null}

      {!loading && sorted.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Nenhuma captura enviada ainda</Text>
          <Text style={styles.emptyStateText}>
            Quando você enviar foto e vídeo de uma captura, o andamento aparecerá aqui.
          </Text>
        </View>
      ) : null}

      {sorted.map((submission) => (
        <View key={submission.id} style={styles.submissionCard}>
          <View style={styles.submissionHeader}>
            <View>
              <Text style={styles.submissionTitle}>{submission.fishSpecies}</Text>
              <Text style={styles.submissionMeta}>
                {formatSubmissionDate(submission.createdAt)} · {submission.city}/{submission.state}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                submission.status === "approved" && styles.approvedBadge,
                submission.status === "rejected" && styles.rejectedBadge,
                submission.status === "pending" && styles.pendingBadge
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  submission.status === "approved" && styles.approvedBadgeText,
                  submission.status === "rejected" && styles.rejectedBadgeText,
                  submission.status === "pending" && styles.pendingBadgeText
                ]}
              >
                {getStatusLabel(submission.status)}
              </Text>
            </View>
          </View>

          <View style={styles.submissionDetails}>
            <View style={styles.submissionDetail}>
              <Text style={styles.submissionDetailLabel}>Tamanho</Text>
              <Text style={styles.submissionDetailValue}>{submission.lengthCm} cm</Text>
            </View>
            <View style={styles.submissionDetail}>
              <Text style={styles.submissionDetailLabel}>Modalidade</Text>
              <Text style={styles.submissionDetailValue}>{submission.modality}</Text>
            </View>
          </View>

          {submission.reviewerNotes ? (
            <View style={styles.reviewNote}>
              <Text style={styles.reviewNoteLabel}>Observação da análise</Text>
              <Text style={styles.reviewNoteText}>{submission.reviewerNotes}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

function FishingRoutesScreen({
  routes,
  selectedRouteId,
  routeForm,
  loading,
  saving,
  unlockingRouteId,
  onRefresh,
  onSelectRoute,
  onUnlockRoute,
  onRouteFormChange,
  onUseCurrentLocation,
  onAddPoint,
  onRemovePoint,
  onSaveRoute
}: {
  routes: FishingRoute[];
  selectedRouteId: string | null;
  routeForm: FishingRouteForm;
  loading: boolean;
  saving: boolean;
  unlockingRouteId: string | null;
  onRefresh: () => void;
  onSelectRoute: (routeId: string) => void;
  onUnlockRoute: (routeId: string) => void;
  onRouteFormChange: (form: FishingRouteForm) => void;
  onUseCurrentLocation: () => void;
  onAddPoint: () => void;
  onRemovePoint: (pointId: string) => void;
  onSaveRoute: () => void;
}) {
  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? routes[0] ?? null;
  const mapRegion = getRoutesMapRegion(routes, selectedRoute);
  const visibleRoutePoints = selectedRoute?.points ?? [];
  const mapKey = `${selectedRoute?.id ?? "map"}-${visibleRoutePoints.length}`;
  const draftLatitude = normalizeDecimal(routeForm.currentLatitude);
  const draftLongitude = normalizeDecimal(routeForm.currentLongitude);
  const draftPointCoordinate =
    !Number.isNaN(draftLatitude) && !Number.isNaN(draftLongitude)
      ? {
          latitude: draftLatitude,
          longitude: draftLongitude
        }
      : null;

  function updateField<Key extends keyof FishingRouteForm>(
    key: Key,
    value: FishingRouteForm[Key]
  ) {
    onRouteFormChange({
      ...routeForm,
      [key]: value
    });
  }

  function pickPointOnMap(latitude: number, longitude: number) {
    onRouteFormChange({
      ...routeForm,
      currentLatitude: latitude.toFixed(6),
      currentLongitude: longitude.toFixed(6)
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <LinearGradient colors={[colors.midnight, colors.harbor]} style={styles.heroCard}>
        <Image source={mark} resizeMode="contain" style={styles.heroMark} />
        <Text style={styles.heroEyebrow}>Marketplace de pontos</Text>
        <Text style={styles.heroTitle}>Venda seus pontos de pesca.</Text>
        <Text style={styles.heroDescription}>
          Cadastre pontos com dicas e iscas. A previa aparece no mapa; os pontos exatos ficam protegidos
          para quem desbloquear.
        </Text>
      </LinearGradient>

      <View style={styles.mapCard}>
        <MapView
          key={mapKey}
          style={styles.map}
          initialRegion={mapRegion}
          onPress={(event) => {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            pickPointOnMap(latitude, longitude);
          }}
        >
          {routes.map((route) => (
            <Marker
              key={route.id}
              coordinate={{
                latitude: route.previewLatitude,
                longitude: route.previewLongitude
              }}
              pinColor={route.id === selectedRoute?.id ? colors.reef : colors.harbor}
              title={route.title}
              description={`${route.city}/${route.state} - ${formatPriceCents(route.priceCents)}`}
              onPress={() => onSelectRoute(route.id)}
            />
          ))}

          {visibleRoutePoints.map((point) => (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude
              }}
              pinColor={colors.warning}
              title={point.title}
              description={point.notes}
            />
          ))}

          {visibleRoutePoints.length > 1 ? (
            <Polyline
              coordinates={visibleRoutePoints.map((point) => ({
                latitude: point.latitude,
                longitude: point.longitude
              }))}
              strokeColor={colors.reef}
              strokeWidth={4}
            />
          ) : null}

          {draftPointCoordinate ? (
            <Marker
              coordinate={draftPointCoordinate}
              pinColor={colors.reef}
              title="Novo ponto"
              description="Revise os dados e toque em Adicionar ponto."
            />
          ) : null}
        </MapView>

        <View style={styles.mapLegend}>
          <Text style={styles.mapHintText}>Toque no mapa para marcar seu próximo ponto de pesca.</Text>
          <Text style={styles.mapLegendText}>Verde: ponto selecionado</Text>
          <Text style={styles.mapLegendText}>Laranja: pontos liberados</Text>
        </View>
      </View>

      <PrimaryButton
        label={loading ? "Atualizando pontos..." : "Atualizar pontos"}
        onPress={onRefresh}
        disabled={loading}
        variant="secondary"
      />

      {loading && routes.length === 0 ? (
        <ActivityIndicator color={colors.reef} style={styles.loader} />
      ) : null}

      {routes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Nenhum ponto publicado ainda</Text>
          <Text style={styles.emptyStateText}>
            Quando pescadores publicarem pontos, eles aparecem aqui com uma previa do local.
          </Text>
        </View>
      ) : null}

      {routes.map((route) => {
        const selected = route.id === selectedRoute?.id;
        const targetSpecies = route.targetSpecies.length ? route.targetSpecies.join(", ") : "Peixes variados";
        const activeForSale = new Date(route.activeUntil).getTime() > Date.now();

        return (
          <Pressable
            key={route.id}
            accessibilityRole="button"
            onPress={() => onSelectRoute(route.id)}
            style={[styles.routeCard, selected && styles.selectedRouteCard]}
          >
            <View style={styles.routeHeader}>
              <View style={styles.tournamentTitleWrap}>
                <Text style={styles.routeTitle}>{route.title}</Text>
                <Text style={styles.routeMeta}>
                  {route.city}/{route.state} - {route.modality}
                </Text>
              </View>
              <View style={[styles.routePriceBadge, route.priceCents <= 0 && styles.freeRouteBadge]}>
                <Text style={styles.routePriceText}>{formatPriceCents(route.priceCents)}</Text>
              </View>
            </View>

            <Text style={styles.tournamentDescription}>{route.description}</Text>

            <View style={styles.routeStats}>
              <View style={styles.submissionDetail}>
                <Text style={styles.submissionDetailLabel}>Alvo</Text>
                <Text style={styles.submissionDetailValue}>{targetSpecies}</Text>
              </View>
              <View style={styles.submissionDetail}>
                <Text style={styles.submissionDetailLabel}>Dificuldade</Text>
                <Text style={styles.submissionDetailValue}>{getDifficultyLabel(route.difficulty)}</Text>
              </View>
            </View>

            <View style={styles.tournamentFooter}>
              <View style={[styles.tournamentBadge, route.unlocked && styles.selectedTournamentBadge]}>
                <Text
                  style={[
                    styles.tournamentBadgeText,
                    route.unlocked && styles.selectedTournamentBadgeText
                  ]}
                >
                  {route.unlocked ? `${route.points.length} pontos liberados` : "Pontos protegidos"}
                </Text>
              </View>
              {route.owned ? (
                <View style={styles.tournamentBadge}>
                  <Text style={styles.tournamentBadgeText}>Seu ponto</Text>
                </View>
              ) : null}
              <View style={[styles.tournamentBadge, !activeForSale && styles.expiredRouteBadge]}>
                <Text style={[styles.tournamentBadgeText, !activeForSale && styles.expiredRouteBadgeText]}>
                  {activeForSale ? `Ativa ate ${formatActiveUntil(route.activeUntil)}` : "Venda expirada"}
                </Text>
              </View>
            </View>

            {!route.unlocked && activeForSale ? (
              <PrimaryButton
                label={unlockingRouteId === route.id ? "Desbloqueando..." : "Desbloquear demo"}
                onPress={() => onUnlockRoute(route.id)}
                disabled={unlockingRouteId === route.id}
                variant="secondary"
              />
            ) : null}
          </Pressable>
        );
      })}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Criar ponto de pesca</Text>
        <Text style={styles.bodyText}>
          Para o MVP, o ponto ja nasce publicado. O pagamento real entra depois; por enquanto validamos preco,
          interesse e qualidade dos pontos.
        </Text>

        <View style={styles.formSection}>
          <TextField
            label="Nome do ponto"
            value={routeForm.title}
            onChangeText={(value) => updateField("title", value)}
            placeholder="Ex: Tucuna de manha no lago"
          />
          <TextField
            label="Cidade"
            value={routeForm.city}
            onChangeText={(value) => updateField("city", value)}
            placeholder="Cidade"
          />
          <TextField
            label="Estado"
            value={routeForm.state}
            onChangeText={(value) => updateField("state", value.toUpperCase())}
            placeholder="SP"
            autoCapitalize="characters"
          />
          <TextField
            label="Modalidade"
            value={routeForm.modality}
            onChangeText={(value) => updateField("modality", value)}
            placeholder="Pesca embarcada"
          />
          <TextField
            label="Peixes alvo"
            value={routeForm.targetSpecies}
            onChangeText={(value) => updateField("targetSpecies", value)}
            placeholder="Tucunare, traira, robalo"
          />
          <TextField
            label="Preco para desbloquear"
            value={routeForm.price}
            onChangeText={(value) => updateField("price", value)}
            placeholder="29,90 ou deixe vazio para gratuita"
            keyboardType="numeric"
          />
          <View style={styles.choiceGroup}>
            <Text style={styles.label}>Tempo ativo para venda</Text>
            <View style={styles.choiceRow}>
              {["7", "15", "30", "60", "90"].map((days) => (
                <Pressable
                  key={days}
                  accessibilityRole="button"
                  onPress={() => updateField("saleDurationDays", days)}
                  style={[
                    styles.choiceChip,
                    routeForm.saleDurationDays === days && styles.activeChoiceChip
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      routeForm.saleDurationDays === days && styles.activeChoiceChipText
                    ]}
                  >
                    {days} dias
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <TextField
            label="Descricao"
            value={routeForm.description}
            onChangeText={(value) => updateField("description", value)}
            placeholder="Explique o local, melhor horario, iscas e cuidados"
          />

          <View style={styles.choiceGroup}>
            <Text style={styles.label}>Dificuldade</Text>
            <View style={styles.choiceRow}>
              {(["facil", "media", "dificil"] as FishingRouteDifficulty[]).map((difficulty) => (
                <Pressable
                  key={difficulty}
                  accessibilityRole="button"
                  onPress={() => updateField("difficulty", difficulty)}
                  style={[
                    styles.choiceChip,
                    routeForm.difficulty === difficulty && styles.activeChoiceChip
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      routeForm.difficulty === difficulty && styles.activeChoiceChipText
                    ]}
                  >
                    {getDifficultyLabel(difficulty)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Localizacao do ponto</Text>
        <Text style={styles.bodyText}>
          Adicione os locais que compoem esse ponto. Toque no mapa acima, use sua localização atual ou cole latitude
          e longitude manualmente.
        </Text>

        <View style={styles.formSection}>
          <TextField
            label="Nome do ponto"
            value={routeForm.currentPointTitle}
            onChangeText={(value) => updateField("currentPointTitle", value)}
            placeholder={`Ponto ${routeForm.points.length + 1}`}
          />
          <TextField
            label="Dicas do ponto"
            value={routeForm.currentPointNotes}
            onChangeText={(value) => updateField("currentPointNotes", value)}
            placeholder="Isca, horario, estrutura, cuidado de acesso"
          />
          <View style={styles.coordinateGrid}>
            <View style={styles.coordinateField}>
              <TextField
                label="Latitude"
                value={routeForm.currentLatitude}
                onChangeText={(value) => updateField("currentLatitude", value)}
                placeholder="-22.734"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordinateField}>
              <TextField
                label="Longitude"
                value={routeForm.currentLongitude}
                onChangeText={(value) => updateField("currentLongitude", value)}
                placeholder="-47.647"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonStack}>
            <PrimaryButton label="Usar minha localizacao" onPress={onUseCurrentLocation} variant="secondary" />
            <PrimaryButton label="Adicionar ponto" onPress={onAddPoint} />
          </View>
        </View>

        {routeForm.points.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nenhum ponto adicionado</Text>
            <Text style={styles.emptyStateText}>
              Adicione pelo menos uma localização para salvar o ponto.
            </Text>
          </View>
        ) : null}

        {routeForm.points.map((point, index) => (
          <View key={point.id} style={styles.draftPointCard}>
            <View style={styles.routeHeader}>
              <View style={styles.tournamentTitleWrap}>
                <Text style={styles.routeTitle}>
                  {index + 1}. {point.title}
                </Text>
                <Text style={styles.routeMeta}>
                  {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => onRemovePoint(point.id)}>
                <Text style={styles.removePointText}>Remover</Text>
              </Pressable>
            </View>
            {point.notes ? <Text style={styles.tournamentDescription}>{point.notes}</Text> : null}
          </View>
        ))}
      </View>

      <PrimaryButton
        label={saving ? "Salvando ponto..." : "Publicar ponto"}
        onPress={onSaveRoute}
        disabled={saving}
      />
    </ScrollView>
  );
}

function ProfileScreen({
  email,
  demoMode,
  onSignOut
}: {
  email: string;
  demoMode: boolean;
  onSignOut: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.profileHeader}>
        <Image source={mark} resizeMode="contain" style={styles.profileMark} />
        <Text style={styles.profileName}>Pescador AnglerFish</Text>
        <Text style={styles.profileEmail}>{demoMode ? "Modo demonstração" : email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próximos módulos</Text>
        <Text style={styles.bodyText}>
          Perfil completo, histórico de capturas, conquistas, clubes e documentos de validação serão adicionados nas próximas versões.
        </Text>
      </View>

      <PrimaryButton label="Sair" onPress={onSignOut} variant="ghost" />
    </ScrollView>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("campeonato");
  const [tournaments, setTournaments] = useState<Tournament[]>([betaTournament]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(betaTournament.id);
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<string[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [captureForm, setCaptureForm] = useState<CaptureForm>(createEmptyForm());
  const [submissions, setSubmissions] = useState<CaptureSubmission[]>(seedRanking);
  const [mySubmissions, setMySubmissions] = useState<CaptureSubmission[]>([]);
  const [loadingMySubmissions, setLoadingMySubmissions] = useState(false);
  const [fishingRoutes, setFishingRoutes] = useState<FishingRoute[]>(demoFishingRoutes);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(demoFishingRoutes[0]?.id ?? null);
  const [routeForm, setRouteForm] = useState<FishingRouteForm>(createEmptyRouteForm());
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [savingRoute, setSavingRoute] = useState(false);
  const [unlockingRouteId, setUnlockingRouteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const authenticated = Boolean(session || demoMode);
  const email = session?.user.email ?? "";
  const selectedTournament = useMemo(
    () =>
      tournaments.find((tournament) => tournament.id === selectedTournamentId) ??
      tournaments[0] ??
      null,
    [selectedTournamentId, tournaments]
  );
  const joinedSelectedTournament = Boolean(
    selectedTournament &&
      (demoMode || joinedTournamentIds.includes(selectedTournament.id))
  );

  const approvedSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === "approved"),
    [submissions]
  );

  useEffect(() => {
    if (!authenticated) {
      setMySubmissions([]);
      return;
    }

    void loadMySubmissions();
  }, [authenticated, demoMode, session?.user.id]);

  useEffect(() => {
    if (!authenticated) {
      setTournaments([betaTournament]);
      setSelectedTournamentId(betaTournament.id);
      setJoinedTournamentIds([]);
      setCaptureForm(createEmptyForm());
      return;
    }

    void loadTournamentPanel();
  }, [authenticated, demoMode, session?.user.id]);

  useEffect(() => {
    if (!authenticated) {
      setFishingRoutes(demoFishingRoutes);
      setSelectedRouteId(demoFishingRoutes[0]?.id ?? null);
      setRouteForm(createEmptyRouteForm());
      return;
    }

    void loadFishingRoutes();
  }, [authenticated, demoMode, session?.user.id]);

  useEffect(() => {
    if (!selectedTournament) {
      return;
    }

    setCaptureForm((current) => ({
      ...current,
      codeSpoken: current.codeSpoken || selectedTournament.code
    }));
  }, [selectedTournament?.id]);

  async function loadTournamentPanel(showError = false) {
    if (demoMode) {
      setTournaments([betaTournament]);
      setSelectedTournamentId(betaTournament.id);
      setJoinedTournamentIds([betaTournament.id]);
      return;
    }

    if (!supabase || !session?.user) {
      setTournaments([betaTournament]);
      setSelectedTournamentId(betaTournament.id);
      setJoinedTournamentIds([]);
      return;
    }

    setLoadingTournaments(true);

    const [
      { data: tournamentsData, error: tournamentsError },
      { data: participantsData, error: participantsError }
    ] = await Promise.all([
      supabase
        .from("tournaments")
        .select("*")
        .in("status", ["active", "completed"])
        .order("created_at", { ascending: false }),
      supabase
        .from("tournament_participants")
        .select("tournament_id")
        .eq("user_id", session.user.id)
    ]);

    setLoadingTournaments(false);

    if (tournamentsError || participantsError) {
      if (showError) {
        Alert.alert(
          "Não foi possível atualizar",
          tournamentsError?.message ?? participantsError?.message ?? "Tente novamente."
        );
      }
      return;
    }

    const nextTournaments = ((tournamentsData ?? []) as TournamentRow[]).map(mapTournament);
    const nextJoinedIds = ((participantsData ?? []) as ParticipantRow[]).map(
      (participant) => participant.tournament_id
    );

    setTournaments(nextTournaments);
    setJoinedTournamentIds(nextJoinedIds);
    setSelectedTournamentId((current) => {
      if (nextTournaments.some((tournament) => tournament.id === current)) {
        return current;
      }

      return nextTournaments[0]?.id ?? betaTournament.id;
    });
  }

  async function loadMySubmissions(showError = false) {
    if (demoMode) {
      return;
    }

    if (!supabase || !session?.user) {
      setMySubmissions([]);
      return;
    }

    setLoadingMySubmissions(true);

    const { data, error } = await supabase
      .from("catch_submissions")
      .select("id, tournament_id, fish_species, length_cm, city, state, modality, status, reviewer_notes, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setLoadingMySubmissions(false);

    if (error) {
      if (showError) {
        Alert.alert("Não foi possível atualizar", error.message);
      }
      return;
    }

    setMySubmissions(
      ((data ?? []) as CatchSubmissionRow[]).map((row) =>
        mapCatchSubmission(row, email || "Você")
      )
    );
  }

  async function loadFishingRoutes(showError = false) {
    if (demoMode) {
      setFishingRoutes(demoFishingRoutes);
      setSelectedRouteId((current) => current ?? demoFishingRoutes[0]?.id ?? null);
      return;
    }

    if (!supabase || !session?.user) {
      setFishingRoutes(demoFishingRoutes);
      setSelectedRouteId(demoFishingRoutes[0]?.id ?? null);
      return;
    }

    setLoadingRoutes(true);

    const { data: routesData, error: routesError } = await supabase
      .from("fishing_routes")
      .select(
        "id, owner_id, title, description, city, state, modality, target_species, difficulty, price_cents, is_published, active_until, preview_lat, preview_lng, created_at, fishing_route_points(id, title, notes, latitude, longitude, sort_order)"
      )
      .order("created_at", { ascending: false });

    if (routesError) {
      setLoadingRoutes(false);
      if (showError) {
        Alert.alert(
          "Nao foi possivel atualizar pontos",
          "Confira se o SQL do mapa foi executado no Supabase."
        );
      }
      return;
    }

    const routeIds = ((routesData ?? []) as FishingRouteRow[]).map((route) => route.id);
    const { data: unlocksData } =
      routeIds.length > 0
        ? await supabase
            .from("fishing_route_unlocks")
            .select("route_id")
            .eq("buyer_id", session.user.id)
            .eq("status", "unlocked")
            .in("route_id", routeIds)
        : { data: [] };

    setLoadingRoutes(false);

    const unlockedRouteIds = new Set(
      ((unlocksData ?? []) as FishingRouteUnlockRow[]).map((unlock) => unlock.route_id)
    );
    const nextRoutes = ((routesData ?? []) as FishingRouteRow[])
      .map((row) => mapFishingRoute(row, session.user.id, unlockedRouteIds))
      .filter(shouldShowRoute);

    setFishingRoutes(nextRoutes);
    setSelectedRouteId((current) => {
      if (current && nextRoutes.some((route) => route.id === current)) {
        return current;
      }

      return nextRoutes[0]?.id ?? null;
    });
  }

  async function addCurrentLocationToRouteForm() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permissao necessaria", "Autorize a localizacao para capturar o ponto atual.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      setRouteForm((current) => ({
        ...current,
        currentLatitude: location.coords.latitude.toFixed(6),
        currentLongitude: location.coords.longitude.toFixed(6)
      }));
    } catch (error) {
      Alert.alert(
        "Nao foi possivel pegar sua localizacao",
        error instanceof Error ? error.message : "Digite latitude e longitude manualmente."
      );
    }
  }

  function addPointToRouteForm() {
    const latitude = normalizeDecimal(routeForm.currentLatitude);
    const longitude = normalizeDecimal(routeForm.currentLongitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      Alert.alert("Coordenadas invalidas", "Informe latitude e longitude validas.");
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      Alert.alert("Coordenadas invalidas", "Latitude deve ficar entre -90 e 90, e longitude entre -180 e 180.");
      return;
    }

    const nextPoint: FishingRouteDraftPoint = {
      id: `draft-${Date.now()}`,
      title: routeForm.currentPointTitle.trim() || `Ponto ${routeForm.points.length + 1}`,
      notes: routeForm.currentPointNotes.trim(),
      latitude,
      longitude
    };

    setRouteForm((current) => ({
      ...current,
      points: [...current.points, nextPoint],
      currentPointTitle: `Ponto ${current.points.length + 2}`,
      currentPointNotes: "",
      currentLatitude: "",
      currentLongitude: ""
    }));
  }

  function removePointFromRouteForm(pointId: string) {
    setRouteForm((current) => ({
      ...current,
      points: current.points.filter((point) => point.id !== pointId)
    }));
  }

  async function saveFishingRoute() {
    const priceCents = parsePriceToCents(routeForm.price);
    const saleDurationDays = parseSaleDurationDays(routeForm.saleDurationDays);

    if (!routeForm.title.trim() || !routeForm.city.trim() || !routeForm.state.trim()) {
      Alert.alert("Complete o ponto", "Informe nome, cidade e estado.");
      return;
    }

    if (!routeForm.description.trim()) {
      Alert.alert("Complete o ponto", "Explique por que esse ponto vale a pena.");
      return;
    }

    if (Number.isNaN(priceCents)) {
      Alert.alert("Preco invalido", "Use um valor como 29,90 ou deixe vazio para gratuita.");
      return;
    }

    if (Number.isNaN(saleDurationDays)) {
      Alert.alert("Prazo invalido", "Escolha por quantos dias o ponto ficara ativo para compra.");
      return;
    }

    if (routeForm.points.length === 0) {
      Alert.alert("Adicione a localizacao", "Inclua pelo menos uma localizacao para salvar o ponto.");
      return;
    }

    const targetSpecies = routeForm.targetSpecies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const firstPoint = routeForm.points[0];
    const activeUntil = addDays(saleDurationDays);

    setSavingRoute(true);

    try {
      if (!supabase || demoMode || !session?.user) {
        const localRoute: FishingRoute = {
          id: `local-route-${Date.now()}`,
          ownerId: "local-user",
          title: routeForm.title.trim(),
          description: routeForm.description.trim(),
          city: routeForm.city.trim(),
          state: routeForm.state.trim().toUpperCase(),
          modality: routeForm.modality.trim() || "Pesca livre",
          targetSpecies,
          difficulty: routeForm.difficulty,
          priceCents,
          isPublished: routeForm.isPublished,
          activeUntil,
          previewLatitude: firstPoint.latitude,
          previewLongitude: firstPoint.longitude,
          points: routeForm.points.map((point, index) => ({
            id: point.id,
            title: point.title,
            notes: point.notes,
            latitude: point.latitude,
            longitude: point.longitude,
            sortOrder: index + 1
          })),
          unlocked: true,
          owned: true,
          createdAt: new Date().toISOString()
        };

        setFishingRoutes((current) => [localRoute, ...current]);
        setSelectedRouteId(localRoute.id);
        setRouteForm(createEmptyRouteForm());
        Alert.alert("Ponto criado", "Seu ponto foi salvo em modo demonstracao.");
        return;
      }

      const { data: routeData, error: routeError } = await supabase
        .from("fishing_routes")
        .insert({
          owner_id: session.user.id,
          title: routeForm.title.trim(),
          description: routeForm.description.trim(),
          city: routeForm.city.trim(),
          state: routeForm.state.trim().toUpperCase(),
          modality: routeForm.modality.trim() || "Pesca livre",
          target_species: targetSpecies,
          difficulty: routeForm.difficulty,
          price_cents: priceCents,
          is_published: routeForm.isPublished,
          active_until: activeUntil,
          preview_lat: firstPoint.latitude,
          preview_lng: firstPoint.longitude
        })
        .select("id")
        .single();

      if (routeError || !routeData) {
        throw routeError ?? new Error("Nao foi possivel criar o ponto.");
      }

      const { error: pointsError } = await supabase.from("fishing_route_points").insert(
        routeForm.points.map((point, index) => ({
          route_id: routeData.id,
          title: point.title,
          notes: point.notes,
          latitude: point.latitude,
          longitude: point.longitude,
          sort_order: index + 1
        }))
      );

      if (pointsError) {
        throw pointsError;
      }

      setRouteForm(createEmptyRouteForm());
      Alert.alert("Ponto publicado", "Seu ponto ja aparece no mapa para outros pescadores.");
      await loadFishingRoutes();
      setSelectedRouteId(routeData.id);
    } catch (error) {
      Alert.alert(
        "Nao foi possivel salvar",
        error instanceof Error
          ? error.message
          : "Confira se o SQL do marketplace de pontos foi executado no Supabase."
      );
    } finally {
      setSavingRoute(false);
    }
  }

  async function unlockFishingRoute(routeId: string) {
    const route = fishingRoutes.find((item) => item.id === routeId);

    if (!route) {
      Alert.alert("Ponto nao encontrado", "Atualize a lista e tente novamente.");
      return;
    }

    if (route.unlocked) {
      setSelectedRouteId(routeId);
      return;
    }

    if (new Date(route.activeUntil).getTime() <= Date.now()) {
      Alert.alert("Venda expirada", "Esse ponto nao esta mais disponivel para desbloqueio.");
      return;
    }

    setUnlockingRouteId(routeId);

    try {
      if (supabase && session?.user && !demoMode) {
        const { error } = await supabase.from("fishing_route_unlocks").insert({
          route_id: routeId,
          buyer_id: session.user.id,
          price_cents: route.priceCents,
          status: "unlocked"
        });

        if (error && error.code !== "23505") {
          throw error;
        }

        await loadFishingRoutes();
      } else {
        setFishingRoutes((current) =>
          current.map((item) =>
            item.id === routeId
              ? {
                  ...item,
                  unlocked: true
                }
              : item
          )
        );
      }

      setSelectedRouteId(routeId);
      Alert.alert(
        "Ponto desbloqueado",
        "Desbloqueio demo feito. Depois conectamos isso ao Mercado Pago para cobrar de verdade."
      );
    } catch (error) {
      Alert.alert(
        "Nao foi possivel desbloquear",
        error instanceof Error ? error.message : "Tente novamente."
      );
    } finally {
      setUnlockingRouteId(null);
    }
  }

  async function joinTournament(tournamentId: string) {
    const tournament = tournaments.find((item) => item.id === tournamentId);

    if (!tournament) {
      Alert.alert("Torneio não encontrado", "Atualize a lista de torneios e tente novamente.");
      return;
    }

    if (!supabase || demoMode || !session?.user) {
      setJoinedTournamentIds((current) => [...new Set([...current, tournamentId])]);
      Alert.alert("Participação confirmada", `Você entrou em ${tournament.name}.`);
      return;
    }

    if (joinedTournamentIds.includes(tournamentId)) {
      Alert.alert("Você já está dentro", "Esse torneio já está liberado para envio de capturas.");
      return;
    }

    const { error } = await supabase.from("tournament_participants").insert({
      tournament_id: tournamentId,
      user_id: session.user.id
    });

    if (error && error.code !== "23505") {
      Alert.alert("Não foi possível participar", "Confira se o SQL do app mobile foi executado no Supabase.");
      return;
    }

    setJoinedTournamentIds((current) => [...new Set([...current, tournamentId])]);
    Alert.alert("Participação confirmada", `Você entrou em ${tournament.name}.`);
  }

  function startCapture() {
    if (!selectedTournament) {
      Alert.alert("Escolha um torneio", "Selecione um campeonato antes de enviar uma captura.");
      setScreen("campeonato");
      return;
    }

    if (!joinedSelectedTournament) {
      Alert.alert(
        "Entre no torneio primeiro",
        "Confirme sua participação no campeonato antes de enviar uma captura."
      );
      setScreen("campeonato");
      return;
    }

    setCaptureForm(createEmptyForm(selectedTournament));
    setScreen("captura");
  }

  async function submitCapture() {
    if (!selectedTournament) {
      Alert.alert("Escolha um torneio", "Selecione um campeonato antes de enviar uma captura.");
      setScreen("campeonato");
      return;
    }

    if (!joinedSelectedTournament) {
      Alert.alert(
        "Entre no torneio primeiro",
        "Confirme sua participação no campeonato antes de enviar uma captura."
      );
      setScreen("campeonato");
      return;
    }

    const lengthCm = Number(captureForm.lengthCm.replace(",", "."));

    if (
      !captureForm.fishSpecies ||
      !captureForm.lengthCm ||
      !captureForm.city ||
      !captureForm.state ||
      !captureForm.modality ||
      !captureForm.codeSpoken
    ) {
      Alert.alert("Complete os dados", "Preencha espécie, tamanho, local, modalidade e código.");
      return;
    }

    if (Number.isNaN(lengthCm) || lengthCm <= 0) {
      Alert.alert("Medida inválida", "Informe o tamanho do peixe em centímetros.");
      return;
    }

    if (!captureForm.photo || !captureForm.video) {
      Alert.alert("Foto e vídeo obrigatórios", "Selecione uma foto na régua e um vídeo curto.");
      return;
    }

    setSubmitting(true);
    setSubmitStatus("Preparando envio...");

    try {
      if (supabase && session?.user && !demoMode) {
        setSubmitStatus("Enviando foto da captura...");
        const photoPath = await uploadAsset(
          captureForm.photo,
          "photo",
          session.user.id,
          selectedTournament.id
        );

        setSubmitStatus("Enviando vídeo de validação...");
        const videoPath = await uploadAsset(
          captureForm.video,
          "video",
          session.user.id,
          selectedTournament.id
        );

        setSubmitStatus("Salvando captura para análise...");
        const { error } = await supabase.from("catch_submissions").insert({
          tournament_id: selectedTournament.id,
          user_id: session.user.id,
          fish_species: captureForm.fishSpecies.trim(),
          length_cm: lengthCm,
          city: captureForm.city.trim(),
          state: captureForm.state.trim().toUpperCase(),
          modality: captureForm.modality.trim(),
          code_spoken: captureForm.codeSpoken.trim().toUpperCase(),
          photo_path: photoPath,
          video_path: videoPath,
          status: "pending"
        });

        if (error) {
          throw error;
        }
      } else {
        setSubmitStatus("Salvando captura em modo demonstração...");
      }

      setSubmissions((current) => [
        {
          id: `local-${Date.now()}`,
          anglerName: demoMode ? "Você no modo demo" : email || "Você",
          fishSpecies: captureForm.fishSpecies.trim(),
          lengthCm,
          city: captureForm.city.trim(),
          state: captureForm.state.trim().toUpperCase(),
          modality: captureForm.modality.trim(),
          status: "pending",
          createdAt: new Date().toISOString()
        },
        ...current
      ]);
      setMySubmissions((current) => [
        {
          id: `local-${Date.now()}`,
          anglerName: demoMode ? "Você no modo demo" : email || "Você",
          fishSpecies: captureForm.fishSpecies.trim(),
          lengthCm,
          city: captureForm.city.trim(),
          state: captureForm.state.trim().toUpperCase(),
          modality: captureForm.modality.trim(),
          status: "pending",
          createdAt: new Date().toISOString()
        },
        ...current
      ]);
      setCaptureForm(createEmptyForm(selectedTournament));
      Alert.alert("Captura enviada", "Seu registro entrou na fila de análise.");
      setScreen("envios");
    } catch (error) {
      Alert.alert(
        "Não foi possível enviar",
        error instanceof Error
          ? error.message
          : "Confira se as tabelas e o bucket catch-media existem no Supabase."
      );
    } finally {
      setSubmitting(false);
      setSubmitStatus(null);
    }
  }

  async function signOut() {
    if (supabase && session) {
      await supabase.auth.signOut();
    }

    setDemoMode(false);
    setSession(null);
    setScreen("campeonato");
  }

  if (!authenticated) {
    return <AuthScreen onDemoMode={() => setDemoMode(true)} onSession={setSession} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appHeader}>
        <Image source={logo} resizeMode="contain" style={styles.headerLogo} />
        <Text style={styles.headerBadge}>{demoMode ? "Demo" : "Beta"}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {[
          ["campeonato", "Torneio"],
          ["captura", "Captura"],
          ["envios", "Envios"],
          ["mapa", "Mapa"],
          ["ranking", "Ranking"],
          ["perfil", "Perfil"]
        ].map(([key, label]) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            onPress={() => {
              if (key === "captura") {
                if (screen !== "captura") {
                  startCapture();
                }
                return;
              }

              setScreen(key as AppScreen);
            }}
            style={[styles.tab, screen === key && styles.activeTab]}
          >
            <Text style={[styles.tabText, screen === key && styles.activeTabText]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {screen === "campeonato" ? (
        <TournamentScreen
          tournaments={tournaments}
          selectedTournament={selectedTournament}
          joinedTournamentIds={joinedTournamentIds}
          loading={loadingTournaments}
          demoMode={demoMode}
          onSelectTournament={setSelectedTournamentId}
          onJoin={joinTournament}
          onStartCapture={startCapture}
          onRefresh={() => void loadTournamentPanel(true)}
        />
      ) : null}
      {screen === "captura" ? (
        <CaptureScreen
          tournament={selectedTournament}
          form={captureForm}
          setForm={setCaptureForm}
          onSubmit={submitCapture}
          loading={submitting}
          submitStatus={submitStatus}
        />
      ) : null}
      {screen === "envios" ? (
        <EnviosScreen
          submissions={mySubmissions}
          loading={loadingMySubmissions}
          onRefresh={() => void loadMySubmissions(true)}
        />
      ) : null}
      {screen === "mapa" ? (
        <FishingRoutesScreen
          routes={fishingRoutes}
          selectedRouteId={selectedRouteId}
          routeForm={routeForm}
          loading={loadingRoutes}
          saving={savingRoute}
          unlockingRouteId={unlockingRouteId}
          onRefresh={() => void loadFishingRoutes(true)}
          onSelectRoute={setSelectedRouteId}
          onUnlockRoute={unlockFishingRoute}
          onRouteFormChange={setRouteForm}
          onUseCurrentLocation={() => void addCurrentLocationToRouteForm()}
          onAddPoint={addPointToRouteForm}
          onRemovePoint={removePointFromRouteForm}
          onSaveRoute={() => void saveFishingRoute()}
        />
      ) : null}
      {screen === "ranking" ? <RankingScreen submissions={approvedSubmissions} /> : null}
      {screen === "perfil" ? (
        <ProfileScreen email={email} demoMode={demoMode} onSignOut={signOut} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.foam
  },
  authHero: {
    paddingHorizontal: spacing.page,
    paddingBottom: 28,
    paddingTop: 24
  },
  logo: {
    height: 58,
    width: 230
  },
  authTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    marginTop: 22
  },
  authText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12
  },
  authContent: {
    flex: 1
  },
  authForm: {
    gap: 14,
    padding: spacing.page
  },
  warningBox: {
    backgroundColor: "#fff8e7",
    borderColor: "#f7d37a",
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: spacing.card
  },
  warningTitle: {
    color: colors.midnight,
    fontSize: 15,
    fontWeight: "800"
  },
  warningText: {
    color: colors.slateDark,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6
  },
  field: {
    gap: 7
  },
  label: {
    color: colors.midnight,
    fontSize: 13,
    fontWeight: "800"
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.midnight,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14
  },
  buttonStack: {
    gap: 10
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.reef,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16
  },
  secondaryButton: {
    backgroundColor: colors.midnight
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderColor: colors.border,
    borderWidth: 1
  },
  disabledButton: {
    opacity: 0.58
  },
  pressedButton: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }]
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800"
  },
  secondaryButtonText: {
    color: colors.white
  },
  ghostButtonText: {
    color: colors.midnight
  },
  loader: {
    marginVertical: 12
  },
  appHeader: {
    alignItems: "center",
    backgroundColor: colors.midnight,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.page,
    paddingVertical: 14
  },
  headerLogo: {
    height: 38,
    width: 160
  },
  headerBadge: {
    backgroundColor: "rgba(8,201,139,0.16)",
    borderColor: "rgba(8,201,139,0.45)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#b7ffe7",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  tabsScroll: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    maxHeight: 60
  },
  tabs: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  tab: {
    alignItems: "center",
    borderRadius: 999,
    minWidth: 76,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  activeTab: {
    backgroundColor: colors.midnight
  },
  tabText: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: "800"
  },
  activeTabText: {
    color: colors.white
  },
  screenContent: {
    gap: 14,
    padding: spacing.page,
    paddingBottom: 36
  },
  heroCard: {
    borderRadius: 18,
    minHeight: 260,
    overflow: "hidden",
    padding: 20
  },
  heroImage: {
    borderRadius: 18
  },
  heroImageCard: {
    padding: 0
  },
  heroCoverOverlay: {
    flex: 1,
    padding: 20
  },
  heroMark: {
    alignSelf: "flex-end",
    height: 82,
    opacity: 0.9,
    width: 82
  },
  heroEyebrow: {
    color: "#b7ffe7",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    marginTop: 8
  },
  heroDescription: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18
  },
  pill: {
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  activePill: {
    backgroundColor: colors.reef,
    borderColor: colors.reef
  },
  pillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800"
  },
  activePillText: {
    color: colors.midnight
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: spacing.card
  },
  cardTitle: {
    color: colors.midnight,
    fontSize: 18,
    fontWeight: "900"
  },
  bodyText: {
    color: colors.slateDark,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8
  },
  tournamentCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    gap: 12,
    padding: spacing.card
  },
  selectedTournamentCard: {
    borderColor: colors.reef,
    borderWidth: 2
  },
  tournamentHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  tournamentTitleWrap: {
    flex: 1
  },
  tournamentTitle: {
    color: colors.midnight,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23
  },
  tournamentMeta: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  tournamentDescription: {
    color: colors.slateDark,
    fontSize: 13,
    lineHeight: 20
  },
  tournamentCover: {
    borderRadius: 12,
    height: 118,
    width: "100%"
  },
  tournamentFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tournamentBadge: {
    backgroundColor: colors.foam,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  selectedTournamentBadge: {
    backgroundColor: colors.reef,
    borderColor: colors.reef
  },
  tournamentBadgeText: {
    color: colors.midnight,
    fontSize: 11,
    fontWeight: "900"
  },
  selectedTournamentBadgeText: {
    color: colors.midnight
  },
  mapCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    overflow: "hidden"
  },
  map: {
    height: 300,
    width: "100%"
  },
  mapLegend: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 12
  },
  mapHintText: {
    color: colors.midnight,
    flexBasis: "100%",
    fontSize: 12,
    fontWeight: "900"
  },
  mapLegendText: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "800"
  },
  routeCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    gap: 12,
    padding: spacing.card
  },
  selectedRouteCard: {
    borderColor: colors.reef,
    borderWidth: 2
  },
  routeHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  routeTitle: {
    color: colors.midnight,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23
  },
  routeMeta: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 4
  },
  routePriceBadge: {
    backgroundColor: "#e8fbf4",
    borderColor: "#6eddb7",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  freeRouteBadge: {
    backgroundColor: colors.foam,
    borderColor: colors.border
  },
  expiredRouteBadge: {
    backgroundColor: "#fff0f0",
    borderColor: "#f0a0a0"
  },
  expiredRouteBadgeText: {
    color: colors.danger
  },
  routePriceText: {
    color: colors.midnight,
    fontSize: 11,
    fontWeight: "900"
  },
  routeStats: {
    flexDirection: "row",
    gap: 10
  },
  formSection: {
    gap: 12,
    marginTop: 14
  },
  choiceGroup: {
    gap: 8
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  choiceChip: {
    backgroundColor: colors.foam,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  activeChoiceChip: {
    backgroundColor: colors.midnight,
    borderColor: colors.midnight
  },
  choiceChipText: {
    color: colors.midnight,
    fontSize: 12,
    fontWeight: "900"
  },
  activeChoiceChipText: {
    color: colors.white
  },
  coordinateGrid: {
    flexDirection: "row",
    gap: 10
  },
  coordinateField: {
    flex: 1
  },
  draftPointCard: {
    backgroundColor: colors.foam,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
    padding: 12
  },
  removePointText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "900"
  },
  joinBadge: {
    backgroundColor: "#fff8e1",
    borderColor: "#f1c65b",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  joinedBadge: {
    backgroundColor: "#e8fbf4",
    borderColor: "#6eddb7"
  },
  joinBadgeText: {
    color: "#775500",
    fontSize: 11,
    fontWeight: "900"
  },
  joinedBadgeText: {
    color: "#04724d"
  },
  ruleRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14
  },
  ruleIndex: {
    backgroundColor: colors.reef,
    borderRadius: 8,
    color: colors.midnight,
    fontSize: 12,
    fontWeight: "900",
    height: 24,
    overflow: "hidden",
    paddingTop: 4,
    textAlign: "center",
    width: 24
  },
  ruleText: {
    color: colors.slateDark,
    flex: 1,
    fontSize: 14,
    lineHeight: 21
  },
  mediaGrid: {
    gap: 12
  },
  mediaCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: spacing.card
  },
  mediaTitle: {
    color: colors.midnight,
    fontSize: 15,
    fontWeight: "900"
  },
  mediaText: {
    color: colors.slate,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6
  },
  uploadStatus: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: spacing.card
  },
  uploadStatusTextWrap: {
    flex: 1
  },
  uploadStatusTitle: {
    color: colors.midnight,
    fontSize: 15,
    fontWeight: "900"
  },
  uploadStatusText: {
    color: colors.slate,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3
  },
  emptyState: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: spacing.card
  },
  emptyStateTitle: {
    color: colors.midnight,
    fontSize: 16,
    fontWeight: "900"
  },
  emptyStateText: {
    color: colors.slate,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6
  },
  submissionCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    gap: 14,
    padding: spacing.card
  },
  submissionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  submissionTitle: {
    color: colors.midnight,
    fontSize: 17,
    fontWeight: "900"
  },
  submissionMeta: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900"
  },
  pendingBadge: {
    backgroundColor: "#fff8e1",
    borderColor: "#f1c65b"
  },
  pendingBadgeText: {
    color: "#775500"
  },
  approvedBadge: {
    backgroundColor: "#e8fbf4",
    borderColor: "#6eddb7"
  },
  approvedBadgeText: {
    color: "#04724d"
  },
  rejectedBadge: {
    backgroundColor: "#fff0f0",
    borderColor: "#f0a0a0"
  },
  rejectedBadgeText: {
    color: "#a62222"
  },
  submissionDetails: {
    flexDirection: "row",
    gap: 10
  },
  submissionDetail: {
    backgroundColor: colors.foam,
    borderRadius: 12,
    flex: 1,
    padding: 12
  },
  submissionDetailLabel: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  submissionDetailValue: {
    color: colors.midnight,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4
  },
  reviewNote: {
    backgroundColor: "#f7fbff",
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12
  },
  reviewNoteLabel: {
    color: colors.midnight,
    fontSize: 12,
    fontWeight: "900"
  },
  reviewNoteText: {
    color: colors.slateDark,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  rankCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  rankPosition: {
    alignItems: "center",
    backgroundColor: colors.midnight,
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  rankPositionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900"
  },
  rankInfo: {
    flex: 1
  },
  rankName: {
    color: colors.midnight,
    fontSize: 15,
    fontWeight: "900"
  },
  rankMeta: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2
  },
  rankLength: {
    alignItems: "flex-end"
  },
  rankLengthValue: {
    color: colors.reef,
    fontSize: 22,
    fontWeight: "900"
  },
  rankLengthUnit: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: "800"
  },
  profileHeader: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: 22
  },
  profileMark: {
    height: 92,
    width: 92
  },
  profileName: {
    color: colors.midnight,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12
  },
  profileEmail: {
    color: colors.slate,
    fontSize: 13,
    marginTop: 4
  }
});
