import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
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
};

export default function SentimentosCheckbox({ value, onChange }: Props) {
  const toggle = (key: SentimentoId) => {
    onChange({ ...value, [key]: !value[key] });
  };

  const entries = Object.entries(value) as [SentimentoId, boolean][];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como você se sentiu no sonho?</Text>

      <FlatList
        data={entries}
        keyExtractor={([k]) => k}
        numColumns={2} // força 2 colunas
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingTop: 4 }}
        renderItem={({ item: [key, val] }) => (
          <View style={styles.item}>
            <Checkbox
              value={val}
              onValueChange={() => toggle(key)}
              color={val ? "#018749" : undefined}
            />
            <Text style={styles.label}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",      // 2 colunas (quase metade da linha)
    marginBottom: 12,  // espaço vertical
  },

  label: { marginLeft: 6, fontSize: 15, color: "#2c3e50" },
});
