// components/TipoSonhoCheckbox.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Checkbox from "expo-checkbox";

export type TipoSonhoId = "normal" | "lucido" | "pesadelo" | "recorrente";

const OPCOES: { id: TipoSonhoId; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "lucido", label: "Lúcido" },
  { id: "pesadelo", label: "Pesadelo" },
  { id: "recorrente", label: "Recorrente" },
];

type Props = {
  value: TipoSonhoId | null;
  onChange: (next: TipoSonhoId | null) => void;
  title?: string;
};

export default function TipoSonhoCheckbox({
  value,
  onChange,
  title = "Tipo de sonho",
}: Props) {
  const toggle = (id: TipoSonhoId, nextChecked: boolean) => {
    onChange(nextChecked ? id : null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* grade 2 colunas sem FlatList */}
      <View style={styles.grid}>
        {OPCOES.map((item) => {
          const checked = value === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.item}
              onPress={() => toggle(item.id, !checked)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Checkbox
                value={checked}
                onValueChange={(next) => toggle(item.id, next)}
                color={checked ? "#018749" : undefined}
              />
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
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

  // 2 colunas estáveis
  item: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },

  label: { marginLeft: 6, fontSize: 15, color: "#2c3e50" },
});
