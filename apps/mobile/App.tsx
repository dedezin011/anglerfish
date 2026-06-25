import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";

import { betaTournament, seedRanking } from "./src/data/beta";
import { isSupabaseConfigured, supabase } from "./src/lib/supabase";
import { colors, spacing } from "./src/theme";
import type { CaptureForm, CaptureSubmission } from "./src/types";

type AppScreen = "campeonato" | "captura" | "ranking" | "perfil";

const logo = require("./assets/anglerfish-logo.png");
const mark = require("./assets/anglerfish-mark.png");

const emptyForm: CaptureForm = {
  fishSpecies: "",
  lengthCm: "",
  city: "",
  state: "",
  modality: "Pesca embarcada",
  codeSpoken: betaTournament.code,
  photo: null,
  video: null
};

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

async function uploadAsset({
  uri,
  mimeType,
  fileName
}: ImagePicker.ImagePickerAsset, kind: "photo" | "video", userId: string) {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  const extension =
    fileName?.split(".").pop() ??
    mimeType?.split("/").pop() ??
    (kind === "photo" ? "jpg" : "mp4");
  const path = `${userId}/${betaTournament.id}/${kind}-${Date.now()}.${extension}`;
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
  onStartCapture,
  onJoin
}: {
  onStartCapture: () => void;
  onJoin: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <LinearGradient colors={[colors.midnight, colors.harbor]} style={styles.heroCard}>
        <Image source={mark} resizeMode="contain" style={styles.heroMark} />
        <Text style={styles.heroEyebrow}>Beta ao vivo</Text>
        <Text style={styles.heroTitle}>{betaTournament.name}</Text>
        <Text style={styles.heroDescription}>{betaTournament.description}</Text>
        <View style={styles.heroPills}>
          <Pill label={betaTournament.code} active />
          <Pill label={betaTournament.dateRange} />
        </View>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Premiação</Text>
        <Text style={styles.bodyText}>{betaTournament.prize}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Regras do envio</Text>
        {betaTournament.rules.map((rule, index) => (
          <View key={rule} style={styles.ruleRow}>
            <Text style={styles.ruleIndex}>{index + 1}</Text>
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonStack}>
        <PrimaryButton label="Participar do campeonato" onPress={onJoin} />
        <PrimaryButton label="Enviar captura" onPress={onStartCapture} variant="secondary" />
      </View>
    </ScrollView>
  );
}

function CaptureScreen({
  form,
  setForm,
  onSubmit,
  loading
}: {
  form: CaptureForm;
  setForm: (form: CaptureForm) => void;
  onSubmit: () => void;
  loading: boolean;
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
      quality: kind === "photo" ? 0.8 : 0.6,
      videoMaxDuration: 45
    });

    if (!result.canceled) {
      setForm({ ...form, [kind]: result.assets[0] });
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enviar captura</Text>
        <Text style={styles.bodyText}>
          Use o código {betaTournament.code} no vídeo para ajudar a validar que a captura é do desafio.
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
        placeholder={betaTournament.code}
        autoCapitalize="characters"
      />

      <View style={styles.mediaGrid}>
        <Pressable style={styles.mediaCard} onPress={() => pickMedia("photo")}>
          <Text style={styles.mediaTitle}>Foto na régua</Text>
          <Text style={styles.mediaText}>
            {form.photo ? form.photo.fileName ?? "Foto selecionada" : "Selecionar foto"}
          </Text>
        </Pressable>
        <Pressable style={styles.mediaCard} onPress={() => pickMedia("video")}>
          <Text style={styles.mediaTitle}>Vídeo curto</Text>
          <Text style={styles.mediaText}>
            {form.video ? form.video.fileName ?? "Vídeo selecionado" : "Selecionar vídeo"}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.reef} style={styles.loader} />
      ) : (
        <PrimaryButton label="Enviar para análise" onPress={onSubmit} />
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
  const [captureForm, setCaptureForm] = useState<CaptureForm>(emptyForm);
  const [submissions, setSubmissions] = useState<CaptureSubmission[]>(seedRanking);
  const [submitting, setSubmitting] = useState(false);

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

  const approvedSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === "approved"),
    [submissions]
  );

  async function joinTournament() {
    if (!supabase || demoMode || !session?.user) {
      Alert.alert("Você está no beta", "Participação simulada ativada para este teste.");
      return;
    }

    const { error } = await supabase.from("tournament_participants").upsert({
      tournament_id: betaTournament.id,
      user_id: session.user.id
    });

    if (error) {
      Alert.alert("Não foi possível participar", "Confira se o SQL do app mobile foi executado no Supabase.");
      return;
    }

    Alert.alert("Participação confirmada", "Você entrou no 1º Desafio Beta AnglerFish.");
  }

  async function submitCapture() {
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

    try {
      if (supabase && session?.user && !demoMode) {
        const [photoPath, videoPath] = await Promise.all([
          uploadAsset(captureForm.photo, "photo", session.user.id),
          uploadAsset(captureForm.video, "video", session.user.id)
        ]);

        const { error } = await supabase.from("catch_submissions").insert({
          tournament_id: betaTournament.id,
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
      setCaptureForm(emptyForm);
      Alert.alert("Captura enviada", "Seu registro entrou na fila de análise.");
      setScreen("ranking");
    } catch (error) {
      Alert.alert(
        "Não foi possível enviar",
        error instanceof Error
          ? error.message
          : "Confira se as tabelas e o bucket catch-media existem no Supabase."
      );
    } finally {
      setSubmitting(false);
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

      <View style={styles.tabs}>
        {[
          ["campeonato", "Campeonato"],
          ["captura", "Captura"],
          ["ranking", "Ranking"],
          ["perfil", "Perfil"]
        ].map(([key, label]) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            onPress={() => setScreen(key as AppScreen)}
            style={[styles.tab, screen === key && styles.activeTab]}
          >
            <Text style={[styles.tabText, screen === key && styles.activeTabText]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {screen === "campeonato" ? (
        <TournamentScreen
          onJoin={joinTournament}
          onStartCapture={() => setScreen("captura")}
        />
      ) : null}
      {screen === "captura" ? (
        <CaptureScreen
          form={captureForm}
          setForm={setCaptureForm}
          onSubmit={submitCapture}
          loading={submitting}
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
  tabs: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  tab: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    minHeight: 38,
    justifyContent: "center"
  },
  activeTab: {
    backgroundColor: colors.midnight
  },
  tabText: {
    color: colors.slate,
    fontSize: 12,
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
