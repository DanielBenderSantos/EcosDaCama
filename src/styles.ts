// app/styles.ts
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  myContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#3090cfff",
    ...Platform.select({
      web: { minHeight: "100vh" as any}, // só no web
      default: {},                 // mobile ignora
    }),
  },
  myBody: {
    gap: 16,
    width: "50%",
    justifyContent: "center",
  },
});
