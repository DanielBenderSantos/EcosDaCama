import { View, Text, Alert, Platform, ScrollView, StyleSheet, Dimensions, TextInput } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import CamposDataHora from "@/components/camposDataHora";
import TipoSonhoCheckbox, { TipoSonhoId } from "@/components/tipoSonho";
import { Button } from "@/components/button";
import SentimentosCheckbox from "@/components/sentimentosCheckbox";

// DB — ajuste o caminho se for diferente
import { initDB, addSonho, getSonho, updateSonho, type Sonho, type SentimentoId } from "@/db";

type SentimentosState = {
  feliz: boolean; triste: boolean; assustado: boolean; confuso: boolean;
  raiva: boolean; aliviado: boolean; ansioso: boolean; sereno: boolean;
};

const SENTIMENTOS_INICIAIS: SentimentosState = {
  feliz: false, triste: false, assustado: false, confuso: false,
  raiva: false, aliviado: false, ansioso: false, sereno: false,
};

export default function NovoSonho() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = useMemo(() => (params?.id ? Number(params.id) : undefined), [params?.id]);

  const [when, setWhen] = useState(new Date()); // controlado pelo picker
  const [tipo, setTipo] = useState<TipoSonhoId | null>(null);
  const [sentimentos, setSentimentos] = useState<SentimentosState>({ ...SENTIMENTOS_INICIAIS });
  const [textoSonho, setTextoSonho] = useState("");
  const [textoTitulo, setTextoTitulo] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { try { await initDB(); } catch (e) { console.error("[DB] init:", e); } })(); }, []);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        setLoading(true);
        await initDB();
        const s = await getSonho(editingId);
        if (!s) {
          alertWebMobile("Registro não encontrado.");
          router.back();
          return;
        }
        setTextoTitulo(s.titulo ?? "");
        setTextoSonho(s.sonho ?? "");
        setTipo(dbTipoToUiTipo(s.tipo));
        setSentimentos(arrayToSentimentosState(s.sentimentos || []));

        // 👉 carrega a data/hora salva no banco (when_at) se existir
        if (s.when_at) {
          const d = new Date(s.when_at);
          if (!isNaN(d.getTime())) setWhen(d); // <-- usa a do banco
        }
      } catch (e) {
        console.error(e);
        alertWebMobile("Falha ao carregar o sonho.");
      } finally {
        setLoading(false);
      }
    })();
  }, [editingId]);

  function handleBack() { router.back(); }

  // UI <-> DB
  function normalizeTipo(t: TipoSonhoId): "normal" | "lúcido" | "pesadelo" | "recorrente" {
    const m = (t || "").toString().toLowerCase();
    if (m === "lucido") return "lúcido";
    if (m === "pesadelo") return "pesadelo";
    if (m === "recorrente") return "recorrente";
    return "normal";
  }
  function dbTipoToUiTipo(t?: string): TipoSonhoId | null {
    const m = (t || "").toLowerCase();
    if (m === "lúcido" || m === "lucido") return "lucido";
    if (m === "pesadelo") return "pesadelo";
    if (m === "recorrente") return "recorrente";
    if (m === "normal") return "normal";
    return null;
  }

  function arrayToSentimentosState(arr: string[]): SentimentosState {
    const base = { ...SENTIMENTOS_INICIAIS };
    arr.forEach((k) => { if (k in base) (base as any)[k] = true; });
    return base;
  }

  function currentSentimentosArray(): SentimentoId[] {
    return (Object.entries(sentimentos) as [keyof SentimentosState, boolean][])
      .filter(([, v]) => v)
      .map(([k]) => k as SentimentoId);
  }

  const salvar = async () => {
    try {
      if (saving) return;

      await initDB();

      // validações
      if (!textoTitulo.trim()) return alertWebMobile("Informe um título.");
      if (!textoSonho.trim())  return alertWebMobile("Descreva o sonho.");
      if (!tipo)               return alertWebMobile("Selecione o tipo do sonho.");

      setSaving(true);

      // inclui when_at com o valor do picker
      const payload: Omit<Sonho, "id"> = {
        titulo: textoTitulo.trim(),
        sonho: textoSonho.trim(),
        sentimentos: currentSentimentosArray(),
        tipo: normalizeTipo(tipo),
        when_at: when.toISOString(), // <-- salva a data/hora escolhida
      };

      if (editingId) {
        await updateSonho(editingId, payload);
        alertWebMobile("Sonho atualizado!");
      } else {
        await addSonho(payload);
        alertWebMobile("Sonho salvo!");
        // limpa formulário ao criar
        setTextoTitulo("");
        setTextoSonho("");
        setTipo(null);
        setSentimentos({ ...SENTIMENTOS_INICIAIS });
      }

      router.back();
    } catch (e: any) {
      console.error(e);
      alertWebMobile(`Falha ao salvar: ${e?.message ?? "erro desconhecido"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent={false} backgroundColor="#fff" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
        <LinearGradient colors={["#7c74c4ff", "#f0c1b4ff"]} style={{ flex: 1, justifyContent: "center" }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View style={[style.card, { backgroundColor: "rgba(255,255,255,0.57)", minHeight: Dimensions.get("window").height * 0.95, maxHeight: Dimensions.get("window").height * 0.95, width: "90%" }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 42 }}>
                <FontAwesome onPress={handleBack} name="arrow-left" size={32} color="black" />
                <FontAwesome name="user-circle" size={32} color="black" />
              </View>

              <ScrollView style={{ gap: 12 }} contentContainerStyle={{ padding: 12 }} showsVerticalScrollIndicator>
                <Text style={{ fontSize: 32, textAlign: "center", marginBottom: 32 }}>
                  {editingId ? "Editar Sonho" : "Novo Sonho"}
                </Text>

                <View>
                  <View style={{ gap: 12 }}>
                    <CamposDataHora value={when} onChange={setWhen} labelDate="Data " labelTime="Hora " is24Hour />
                    <TextInput placeholder="Título" style={style.pesquisa} value={textoTitulo} onChangeText={setTextoTitulo} />
                    <TextInput placeholder="Descreva seu sonho..." value={textoSonho} onChangeText={setTextoSonho} multiline numberOfLines={6} textAlignVertical="top" style={style.textarea} />

                    <SentimentosCheckbox value={sentimentos} onChange={setSentimentos} />
                    <TipoSonhoCheckbox value={tipo} onChange={setTipo} />

                    <Button
                      title={saving ? (editingId ? "Atualizando..." : "Salvando...") : (editingId ? "Atualizar" : "Salvar")}
                      onPress={salvar}
                      disabled={saving || loading}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function alertWebMobile(msg: string) {
  if (Platform.OS === "web") window.alert(msg);
  else Alert.alert("Aviso", msg);
}

export const style = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 10, shadowOpacity: 0.25, shadowRadius: 3.84, gap: 15 },
  textarea: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, minHeight: 100, fontSize: 16, backgroundColor: "#fff" },
  pesquisa: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: "#fff" },
});
