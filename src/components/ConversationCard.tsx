import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { ConversationMessage, Source } from "../types";

type Props = {
  messages: ConversationMessage[];
  sources: Source[];
  isSpeaking: boolean;
  speechProgress: number;
};

export function ConversationCard({
  messages,
  sources,
  isSpeaking,
  speechProgress,
}: Props) {
  const latest = messages.slice(-2);

  const scrollRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Reinicia a posição quando Dora começa uma nova fala.
  useEffect(() => {
    if (!isSpeaking) return;

    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }, [isSpeaking, messages]);

  // Move o texto de acordo com o progresso do áudio.
  useEffect(() => {
    if (!isSpeaking) return;

    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const normalizedProgress = Math.min(
      1,
      Math.max(0, speechProgress),
    );

    scrollRef.current?.scrollTo({
      y: maxScroll * normalizedProgress,
      animated: false,
    });
  }, [
    contentHeight,
    viewportHeight,
    isSpeaking,
    speechProgress,
  ]);

  return (
    <View style={styles.card}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onContentSizeChange={(_, height) => {
          setContentHeight(height);
        }}
        onLayout={(event) => {
          setViewportHeight(event.nativeEvent.layout.height);
        }}
        scrollEnabled={!isSpeaking}
        showsVerticalScrollIndicator={!isSpeaking}
      >
        {latest.map((message, index) => (
          <View
            key={`${message.role}-${index}`}
            style={
              message.role === "user"
                ? styles.userRow
                : styles.teacherRow
            }
          >
            <Text style={styles.author}>
              {message.role === "user" ? "Você" : "Dora"}
            </Text>

            <Text style={styles.message}>
              {message.content}
            </Text>
          </View>
        ))}

        {sources.length > 0 && (
          <Text style={styles.source}>
            Fonte: {sources[0]?.title}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexShrink: 1,
    height: 190,
    marginHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    shadowColor: "#251C42",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
    overflow: "hidden",
    marginTop: 20
  },

  content: {
    paddingHorizontal: 17,
    paddingVertical: 15,
    gap: 10,
  },

  teacherRow: {
    alignSelf: "stretch",
  },

  userRow: {
    alignSelf: "stretch",
    borderLeftWidth: 3,
    borderLeftColor: "#B9A8F3",
    paddingLeft: 10,
  },

  author: {
    color: "#7657D5",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  message: {
    color: "#302B3D",
    fontSize: 15,
    lineHeight: 21,
  },

  source: {
    color: "#8A8499",
    fontSize: 11,
    marginTop: 2,
  },
});