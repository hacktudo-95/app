import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
} from "react-native-svg";

import type { AvatarState } from "../types";

type Props = {
  state: AvatarState;
  compact?: boolean;
};

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const labels: Record<AvatarState, string> = {
  starting: "Preparando a aula",
  speaking: "Dora está falando",
  listening: "Estou ouvindo você",
  thinking: "Pensando na sua resposta",
  error: "Não consegui conectar",
};

const colors: Record<AvatarState, string> = {
  starting: "#7C5CE5",
  speaking: "#7C5CE5",
  listening: "#16A474",
  thinking: "#E89A35",
  error: "#D84F67",
};

export function ProfessorAvatar({
  state,
  compact = false,
}: Props) {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const mouthOpen = useRef(new Animated.Value(0)).current;

  // Movimento suave do corpo.
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -5,
          duration: 1350,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1350,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [float]);

  // Pulsação do círculo enquanto Dora fala ou escuta.
  useEffect(() => {
    pulse.stopAnimation();
    pulse.setValue(1);

    if (state !== "listening" && state !== "speaking") {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse, state]);

  // Movimento da boca enquanto o áudio está sendo reproduzido.
  useEffect(() => {
    mouthOpen.stopAnimation();
    mouthOpen.setValue(0);

    if (state !== "speaking") {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(mouthOpen, {
          toValue: 1,
          duration: 125,
          useNativeDriver: false,
        }),
        Animated.timing(mouthOpen, {
          toValue: 0.25,
          duration: 105,
          useNativeDriver: false,
        }),
        Animated.timing(mouthOpen, {
          toValue: 0.75,
          duration: 145,
          useNativeDriver: false,
        }),
        Animated.timing(mouthOpen, {
          toValue: 0,
          duration: 115,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [mouthOpen, state]);

  const accent = colors[state];
  const size = compact ? 210 : 248;

  const mouthHeight = mouthOpen.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 10],
  });

  return (
    <View
      style={[
        styles.wrapper,
        compact && styles.compactWrapper,
      ]}
      accessibilityLabel={labels[state]}
    >
      <Animated.View
        style={[
          styles.halo,
          {
            borderColor: accent,
            transform: [{ scale: pulse }],
          },
          compact && styles.compactHalo,
        ]}
      />

      <Animated.View
        style={{
          transform: [{ translateY: float }],
        }}
      >
        <Svg
          width={size}
          height={size}
          viewBox="0 0 260 260"
        >
          {/* Sombra */}

          <Ellipse
            cx="130"
            cy="238"
            rx="89"
            ry="13"
            fill="#DCD4F6"
            opacity="0.7"
          />

          {/* Corpo */}

          <Path
            d="M57 246c2-50 30-76 73-76s71 26 73 76"
            fill="#6E50CE"
          />

          {/* Jaleco esquerdo */}

          <Path
            d="M57 246c3-39 17-61 44-70l29 70H57Z"
            fill="#FAFAFF"
          />

          {/* Jaleco direito */}

          <Path
            d="M203 246c-3-39-17-61-44-70l-29 70h73Z"
            fill="#FAFAFF"
          />

          {/* Camisa */}

          <Path
            d="m101 176 29 25 29-25-14 70h-30l-14-70Z"
            fill="#7557D7"
          />

          {/* Gola */}

          <Path
            d="m112 188 18 13 18-13"
            fill="none"
            stroke="#E9E3FA"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Cabelo traseiro */}

          <Path
            d="M69 112c0-55 23-84 62-84 39 0 62 30 62 84v43h-15V94c0-31-18-50-47-50S84 63 84 94v61H69v-43Z"
            fill="#3B3151"
          />

          {/* Orelhas */}

          <Circle
            cx="73"
            cy="115"
            r="17"
            fill="#D99067"
          />

          <Circle
            cx="187"
            cy="115"
            r="17"
            fill="#D99067"
          />

          {/* Rosto */}

          <Rect
            x="77"
            y="43"
            width="106"
            height="139"
            rx="53"
            fill="#EFB184"
          />

          {/* Cabelo frontal */}

          <Path
            d="M77 94c0-38 20-58 53-58 36 0 54 23 54 60-18-4-31-15-40-31-12 18-33 29-67 29Z"
            fill="#413653"
          />

          <Path
            d="M89 55c-13 9-20 27-18 49"
            fill="none"
            stroke="#413653"
            strokeWidth="13"
            strokeLinecap="round"
          />

          {/* Sobrancelhas */}

          <Path
            d="M93 105c10-6 20-6 29-1M140 104c9-5 19-5 28 1"
            fill="none"
            stroke="#6F4B43"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Óculos */}

          <Rect
            x="86"
            y="101"
            width="43"
            height="34"
            rx="14"
            fill="#FFFFFF"
            fillOpacity="0.23"
            stroke="#514464"
            strokeWidth="4"
          />

          <Rect
            x="135"
            y="101"
            width="43"
            height="34"
            rx="14"
            fill="#FFFFFF"
            fillOpacity="0.23"
            stroke="#514464"
            strokeWidth="4"
          />

          <Line
            x1="129"
            y1="116"
            x2="135"
            y2="116"
            stroke="#514464"
            strokeWidth="4"
          />

          {/* Olhos */}

          <Circle
            cx="108"
            cy="118"
            r="5"
            fill="#332A48"
          />

          <Circle
            cx="156"
            cy="118"
            r="5"
            fill="#332A48"
          />

          {/* Brilho dos olhos */}

          <Circle
            cx="106.5"
            cy="116.5"
            r="1.4"
            fill="#FFFFFF"
          />

          <Circle
            cx="154.5"
            cy="116.5"
            r="1.4"
            fill="#FFFFFF"
          />

          {/* Nariz */}

          <Path
            d="m132 120-4 18 8 1"
            fill="none"
            stroke="#D58C68"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Bochechas */}

          <Ellipse
            cx="99"
            cy="143"
            rx="10"
            ry="5"
            fill="#E98E87"
            opacity="0.36"
          />

          <Ellipse
            cx="164"
            cy="143"
            rx="10"
            ry="5"
            fill="#E98E87"
            opacity="0.36"
          />

          {/* Boca */}

          {state === "speaking" ? (
            <AnimatedEllipse
              cx="132"
              cy="153"
              rx="12"
              ry={mouthHeight}
              fill="#813C55"
            />
          ) : (
            <Path
              d="M119 150c7 10 19 10 27 0"
              fill="none"
              stroke="#8A4056"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}

          {/* Colar de DNA */}

          <G transform="translate(119 207)">
            <Path
              d="M0 0c20 8 2 22 22 30M22 0C2 8 20 22 0 30"
              fill="none"
              stroke="#56B7B0"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <Line
              x1="5"
              y1="6"
              x2="17"
              y2="6"
              stroke="#E86977"
              strokeWidth="2"
            />

            <Line
              x1="6"
              y1="15"
              x2="16"
              y2="15"
              stroke="#E86977"
              strokeWidth="2"
            />

            <Line
              x1="5"
              y1="24"
              x2="17"
              y2="24"
              stroke="#E86977"
              strokeWidth="2"
            />
          </G>
        </Svg>
      </Animated.View>

      <View style={styles.statusPill}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: accent,
            },
          ]}
        />

        <Text style={styles.statusText}>
          {labels[state]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 292,
    alignItems: "center",
    justifyContent: "center",
  },

  compactWrapper: {
    height: 238,
  },

  halo: {
    position: "absolute",
    width: 264,
    height: 264,
    borderRadius: 132,
    borderWidth: 2,
    opacity: 0.15,
    backgroundColor: "#FFFFFF",
  },

  compactHalo: {
    width: 218,
    height: 218,
    borderRadius: 109,
  },

  statusPill: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#332A48",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    color: "#514B60",
    fontSize: 13,
    fontWeight: "700",
  },
});