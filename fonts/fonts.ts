import { Libre_Caslon_Text } from "next/font/google";
import localFont from "next/font/local";

export const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-caslon",
});

import { Montserrat } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const bonVivant = localFont({
  src: [
    {
      path: "../public/fonts/BonVivantSerif.otf", // Ensure the correct path
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/BonVivantSerifBold.otf", // Ensure the correct path
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-bon-vivant", // Use variable to match the Libre Caslon format
});
