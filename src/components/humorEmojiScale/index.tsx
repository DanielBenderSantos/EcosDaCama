import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";

export type HumorScore = 1 | 2 | 3 | 4 | 5; // 1 = ótimo, 5 = péssimo

type Props = {
  value: HumorScore | null;
  onChange: (score: HumorScore) => void;
  title?: string;
};

const COLORS = {
  rosaClaro: "#f4aeb6",
  verdeMenta: "#a7eec0",
  verdeBandeira: "#018749",
  cinzaEscuro: "#2c3e50",
  gradInicio: "#ff5e78", // tom avermelhado
  gradFim: "#ffa58d",    // tom âmbar/pêssego
  branco: "#ffffff",

  // complementares para o espectro
  amarelo: "#ffe08a",
  laranja: "#ff8c42",
  vermelho: "#e63946",
};

// mapeia as cores por score
function colorForScore(score: HumorScore) {
  switch (score) {
    case 1:
      return { bg: COLORS.verdeMenta, border: COLORS.verdeBandeira, text: COLORS.verdeBandeira };
    case 2:
      return { bg: "#c9f4d9", border: COLORS.verdeMenta, text: COLORS.cinzaEscuro };
    case 3:
      return { bg: COLORS.gradFim, border: "#ffb98f", text: COLORS.cinzaEscuro };
    case 4:
      return { bg: COLORS.laranja, border: "#ff7a1f", text: COLORS.branco };
    case 5:
      return { bg: COLORS.vermelho, border: COLORS.vermelho, text: COLORS.branco };
  }
}

const OPTIONS: { score: HumorScore; emoji: string; label: string }[] = [
  { score: 1, emoji: "😍", label: "Muito bom" },
  { score: 2, emoji: "🙂", label: "Bom" },
  { score: 3, emoji: "😐", label: "Neutro" },
  { score: 4, emoji: "😟", label: "Ruim" },
  { score: 5, emoji: "😱", label: "Péssimo" },
];

export default function HumorEmojiScale({
  value,
  onChange,
  title = "Como foi o sonho?",
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* coluna vertical */}
      <View style={styles.column}>
        {OPTIONS.map((opt) => {
          const active = value === opt.score;
          const colors = colorForScore(opt.score);
          return (
            <Pressable
              key={opt.score}
              onPress={() => onChange(opt.score)}
              accessibilityRole="button"
              accessibilityLabel={`${opt.label}`}
              style={({ pressed }) => [
                styles.item,
                {
                  // quando ativo, aplica a paleta do score
                  backgroundColor: active ? colors.bg : COLORS.branco,
                  borderColor: active ? colors.border : COLORS.rosaClaro,
                },
                pressed && { opacity: 0.9 },
                Platform.OS === "web" && ({ cursor: "pointer" } as any),
              ]}
            >
              <Text
                style={[
                  styles.emoji,
                  active && styles.emojiActive,
                ]}
              >
                {opt.emoji}
              </Text>
              <Text
                style={[
                  styles.label,
                  active && { color: colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.cinzaEscuro,
  },
  column: {
    flexDirection: "column",
    gap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 10,
  },
  emoji: { fontSize: 22 },
  emojiActive: { fontSize: 24 },
  label: { fontSize: 15, fontWeight: "700", color: COLORS.cinzaEscuro },
});
