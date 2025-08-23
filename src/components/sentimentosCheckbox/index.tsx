// components/sentimentosCheckbox.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Checkbox from "expo-checkbox";

export type SentimentoId =
  | "feliz"
  | "triste"
  | "assustado"
  | "confuso"
  | "raiva"
  | "aliviado"
  | "ansioso"
  | "sereno";

export type SentimentosState = Record<SentimentoId, boolean>;

type Props = {
  value: SentimentosState;
  onChange: (next: SentimentosState) => void;
  title?: string;
};

export default function SentimentosCheckbox({
  value,
  onChange,
  title = "Como você se sentiu no sonho?",
}: Props) {
  const toggle = (key: SentimentoId) => {
    onChange({ ...value, [key]: !value[key] });
  };

  const entries = Object.entries(value) as [SentimentoId, boolean][];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* grade 2 colunas sem FlatList */}
      <View style={styles.grid}>
        {entries.map(([key, val]) => (
          <View key={key} style={styles.item}>
            <Checkbox
              value={val}
              onValueChange={() => toggle(key)}
              color={val ? "#018749" : undefined}
            />
            <Text style={styles.label}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },

  label: { marginLeft: 6, fontSize: 15, color: "#2c3e50" },
});
