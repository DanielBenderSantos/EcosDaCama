// app/styles.ts
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  myContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#3090cfff",
    ...Platform.select({
      web: { minHeight: "100vh" as any}, // só no web
      default: {},                 // mobile ignora
    }),
  },
  // myBody: {
  //   gap: 16,
  //   width: "90%",
  //   justifyContent: "center",
  //   backgroundColor:"#FFFFFF",
  //   borderRadius:10,
  //   height:"90%",
  //   marginTop:"10%",
  //   ...Platform.select({
  //     web: { minHeight: "100vh" as any}, // só no web
  //     default: {},                 // mobile ignora
  //   }),
  // },
});
