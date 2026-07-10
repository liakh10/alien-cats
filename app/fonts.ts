import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";

// Alien Cats identity — a sci-fi HUD display (Orbitron), unused elsewhere in the
// hub (distinct from Titan One / Fredoka / Cinzel / Bungee / Bricolage / Baloo).
export const display = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
});
export const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});
