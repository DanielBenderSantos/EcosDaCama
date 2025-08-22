// components/TipoSonhoCheckbox.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
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
    onChange(nextChecked ? id : null); // marca = id, desmarca = null
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <FlatList
        data={OPCOES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingTop: 4 }}
        renderItem={({ item }) => {
          const checked = value === item.id;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.item}
              onPress={() => toggle(item.id, !checked)}
            >
              <Checkbox
                value={checked}
                onValueChange={(next) => toggle(item.id, next)}
                color={checked ? "#018749" : undefined}
              />
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

  // 2 colunas estáveis (Android/Web)
  item: {
   flexDirection: "row",
    alignItems: "center",
    width: "48%",      // 2 colunas (quase metade da linha)
    marginBottom: 12,  // espaço vertical
},

  label: { marginLeft: 6, fontSize: 15, color: "#2c3e50" },
});
