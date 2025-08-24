import { View, Text, Alert, Platform, ScrollView, StyleSheet, Dimensions, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import CamposDataHora from "@/components/camposDataHora";
import TipoSonhoCheckbox, { TipoSonhoId } from "@/components/tipoSonho";
import { Button } from "@/components/button";
import SentimentosCheckbox from "@/components/sentimentosCheckbox";

// DB
import { initDB, addSonho } from "@/db";

export default function NovoSonho() {
  const [when, setWhen] = useState(new Date());
  const [tipo, setTipo] = useState<TipoSonhoId | null>(null);
  const [sentimentos, setSentimentos] = useState({
    feliz: false, triste: false, assustado: false, confuso: false,
    raiva: false, aliviado: false, ansioso: false, sereno: false,
  });
  const [textoSonho, setTextoSonho] = useState("");
  const [textoTitulo, setTextoTitulo] = useState("");
  const [saving, setSaving] = useState(false);

  // Pré-inicializa o DB, mas NÃO bloqueia a UI
  useEffect(() => {
    (async () => {
      try {
        console.log("[DB] init (pré-carga)...");
        await initDB();
        console.log("[DB] pronto (pré-carga).");
      } catch (e) {
        console.error("[DB] falhou na pré-carga:", e);
      }
    })();
  }, []);

  function handleBack() { router.navigate("/"); }

  function normalizeTipo(t: TipoSonhoId): "normal" | "lúcido" | "pesadelo" | "recorrente" {
    const m = (t || "").toString().toLowerCase();
    if (m === "lucido") return "lúcido";
    if (m === "pessadelo") return "pesadelo";
    if (m === "recorrente") return "recorrente";
    return "normal";
  }

  const salvar = async () => {
    try {
      if (saving) return;

      // Garante o DB agora (idempotente). Se o WASM não carregar, o erro aparece aqui.
      console.log("[DB] init (onSave)...");
      await initDB();
      console.log("[DB] pronto (onSave).");

      // validações
      if (!textoTitulo.trim()) return alertWebMobile("Informe um título.");
      if (!textoSonho.trim())  return alertWebMobile("Descreva o sonho.");
      if (!tipo)               return alertWebMobile("Selecione o tipo do sonho.");

      setSaving(true);

      const sentimentosArray = (Object.entries(sentimentos) as [string, boolean][])
        .filter(([, v]) => v)
        .map(([k]) => k);

      await addSonho({
        titulo: textoTitulo.trim(),
        sonho: textoSonho.trim(),
        sentimentos: sentimentosArray as any,
        tipo: normalizeTipo(tipo),
      });

      alertWebMobile("Sonho salvo!");
      // limpa formulário
      setTextoTitulo(""); setTextoSonho(""); setTipo(null);
      setSentimentos({ feliz:false, triste:false, assustado:false, confuso:false, raiva:false, aliviado:false, ansioso:false, sereno:false });
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
                <Text style={{ fontSize: 32, textAlign: "center", marginBottom: 32 }}>Novo Sonho</Text>

                <View>
                  <View style={{ gap: 12 }}>
                    <CamposDataHora value={when} onChange={setWhen} labelDate="Data " labelTime="Hora " is24Hour />
                    <TextInput placeholder="Título" style={style.pesquisa} value={textoTitulo} onChangeText={setTextoTitulo} />
                    <TextInput placeholder="Descreva seu sonho..." value={textoSonho} onChangeText={setTextoSonho} multiline numberOfLines={6} textAlignVertical="top" style={style.textarea} />

                    <SentimentosCheckbox value={sentimentos} onChange={setSentimentos} />
                    <TipoSonhoCheckbox value={tipo} onChange={setTipo} />

                    {/* Agora o botão só depende de 'saving' */}
                    <Button title={saving ? "Salvando..." : "Salvar"} onPress={salvar} disabled={saving} />
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
