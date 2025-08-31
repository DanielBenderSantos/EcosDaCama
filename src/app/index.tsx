import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
  Platform,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

// ⬇️ caminho onde está o arquivo do DB
import { initDB, listSonhos, deleteSonho, type Sonho } from "@/db";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Index() {
  const [sonhos, setSonhos] = useState<Sonho[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const handleNext = () => router.navigate("/novoSonho");
  const goProfile = () => router.navigate("/perfil");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await initDB();
      const data = await listSonhos();
      setSonhos(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sonhos;
    return sonhos.filter((s) => {
      const sentimentosTxt = (s.sentimentos || []).join(", ").toLowerCase();
      return (
        (s.titulo || "").toLowerCase().includes(q) ||
        (s.sonho || "").toLowerCase().includes(q) ||
        (s.tipo || "").toLowerCase().includes(q) ||
        sentimentosTxt.includes(q)
      );
    });
  }, [query, sonhos]);

  const confirmDelete = async (id?: number) => {
    if (!id) return;

    if (Platform.OS === "web") {
      const ok = window.confirm("Deseja realmente excluir este sonho?");
      if (!ok) return;
      await deleteSonho(id);
      await load();
      return;
    }

    Alert.alert("Excluir sonho", "Deseja realmente excluir este sonho?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteSonho(id);
          await load();
        },
      },
    ]);
  };

  const openEdit = (id?: number) => {
    if (!id) return;
    router.navigate({ pathname: "/novoSonho", params: { id: String(id) } });
  };

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
              {/* Topo: busca + avatar */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 42 }}>
                <TextInput
                  placeholder="Pesquisar"
                  value={query}
                  onChangeText={setQuery}
                  style={styles.pesquisa}
                />
                <Pressable
                  onPress={goProfile}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                >
                  <FontAwesome name="user-circle" size={32} color="black" />
                </Pressable>
              </View>

              {/* ====== LISTAGEM ====== */}
              <ScrollView
                contentContainerStyle={{ padding: 12, gap: 12 }}
                showsVerticalScrollIndicator
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              >
                {loading ? (
                  <Text style={styles.muted}>Carregando…</Text>
                ) : filtered.length === 0 ? (
                  <Text style={styles.muted}>Nenhum sonho encontrado.</Text>
                ) : (
                  filtered.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => openEdit(s.id)}            // toque curto → editar
                      onLongPress={() => confirmDelete(s.id)}    // long press → excluir (mobile)
                      delayLongPress={400}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.sonhoCard,
                        Platform.OS === "web" && ({ cursor: "pointer" } as any),
                        pressed && { opacity: 0.9 },
                      ]}
                      // clique direito (web) → excluir
                      {...(Platform.OS === "web"
                        ? {
                            onContextMenu: (e: any) => {
                              e.preventDefault();
                              confirmDelete(s.id);
                            },
                          }
                        : {})}
                    >
                      {/* Título */}
                      <Text style={styles.sonhoTitulo}>{s.titulo || "Sem título"}</Text>

                      {/* Trecho */}
                      <Text style={styles.sonhoTrecho} numberOfLines={3}>
                        {s.sonho}
                      </Text>

                      {/* Metadados */}
                      <View style={{ gap: 4 }}>
                        <Text style={styles.meta}>
                          Tipo: <Text style={styles.metaStrong}>{s.tipo}</Text>
                        </Text>
                        <Text style={styles.meta}>
                          Sentimentos:{" "}
                          <Text style={styles.metaStrong}>
                            {s.sentimentos?.length ? s.sentimentos.join(", ") : "—"}
                          </Text>
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>

              {/* Botão adicionar */}
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Pressable
                  onPress={handleNext}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                >
                  <FontAwesome name="plus-circle" size={40} color="purple" />
                </Pressable>
              </View>
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
  sonhoTrecho: {
    fontSize: 14,
    color: "#2c3e50",
  },
  meta: {
    fontSize: 12,
    color: "#555",
  },
  metaStrong: {
    fontWeight: "600",
    color: "#2c3e50",
  },
  muted: {
    fontSize: 14,
    color: "#555",
  },
});
