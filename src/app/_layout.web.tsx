// app/_layout.web.tsx
import "./global.css"; // importa só no web
import { Slot } from "expo-router";

export default function RootLayout() {
  return <Slot />; // Slot = onde suas páginas (index.tsx, dashboard.tsx, etc) são renderizadas
}
