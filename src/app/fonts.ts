import { El_Messiri, Outfit } from "next/font/google";

// Arabic (headings + body): El Messiri — elegant and calm, chosen by the client.
export const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: "variable",
  variable: "--font-el-messiri",
  display: "swap",
});

// Latin: Outfit — geometric like the "brandify" wordmark.
export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});
