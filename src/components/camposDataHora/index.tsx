import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  value?: Date;                    // valor controlado
  onChange?: (next: Date) => void; // callback quando muda
  labelDate?: string;
  labelTime?: string;
  is24Hour?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  containerStyle?: ViewStyle;
  fieldStyle?: ViewStyle;
};

export default function CamposDataHora({
  value,
  onChange,
  labelDate = "Data ",
  labelTime = "Hora ",
  is24Hour = true,
  minimumDate,
  maximumDate,
  containerStyle,
  fieldStyle,
}: Props) {
  const [internal, setInternal] = useState<Date>(value ?? new Date());

  // Mantém estado controlado se o pai mandar novo value
  React.useEffect(() => {
    if (value && value.getTime() !== internal.getTime()) setInternal(value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const dateStr = useMemo(() => formatDateInput(internal), [internal]);
  const timeStr = useMemo(() => formatTimeInput(internal), [internal]);

  const setDatePart = (y: number, m: number, d: number) => {
    const next = new Date(internal);
    next.setFullYear(y, m, d);
    propagate(next);
  };

  const setTimePart = (hh: number, mm: number) => {
    const next = new Date(internal);
    next.setHours(hh, mm, 0, 0);
    propagate(next);
  };

  const propagate = (next: Date) => {
    setInternal(next);
    onChange?.(next);
  };

  // ====== RENDERIZAÇÃO WEB: inputs nativos HTML ======
  if (Platform.OS === "web") {
    // atributos min/max apenas para a data (time não suporta bem ranges por data)
    const minDateStr = minimumDate ? formatDateInput(minimumDate) : undefined;
    const maxDateStr = maximumDate ? formatDateInput(maximumDate) : undefined;

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.field, fieldStyle]}>
          <Text style={styles.label}>{labelDate}</Text>
          {/* @ts-ignore: usamos elemento HTML diretamente no web */}
          <input
            type="date"
            value={dateStr}
            min={minDateStr}
            max={maxDateStr}
            onChange={(e: any) => {
              const v = String(e.target.value); // "YYYY-MM-DD"
              if (!v) return;
              const [yy, mm, dd] = v.split("-").map(Number);
              // mês no JS é 0-11
              setDatePart(yy, mm - 1, dd);
            }}
            style={htmlInputStyle}
          />
        </View>

        <View style={[styles.field, fieldStyle]}>
          <Text style={styles.label}>{labelTime}</Text>
          {/* @ts-ignore */}
          <input
            type="time"
            value={timeStr} // "HH:MM"
            step={60}       // minutos (1 min). Coloque 1 para segundos
            onChange={(e: any) => {
              const v = String(e.target.value); // "HH:MM"
              if (!v) return;
              const [hh, mm] = v.split(":").map(Number);
              setTimePart(hh, mm);
            }}
            style={htmlInputStyle}
          />
        </View>
      </View>
    );
  }

  // ====== RENDERIZAÇÃO MOBILE (Android/iOS): community datetimepicker ======
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.field, fieldStyle]}
        onPress={() => setShowDate(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{labelDate}</Text>
        <Text style={styles.value}>{formatDateHuman(internal)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.field, fieldStyle]}
        onPress={() => setShowTime(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{labelTime}</Text>
        <Text style={styles.value}>{formatTimeHuman(internal, is24Hour)}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={internal}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowDate(false);
            if (!d) return;
            // mantém hora/min do internal
            const next = new Date(internal);
            next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
            // aplica limites se enviados
            propagate(clampDate(next, minimumDate, maximumDate));
          }}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={internal}
          mode="time"
          is24Hour={is24Hour}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowTime(false);
            if (!d) return;
            const next = new Date(internal);
            next.setHours(d.getHours(), d.getMinutes(), 0, 0);
            propagate(next);
          }}
        />
      )}
    </View>
  );
}

/** Helpers */

function formatDateInput(d: Date) {
  // "YYYY-MM-DD" no fuso local
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTimeInput(d: Date) {
  // "HH:MM" 24h
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatDateHuman(d: Date) {
  // Ex.: 25/08/2025 (BR)
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTimeHuman(d: Date, is24Hour: boolean) {
  if (is24Hour) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  // 12h com sufixo
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const isPM = h >= 12;
  const hh12 = h % 12 === 0 ? 12 : h % 12;
  return `${hh12}:${m} ${isPM ? "PM" : "AM"}`;
}

function clampDate(d: Date, min?: Date, max?: Date) {
  const t = d.getTime();
  if (min && t < min.getTime()) return min;
  if (max && t > max.getTime()) return max;
  return d;
}

/** Estilos */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  label: { fontSize: 12, color: "#2c3e50", marginBottom: 4 },
  value: { fontSize: 16, color: "#2c3e50" },
});

// Estilo inline para inputs HTML no web
const htmlInputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 16,
  padding: 6,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#2c3e50",
};
