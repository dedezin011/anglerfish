import type { ImagePickerAsset } from "expo-image-picker";

export type Tournament = {
  id: string;
  name: string;
  slug?: string;
  code: string;
  status: "active" | "draft" | "completed";
  dateRange: string;
  prize: string;
  description: string;
  coverImageUrl?: string | null;
  rules: string[];
};

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type CaptureSubmission = {
  id: string;
  anglerName: string;
  fishSpecies: string;
  lengthCm: number;
  city: string;
  state: string;
  modality: string;
  status: SubmissionStatus;
  createdAt: string;
  reviewerNotes?: string | null;
};

export type CaptureForm = {
  fishSpecies: string;
  lengthCm: string;
  city: string;
  state: string;
  modality: string;
  codeSpoken: string;
  photo: ImagePickerAsset | null;
  video: ImagePickerAsset | null;
};

export type FishingRouteDifficulty = "facil" | "media" | "dificil";

export type FishingRoutePoint = {
  id: string;
  title: string;
  notes: string;
  latitude: number;
  longitude: number;
  sortOrder: number;
};

export type FishingRoute = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  city: string;
  state: string;
  modality: string;
  targetSpecies: string[];
  difficulty: FishingRouteDifficulty;
  priceCents: number;
  isPublished: boolean;
  activeUntil: string;
  previewLatitude: number;
  previewLongitude: number;
  points: FishingRoutePoint[];
  unlocked: boolean;
  owned: boolean;
  createdAt: string;
};

export type FishingRouteDraftPoint = {
  id: string;
  title: string;
  notes: string;
  latitude: number;
  longitude: number;
};

export type FishingRouteForm = {
  title: string;
  description: string;
  city: string;
  state: string;
  modality: string;
  targetSpecies: string;
  difficulty: FishingRouteDifficulty;
  price: string;
  saleDurationDays: string;
  isPublished: boolean;
  currentPointTitle: string;
  currentPointNotes: string;
  currentLatitude: string;
  currentLongitude: string;
  points: FishingRouteDraftPoint[];
};
