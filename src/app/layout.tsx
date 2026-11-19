
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Doce Alto | Pastelaria Artesanal",
    template: "%s | Doce Alto",
  },
  description:
    "Descubra a Doce Alto, uma pastelaria artesanal com bolos, doces tradicionais, croissants e especialidades preparadas com paixão e qualidade.",

  keywords: [
    "Doce Alto",
    "Pastelaria",
    "Pastelaria artesanal",
    "Bolos",
    "Doces tradicionais",
    "Croissants",
    "Pastéis de nata",
    "Porto",
  ],

  openGraph: {
    title: "Doce Alto | Pastelaria Artesanal",
    description:
      "Momentos especiais merecem sabores inesquecíveis. Conheça a Pastelaria Doce Alto.",
    locale: "pt_PT",
    type: "website",
    siteName: "Doce Alto",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
