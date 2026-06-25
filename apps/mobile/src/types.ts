import type { ImagePickerAsset } from "expo-image-picker";

export type Tournament = {
  id: string;
  name: string;
  code: string;
  status: "active" | "draft" | "completed";
  dateRange: string;
  prize: string;
  description: string;
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
