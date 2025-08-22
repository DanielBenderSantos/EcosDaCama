import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  value?: Date;                    // valor controlado (opcional)
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
  const [date, setDate] = useState<Date>(value ?? new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

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

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.row}>
        {/* Campo de Data */}
        {Platform.OS === "web" ? (
          <div style={{ flex: 1 }}>
            <label style={styles.webLabel as any}>{labelDate}</label>
            <input
              type="date"
              value={date.toISOString().split("T")[0]}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                updateDate(prev => {
                  const nd = new Date(prev);
                  nd.setFullYear(y, m - 1, d);
                  return nd;
                });
              }}
              style={styles.webInput as any}
            />
          </div>
        ) : (
          <TouchableOpacity style={[styles.field, fieldStyle, { flex: 1 }]} onPress={() => setShowDate(true)} activeOpacity={0.85}>
            <Text style={styles.label}>{labelDate}</Text>
            <Text style={styles.value}>{dateLabel}</Text>
          </TouchableOpacity>
        )}

        {/* Espaço entre os dois */}
        <View style={{ width: 12 }} />

        {/* Campo de Hora */}
        {Platform.OS === "web" ? (
          <div style={{ flex: 1 }}>
            <label style={styles.webLabel as any}>{labelTime}</label>
            <input
              type="time"
              value={`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                updateDate(prev => {
                  const nd = new Date(prev);
                  nd.setHours(h, m, 0, 0);
                  return nd;
                });
              }}
              style={styles.webInput as any}
            />
          </div>
        ) : (
          <TouchableOpacity style={[styles.field, fieldStyle, { flex: 1 }]} onPress={() => setShowTime(true)} activeOpacity={0.85}>
            <Text style={styles.label}>{labelTime}</Text>
            <Text style={styles.value}>{timeLabel}</Text>
          </TouchableOpacity>
        )}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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

  // Web
  webInput: {
    width: "70%",
    padding: 10,
    borderRadius: 8,
    outline: "none",
    fontSize: 16,
    backgroundColor: "#fff",
  },
  webLabel: {
    fontSize: 12,
    color: "#2c3e50",
    marginBottom: 4,
  },
});
