export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8080"
).replace(/\/$/, "");

export const CLASS_SCOPE = {
  institutionId: "school-1",
  classId: "7a",
  subject: "biologia",
} as const;

