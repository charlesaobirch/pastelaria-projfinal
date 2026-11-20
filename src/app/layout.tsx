import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Balcão · Pastelaria",
  description: "Produtos, ingredientes e vendas da pastelaria.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-[var(--line)] bg-[var(--surface)]">
          <nav
            aria-label="Navegação principal"
            className="mx-auto flex w-full max-w-7xl items-center gap-6 px-5 py-4 sm:px-8"
          >
            <Link href="/" className="font-semibold tracking-tight">
              Balcão
            </Link>
            <Link
              href="/produtos"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Produtos
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
