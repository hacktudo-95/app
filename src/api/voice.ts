import { fetch } from "expo/fetch";
import { File } from "expo-file-system";

import { API_URL, CLASS_SCOPE } from "../config";
import type { ConversationMessage, VoiceTurn } from "../types";

async function parseResponse(response: Response): Promise<VoiceTurn> {
  if (!response.ok) {
    const detail = (await response.text()).trim();
    throw new Error(detail || `Erro HTTP ${response.status}`);
  }

  return (await response.json()) as VoiceTurn;
}

export async function startLesson(): Promise<VoiceTurn> {
  const response = await fetch(`${API_URL}/v1/voice/start`, {
    method: "POST",
  });
  return parseResponse(response);
}

export async function sendVoiceTurn(
  recordingUri: string,
  history: ConversationMessage[],
): Promise<VoiceTurn> {
  const form = new FormData();
  form.append("institution_id", CLASS_SCOPE.institutionId);
  form.append("class_id", CLASS_SCOPE.classId);
  form.append("subject", CLASS_SCOPE.subject);
  form.append("history", JSON.stringify(history.slice(-6)));
  form.append("audio", new File(recordingUri));

  const response = await fetch(`${API_URL}/v1/voice/turn`, {
    method: "POST",
    body: form,
  });
  return parseResponse(response);
}

