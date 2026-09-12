import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File, Paths } from "expo-file-system";
import { toByteArray } from "base64-js";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { sendVoiceTurn, startLesson } from "./src/api/voice";
import { ConversationCard } from "./src/components/ConversationCard";
import { ProfessorAvatar } from "./src/components/ProfessorAvatar";
import type { AvatarState, ConversationMessage, Source, VoiceTurn } from "./src/types";

export default function App() {
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const player = useAudioPlayer(null, { updateInterval: 150 });
  const playerStatus = useAudioPlayerStatus(player);
  const [avatarState, setAvatarState] = useState<AvatarState>("starting");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const shouldListenAfterAudio = useRef(false);
  const startingRecording = useRef(false);
  const speechProgress =
  playerStatus.duration > 0
    ? playerStatus.currentTime / playerStatus.duration
    : 0;

  const beginListening = useCallback(async () => {
    if (startingRecording.current || recorderState.isRecording) return;
    startingRecording.current = true;
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setAvatarState("listening");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível abrir o microfone.";
      setError(message);
      setAvatarState("error");
    } finally {
      startingRecording.current = false;
    }
  }, [recorder, recorderState.isRecording]);

  const playTurn = useCallback(async (turn: VoiceTurn) => {
    const extension = turn.audio_mime.includes("mpeg") ? "mp3" : "wav";
    const audioFile = new File(Paths.cache, `dora-${Date.now()}.${extension}`);
    audioFile.create({ overwrite: true });
    audioFile.write(toByteArray(turn.audio_base64));
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    shouldListenAfterAudio.current = true;
    setAvatarState("speaking");
    player.replace({ uri: audioFile.uri });
    player.play();
  }, [player]);

  const initialize = useCallback(async () => {
    setError(null);
    setAvatarState("starting");
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error("A permissão do microfone é necessária para conversar com a professora.");
      const greeting = await startLesson();
      setMessages([{ role: "assistant", content: greeting.answer }]);
      await playTurn(greeting);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível entrar na aula.";
      setError(message);
      setAvatarState("error");
    }
  }, [playTurn]);

  useEffect(() => { void initialize(); }, [initialize]);

  useEffect(() => {
    if (playerStatus.didJustFinish && shouldListenAfterAudio.current) {
      shouldListenAfterAudio.current = false;
      void beginListening();
    }
  }, [beginListening, playerStatus.didJustFinish]);

  const finishQuestion = useCallback(async () => {
    if (!recorderState.isRecording) return;
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("A gravação não foi encontrada.");
      setAvatarState("thinking");
      setError(null);
      const turn = await sendVoiceTurn(uri, messages);
      const nextMessages: ConversationMessage[] = [
        ...messages,
        { role: "user", content: turn.transcript },
        { role: "assistant", content: turn.answer },
      ];
      setMessages(nextMessages.slice(-8));
      setSources(turn.sources ?? []);
      await playTurn(turn);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível responder agora.";
      setError(message);
      setAvatarState("error");
    }
  }, [messages, playTurn, recorder, recorderState.isRecording]);

  const action = avatarState === "error" ? initialize : avatarState === "listening" ? finishQuestion : undefined;
  const buttonLabel = avatarState === "error" ? "Tentar novamente" : "Toque quando terminar de falar";

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1FF" />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>AULA DE BIOLOGIA</Text>
          <Text style={styles.title}>Genética e Evolução</Text>
        </View>
        <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>AO VIVO</Text></View>
      </View>

      <ProfessorAvatar state={avatarState} compact={compact} />
      <ConversationCard messages={messages} sources={sources}   speechProgress={speechProgress}   isSpeaking={avatarState === "speaking"}/>

      <View style={styles.controls}>
        {error && <Text style={styles.error}>{error}</Text>}
        {action ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void action()}
            style={({ pressed }) => [styles.button, avatarState === "listening" && styles.listeningButton, pressed && styles.pressedButton]}
          >
            <Text style={styles.mic}>{avatarState === "error" ? "↻" : "■"}</Text>
          </Pressable>
        ) : (
          <View style={styles.progressPill}>
            <ActivityIndicator size="small" color="#7657D5" />
            <Text style={styles.progressText}>{avatarState === "thinking" ? "Consultando a aula" : avatarState === "speaking" ? "Acompanhe a professora" : "Entrando na sala"}</Text>
          </View>
        )}
        <Text style={styles.hint}>
          {avatarState === "listening" ? buttonLabel : avatarState === "thinking" ? "Buscando no material da aula..." : avatarState === "speaking" ? "Quando Dora terminar, o microfone abrirá automaticamente." : avatarState === "error" ? buttonLabel : "Preparando a professora..."}
        </Text>
        {avatarState === "listening" && <Text style={styles.timer}>{Math.round(recorderState.durationMillis / 1000)}s</Text>}
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F1FF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 2 },
  eyebrow: { color: "#7657D5", fontSize: 11, fontWeight: "900", letterSpacing: 1.3 },
  title: { marginTop: 3, color: "#282238", fontSize: 20, fontWeight: "800" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#EA526F" },
  liveText: { color: "#5E5871", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  controls: { flex: 1, minHeight: 118, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 6 },
  button: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#7657D5", alignItems: "center", justifyContent: "center", shadowColor: "#7657D5", shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 7 },
  listeningButton: { backgroundColor: "#36B37E", shadowColor: "#36B37E" },
  pressedButton: { transform: [{ scale: 0.94 }] },
  mic: { color: "#FFFFFF", fontSize: 25, fontWeight: "800" },
  hint: { marginTop: 13, color: "#6D667E", textAlign: "center", fontSize: 13, lineHeight: 18 },
  timer: { marginTop: 5, color: "#36A173", fontWeight: "800" },
  error: { color: "#B93D52", textAlign: "center", marginBottom: 10, fontSize: 13 },
  progressPill: { height: 48, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 19, borderRadius: 24, backgroundColor: "#E9E3FA" },
  progressText: { color: "#6049AA", fontSize: 13, fontWeight: "800" },
});
