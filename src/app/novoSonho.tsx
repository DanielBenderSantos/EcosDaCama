import { View, Text, Alert, Platform, ScrollView, StyleSheet, Dimensions, TextInput, Pressable, ActivityIndicator } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import CamposDataHora from "@/components/camposDataHora";
import TipoSonhoCheckbox, { TipoSonhoId } from "@/components/tipoSonho";
import HumorEmojiScale, { HumorScore } from "@/components/humorEmojiScale";
import { interpretarSonhoIA } from "@/utils/ai";

// DB
import { initDB, addSonho, getSonho, updateSonho, type Sonho } from "@/db";

const COLORS = {
  rosaClaro: "#f4aeb6",
  verdeMenta: "#a7eec0",
  verdeBandeira: "#018749",
  cinzaEscuro: "#2c3e50",
  gradInicio: "#ff5e78",
  gradFim: "#ffa58d",
  branco: "#ffffff",
};

function ActionButton({
  label,
  onPress,
  disabled,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const bg = variant === "primary" ? COLORS.verdeBandeira : "#ddd";
  const fg = variant === "primary" ? COLORS.branco : "#333";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: bg, opacity: disabled ? 0.6 : pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={{ color: fg, fontWeight: "700", fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function NovoSonho() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = useMemo(() => (params?.id ? Number(params.id) : undefined), [params?.id]);

  const [when, setWhen] = useState(new Date());
  const [tipo, setTipo] = useState<TipoSonhoId | null>(null);
  const [textoSonho, setTextoSonho] = useState("");
  const [textoTitulo, setTextoTitulo] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // IA
  const [interpretacao, setInterpretacao] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);

  // Humor 1..5
  const [humor, setHumor] = useState<HumorScore | null>(null);

  // 0 = INÍCIO | 1 = HUMOR | 2 = TIPO
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    (async () => {
      try { await initDB(); } catch (e) { console.error("[DB] init:", e); }
    })();
  }, []);

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
        if (typeof s.humor === "number") {
          setHumor(Math.min(5, Math.max(1, s.humor)) as HumorScore);
        }
        if (s.when_at) {
          const d = new Date(s.when_at);
          if (!isNaN(d.getTime())) setWhen(d);
        }
        if (s as any && (s as any).interpretacao) {
          setInterpretacao((s as any).interpretacao);
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

  const salvar = async () => {
    try {
      if (saving) return;
      await initDB();

      if (!textoTitulo.trim()) return alertWebMobile("Informe um título.");
      if (!textoSonho.trim())  return alertWebMobile("Descreva o sonho.");
      if (humor == null)       return alertWebMobile("Escolha como foi o sonho (humor).");
      if (!tipo)               return alertWebMobile("Selecione o tipo do sonho.");

      setSaving(true);

      const payload: Omit<Sonho, "id"> & { interpretacao?: string | null } = {
        titulo: textoTitulo.trim(),
        sonho: textoSonho.trim(),
        tipo: normalizeTipo(tipo),
        humor,
        when_at: when.toISOString(),
        interpretacao: interpretacao ?? null,
      };

      if (editingId) {
        await updateSonho(editingId, payload as any);
        alertWebMobile("Sonho atualizado!");
      } else {
        await addSonho(payload as any);
        alertWebMobile("Sonho salvo!");
        setTextoTitulo("");
        setTextoSonho("");
        setTipo(null);
        setHumor(null);
        setInterpretacao(null);
      }

      router.back();
    } catch (e: any) {
      console.error(e);
      alertWebMobile(`Falha ao salvar: ${e?.message ?? "erro desconhecido"}`);
    } finally {
      setSaving(false);
    }
  };

  const nextFromStep = async () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (humor == null) { alertWebMobile("Escolha como foi o sonho (humor) para continuar."); return; }
      setStep(2); return;
    }
    await salvar();
  };

  const prevFromStep = () => {
    if (step === 2) return setStep(1);
    if (step === 1) return setStep(0);
    handleBack();
  };

  async function onInterpretarIA() {
    try {
      if (!textoSonho.trim()) { alertWebMobile("Descreva o sonho antes de interpretar."); return; }
      setIaLoading(true);
      const txt = await interpretarSonhoIA(textoSonho.trim());
      setInterpretacao(txt);
      alertWebMobile("Interpretação gerada!");
    } catch (e: any) {
      console.error(e);
      alertWebMobile(`Não foi possível interpretar agora. ${e?.message ?? ""}`);
    } finally {
      setIaLoading(false);
    }
  }

  const StepPill = () => (
    <View style={styles.stepPill}>
      <Pressable onPress={() => setStep(0)} style={[styles.stepItem, step === 0 && styles.stepActive]}>
        <Text style={[styles.stepText, step === 0 && styles.stepTextActive]}>Início</Text>
      </Pressable>
      <Pressable onPress={() => setStep(1)} style={[styles.stepItem, step === 1 && styles.stepActive]}>
        <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>Humor</Text>
      </Pressable>
      <Pressable onPress={() => setStep(2)} style={[styles.stepItem, step === 2 && styles.stepActive]}>
        <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>Tipo</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent={false} backgroundColor="#fff" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
        <LinearGradient
          colors={["#7c74c4ff", "#f0c1b4ff"]}
          style={{ flex: 1, justifyContent: "center" }}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View
              style={[
                style.card,
                {
                  backgroundColor: "rgba(255,255,255,0.57)",
                  minHeight: Dimensions.get("window").height * 0.95,
                  maxHeight: Dimensions.get("window").height * 0.95,
                  width: "90%",
                },
              ]}
            >
              {/* TOP BAR */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 42 }}>
                <FontAwesome onPress={handleBack} name="arrow-left" size={32} color="black" />
              </View>

              {/* TÍTULO */}
              <Text style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>
                {editingId ? "Editar Sonho" : "Novo Sonho"}
              </Text>

              {/* PILLS DE ETAPAS */}
              <StepPill />

              {/* CONTEÚDO */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 12, paddingBottom: 160 }}
                showsVerticalScrollIndicator
              >
                {step === 0 && (
                  <View>
                    <Text style={styles.sectionTitle}>Início</Text>
                    <View style={{ gap: 12 }}>
                      <CamposDataHora value={when} onChange={setWhen} labelDate="Data " labelTime="Hora " is24Hour />
                      <TextInput
                        placeholder="Título"
                        style={style.pesquisa}
                        value={textoTitulo}
                        placeholderTextColor={"black"}
                        onChangeText={setTextoTitulo}
                      />
                      <TextInput
                        placeholder="Descreva seu sonho..."
                        value={textoSonho}
                        placeholderTextColor={"black"}
                        onChangeText={setTextoSonho}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        style={style.textarea}
                      />

                      {/* BOTÃO IA + LOADING */}
                      <Pressable
                        onPress={onInterpretarIA}
                        disabled={iaLoading || !textoSonho.trim()}
                        style={({ pressed }) => [
                          {
                            backgroundColor: COLORS.verdeMenta,
                            borderRadius: 10,
                            paddingVertical: 12,
                            alignItems: "center",
                            opacity: iaLoading ? 0.7 : pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <Text style={{ fontWeight: "700", color: "#0f172a" }}>
                          {iaLoading ? "Interpretando..." : "Interpretar sonho (IA) ✨"}
                        </Text>
                      </Pressable>

                      {iaLoading && <ActivityIndicator style={{ marginTop: 8 }} />}

                      {/* CARD DA INTERPRETAÇÃO */}
                      {interpretacao && (
                        <View style={{
                          marginTop: 10,
                          backgroundColor: "rgba(255,255,255,0.9)",
                          borderRadius: 10,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: "#e5e7eb"
                        }}>
                          <Text style={{ fontWeight: "700", color: COLORS.cinzaEscuro, marginBottom: 6 }}>
                            Interpretação
                          </Text>
                          <Text style={{ color: "#111827" }}>{interpretacao}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {step === 1 && (
                  <View>
                    <Text style={styles.sectionTitle}>Humor</Text>
                    <HumorEmojiScale value={humor} onChange={setHumor} />
                    {humor == null && <Text style={styles.helperText}>Escolha uma opção.</Text>}
                  </View>
                )}

                {step === 2 && (
                  <View>
                    <Text style={styles.sectionTitle}>Tipo de sonho</Text>
                    <TipoSonhoCheckbox value={tipo} onChange={setTipo} />
                    {!tipo && <Text style={styles.helperText}>Selecione um tipo para continuar.</Text>}
                  </View>
                )}
              </ScrollView>

              {/* BARRA DE AÇÕES FIXA */}
              <View style={styles.bottomBar}>
                <ActionButton
                  label={step === 0 ? "Voltar" : "Voltar seção"}
                  onPress={prevFromStep}
                  disabled={loading || saving}
                  variant="secondary"
                />
                <ActionButton
                  label={
                    step < 2
                      ? "Próximo"
                      : (saving ? (editingId ? "Atualizando..." : "Salvando...") : (editingId ? "Atualizar" : "Salvar"))
                  }
                  onPress={nextFromStep}
                  disabled={
                    loading || saving ||
                    (step === 1 && humor == null) ||
                    (step === 2 && !tipo)
                  }
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function alertWebMobile(msg: string) {
  if (Platform.OS === "web") (window as any)?.alert?.(msg);
  else Alert.alert("Aviso", msg);
}

export const style = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 10, shadowOpacity: 0.25, shadowRadius: 3.84, gap: 15 },
  textarea: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, minHeight: 100, fontSize: 16, backgroundColor: "#fff" },
  pesquisa: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: "#fff" },
});

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.cinzaEscuro, marginBottom: 8 },
  helperText: { marginTop: 6, fontSize: 12, color: COLORS.cinzaEscuro },
  stepPill: { flexDirection: "row", alignSelf: "center", backgroundColor: "rgba(255,255,255,0.85)", padding: 6, borderRadius: 999, gap: 4, marginBottom: 6 },
  stepItem: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  stepActive: { backgroundColor: COLORS.verdeMenta },
  stepText: { fontSize: 13, color: COLORS.cinzaEscuro, fontWeight: "600" },
  stepTextActive: { color: "#0f172a" },
  bottomBar: { position: "absolute", left: 16, right: 16, bottom: 16, flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
});
