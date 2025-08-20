// app2/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Load Google fonts via next/font
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jet" });

export const metadata: Metadata = {
  title: "AI Life Coach",
  description: "Your personal AI life context coach",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetMono.variable}`}>
      <body className="bg-gray-50 text-gray-900 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
