import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  value?: Date;
  onChange?: (next: Date) => void;
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
  labelDate = "Data",
  labelTime = "Hora",
  is24Hour = true,
  minimumDate,
  maximumDate,
  containerStyle,
  fieldStyle,
}: Props) {
  const [date, setDate] = useState<Date>(value ?? new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // Web: refs para inputs nativos
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      setDate(value);
    }
  }, [value?.getTime()]);

  const updateDate = (updater: (prev: Date) => Date) => {
    setDate(prev => {
      const next = updater(prev);
      onChange?.(next);
      return next;
    });
  };

  const onChangeDate = (_evt: any, selected?: Date) => {
    if (Platform.OS === "android") setShowDate(false);
    if (selected) {
      updateDate(prev => {
        const d = new Date(prev);
        d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        return d;
      });
    }
  };

  const onChangeTime = (_evt: any, selected?: Date) => {
    if (Platform.OS === "android") setShowTime(false);
    if (selected) {
      updateDate(prev => {
        const d = new Date(prev);
        d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        return d;
      });
    }
  };

  const dateLabel = date.toLocaleDateString("pt-BR");
  const timeLabel = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // Helpers para web
  const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const hhmm = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.row}>
        {/* Campo de Data: mesmo visual em todas as plataformas */}
        <TouchableOpacity
          style={[styles.field, fieldStyle, { flex: 1 }]}
          activeOpacity={0.85}
          onPress={() => {
            if (Platform.OS === "web") dateInputRef.current?.click();
            else setShowDate(true);
          }}
        >
          <Text style={styles.label}>{labelDate}</Text>
          <Text style={styles.value}>{dateLabel}</Text>

          {/* Web: input escondido que abre o picker nativo */}
          {Platform.OS === "web" && (
            <input
              ref={dateInputRef}
              type="date"
              value={isoDate}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                updateDate(prev => {
                  const nd = new Date(prev);
                  nd.setFullYear(y, (m ?? 1) - 1, d ?? 1);
                  return nd;
                });
              }}
              style={{ display: "none" }}
              min={minimumDate ? minimumDate.toISOString().split("T")[0] : undefined}
              max={maximumDate ? maximumDate.toISOString().split("T")[0] : undefined}
            />
          )}
        </TouchableOpacity>

        <View style={{ width: 12 }} />

        {/* Campo de Hora: mesmo visual em todas as plataformas */}
        <TouchableOpacity
          style={[styles.field, fieldStyle, { flex: 1 }]}
          activeOpacity={0.85}
          onPress={() => {
            if (Platform.OS === "web") timeInputRef.current?.click();
            else setShowTime(true);
          }}
        >
          <Text style={styles.label}>{labelTime}</Text>
          <Text style={styles.value}>{timeLabel}</Text>

          {/* Web: input escondido para time */}
          {Platform.OS === "web" && (
            <input
              ref={timeInputRef}
              type="time"
              value={hhmm}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                updateDate(prev => {
                  const nd = new Date(prev);
                  nd.setHours(h ?? 0, m ?? 0, 0, 0);
                  return nd;
                });
              }}
              style={{ display: "none" }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Pickers nativos (Android/iOS) */}
      {showDate && Platform.OS !== "web" && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {showTime && Platform.OS !== "web" && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={is24Hour}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  field: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { fontSize: 12, color: "#2c3e50", marginBottom: 2 },
  value: { fontSize: 13, fontWeight: "600", color: "#2c3e50" },
});
