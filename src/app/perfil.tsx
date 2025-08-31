// app/perfil.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import { exportSonhosJSON, importSonhosJSON } from "@/utils/exportImport";
import { initDB } from "@/db";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Perfil() {
  const [open, setOpen] = useState(false); // modal de ações
  const [busy, setBusy] = useState(false);
  const [qtdSonhos, setQtdSonhos] = useState<number | null>(null);

  const goHome = () => router.navigate("/");

  const loadCount = useCallback(async () => {
    try {
      const db = await initDB();
      const r = await db.select<{ total: number }>("SELECT COUNT(*) as total FROM Sonhos");
      setQtdSonhos(r?.[0]?.total ?? 0);
    } catch {
      setQtdSonhos(null);
    }
  }, []);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  useFocusEffect(
    useCallback(() => {
      loadCount();
    }, [loadCount])
  );

  const headerRight = useMemo(
    () => (
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
      >
        {/* mantém o ícone no topo direito como na principal */}
        <FontAwesome name="user-circle" size={32} color="black" />
      </Pressable>
    ),
    []
  );

  async function onExportJSON() {
    try {
      setBusy(true);
      const { uri } = await exportSonhosJSON();
      if (Platform.OS === "web") {
        Alert.alert("Exportar", "Download iniciado no navegador.");
      } else if (uri) {
        Alert.alert("Exportar", "Arquivo exportado/compartilhado.");
      } else {
        Alert.alert("Exportar", "Concluído.");
      }
    } catch (e: any) {
      Alert.alert("Erro ao exportar", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onImportJSON() {
    try {
      setBusy(true);
      const { imported, skipped } = await importSonhosJSON();
      await loadCount();
      Alert.alert("Importar", `Importados: ${imported}\nIgnorados: ${skipped}`);
    } catch (e: any) {
      Alert.alert("Erro ao importar", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }
    function handleBack() { router.back(); }
  

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent={false} backgroundColor="#fff" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
        <LinearGradient
          colors={["#7c74c4ff", "#f0c1b4ff"]}
          style={{ flex: 1, justifyContent: "center" }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.57)",
                  minHeight: SCREEN_HEIGHT * 0.95,
                  maxHeight: SCREEN_HEIGHT * 0.95,
                  width: "90%",
                },
              ]}
            >
              {/* Topo: "voltar" (estilo do seu input) + ícone à direita */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 42 }}>
                <FontAwesome onPress={handleBack} name="arrow-left" size={32} color="black" />
                
              </View>

              {/* Conteúdo como na listagem: área scrolável com cards/ações */}
              <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }} showsVerticalScrollIndicator>
                {/* Header/Resumo */}
                <View style={[styles.sonhoCard, { paddingVertical: 16 }]}>
                  <Text style={styles.sonhoTitulo}>Perfil e Backup</Text>
                  <Text style={styles.meta}>
                    {qtdSonhos === null ? "—" : `${qtdSonhos} sonho(s)`} • {Platform.OS.toUpperCase()}
                  </Text>
                </View>

                {/* Ação: Exportar JSON */}
                <Pressable
                  onPress={onExportJSON}
                  style={({ pressed }) => [styles.sonhoCard, pressed && { opacity: 0.9 }]}
                  accessibilityRole="button"
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <FontAwesome name="cloud-upload" size={20} color="#2c3e50" />
                    <Text style={styles.sonhoTitulo}>Exportar sonhos (JSON)</Text>
                  </View>
                  <Text style={styles.meta}>Cria um arquivo .json com todos os sonhos.</Text>
                </Pressable>

                {/* Ação: Importar JSON */}
                <Pressable
                  onPress={onImportJSON}
                  style={({ pressed }) => [styles.sonhoCard, pressed && { opacity: 0.9 }]}
                  accessibilityRole="button"
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <FontAwesome name="cloud-download" size={20} color="#2c3e50" />
                    <Text style={styles.sonhoTitulo}>Importar sonhos (JSON)</Text>
                  </View>
                  <Text style={styles.meta}>Lê um .json exportado e faz merge seguro.</Text>
                </Pressable>

              
              </ScrollView>

            
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: 15,
  },
  // Reaproveita o mesmo "visual" do seu TextInput de busca
  pesquisa: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
    padding: 10,
    backgroundColor: "#fff",
    width: "85%",
  },
  sonhoCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    ...(Platform.OS === "web" ? ({ userSelect: "none" } as any) : null),
  },
  sonhoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  meta: {
    fontSize: 12,
    color: "#555",
  },
});
