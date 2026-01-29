import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const plusJakartaSans = localFont({
  src: [
    {
      path: "../public/fonts/Plus_Jakarta_Sans/PlusJakartaSans-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/Plus_Jakarta_Sans/PlusJakartaSans-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const lora = localFont({
  src: [
    {
      path: "../public/fonts/Lora/Lora-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/Lora/Lora-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

const ibmPlexMono = localFont({
  src: [
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-ExtraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/IBM_Plex_Mono/IBMPlexMono-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vidzara - Grow Like a Pro",
  description: "Vidzara helps creators turn ideas into high-performing content. Generate titles, hooks, scripts, and thumbnails that get clicks — while staying algorithm-safe and consistent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakartaSans.variable} ${lora.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
