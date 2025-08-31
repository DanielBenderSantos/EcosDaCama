// app/perfil.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { exportSonhosJSON, importSonhosJSON } from "@/utils/exportImport";
import { initDB } from "@/db";

const C = {
  rosaClaro: "#f4aeb6",
  verdeMenta: "#a7eec0",
  verdeBandeira: "#018749",
  cinzaEscuro: "#2c3e50",
  gradIni: "#ff5e78",
  gradFim: "#ffa58d",
  branco: "#ffffff",
};

export default function Perfil() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [qtdSonhos, setQtdSonhos] = useState<number | null>(null);

  const loadCount = useCallback(async () => {
    try {
      const db = await initDB();
      const r = await db.select<{ total: number }>("SELECT COUNT(*) as total FROM Sonhos");
      setQtdSonhos(r?.[0]?.total ?? 0);
    } catch {
      setQtdSonhos(null);
    }
  }, []);

  useEffect(() => { loadCount(); }, [loadCount]);

  const titleRight = useMemo(() => (
    <Pressable onPress={() => setOpen(true)} hitSlop={12}>
      <FontAwesome name="ellipsis-v" size={20} color={C.branco} />
    </Pressable>
  ), []);

  async function onExportJSON() {
    try {
      setBusy(true);
      const { uri } = await exportSonhosJSON();
      if (Platform.OS === "web") {
        Alert.alert("Exportar", "Download iniciado no navegador.");
      } else if (uri) {
        Alert.alert("Exportar", "Arquivo exportado/compartilhado.");
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

  function goHome() {
    // ajuste a rota se sua home for diferente (ex.: "/index")
    router.push("/");
  }

  return (
    <LinearGradient colors={[C.gradIni, C.gradFim]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.ecProfile_container}>
        <Stack.Screen
          options={{
            title: "Perfil",
            headerStyle: { backgroundColor: "transparent" },
            headerTitleStyle: { color: C.branco },
            headerTransparent: true,
            headerLeft: () => (
              <Pressable onPress={goHome} hitSlop={12} style={{ paddingHorizontal: 8 }}>
                <FontAwesome name="home" size={20} color={C.branco} />
              </Pressable>
            ),
            headerRight: () => titleRight,
          }}
        />

        <View style={styles.ecProfile_headerCard}>
          <View style={styles.ecProfile_avatarWrap}>
            <FontAwesome name="user" size={56} color={C.cinzaEscuro} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ecProfile_name}>EcosDaCama</Text>
            <Text style={styles.ecProfile_meta}>
              {qtdSonhos === null ? "—" : `${qtdSonhos} sonho(s)`} • {Platform.OS.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.ecProfile_section}>
          <Text style={styles.ecProfile_sectionTitle}>Backup</Text>

          <Pressable style={styles.ecProfile_item} onPress={() => setOpen(true)}>
            <View style={styles.ecProfile_itemIcon}>
              <FontAwesome name="cloud" size={20} color={C.verdeBandeira} />
            </View>
            <View style={styles.ecProfile_itemTextBox}>
              <Text style={styles.ecProfile_itemTitle}>Exportar / Importar (JSON)</Text>
              <Text style={styles.ecProfile_itemSubtitle}>Compatível com Web, Android e iOS</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={C.cinzaEscuro} />
          </Pressable>
        </View>

        <View style={[styles.ecProfile_section, { marginTop: 18 }]}>
          <Text style={styles.ecProfile_sectionTitle}>Navegação</Text>

          <Pressable style={styles.ecProfile_item} onPress={goHome}>
            <View style={styles.ecProfile_itemIcon}>
              <FontAwesome name="home" size={20} color={C.verdeBandeira} />
            </View>
            <View style={styles.ecProfile_itemTextBox}>
              <Text style={styles.ecProfile_itemTitle}>Voltar ao Início</Text>
              <Text style={styles.ecProfile_itemSubtitle}>Abrir tela principal</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={C.cinzaEscuro} />
          </Pressable>
        </View>

        {/* Modal de Ações (apenas JSON) */}
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={styles.ecProfile_modalBackdrop}>
            <View style={styles.ecProfile_modalCard}>
              <Text style={styles.ecProfile_modalTitle}>Backup dos sonhos (JSON)</Text>

              <Pressable style={styles.ecProfile_actionBtn} onPress={onExportJSON} disabled={busy}>
                <FontAwesome name="cloud-upload" size={18} color={C.branco} />
                <Text style={styles.ecProfile_actionText}>Exportar sonhos (JSON)</Text>
              </Pressable>

              <Pressable style={styles.ecProfile_actionBtn} onPress={onImportJSON} disabled={busy}>
                <FontAwesome name="cloud-download" size={18} color={C.branco} />
                <Text style={styles.ecProfile_actionText}>Importar sonhos (JSON)</Text>
              </Pressable>

              <Pressable style={styles.ecProfile_closeBtn} onPress={() => setOpen(false)} disabled={busy}>
                <Text style={styles.ecProfile_closeText}>Fechar</Text>
              </Pressable>

              {busy && (
                <View style={styles.ecProfile_loading}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.ecProfile_loadingText}>Processando…</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ecProfile_container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
  },

  ecProfile_headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  ecProfile_avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  ecProfile_name: {
    fontSize: 22,
    fontWeight: "700",
    color: C.cinzaEscuro,
  },
  ecProfile_meta: {
    marginTop: 2,
    color: C.cinzaEscuro,
    opacity: 0.8,
  },

  ecProfile_section: {
    gap: 10,
  },
  ecProfile_sectionTitle: {
    color: C.branco,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    marginBottom: 6,
    opacity: 0.9,
  },

  ecProfile_item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  ecProfile_itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  ecProfile_itemTextBox: { flex: 1 },
  ecProfile_itemTitle: { fontSize: 16, fontWeight: "600", color: C.cinzaEscuro },
  ecProfile_itemSubtitle: { fontSize: 12, color: C.cinzaEscuro, opacity: 0.7 },

  // Modal
  ecProfile_modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  ecProfile_modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: C.cinzaEscuro,
    borderRadius: 20,
    padding: 16,
  },
  ecProfile_modalTitle: {
    color: C.branco,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  ecProfile_actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.verdeBandeira,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  ecProfile_actionText: { color: C.branco, fontSize: 15, fontWeight: "600" },

  ecProfile_closeBtn: {
    alignSelf: "center",
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  ecProfile_closeText: { color: C.rosaClaro, fontWeight: "700" },

  ecProfile_loading: {
    marginTop: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  ecProfile_loadingText: { color: C.branco, opacity: 0.9 },
});
