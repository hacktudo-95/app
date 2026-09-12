export type AvatarState =
  | "starting"
  | "speaking"
  | "listening"
  | "thinking"
  | "error";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Source = {
  document_id: string;
  title: string;
  subject: string;
  position: number;
};

export type VoiceTurn = {
  transcript: string;
  answer: string;
  audio_base64: string;
  audio_mime: string;
  sources: Source[] | null;
};

