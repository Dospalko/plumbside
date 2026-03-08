import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
});

const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PlumbSide — Service Dispatch",
  description: "AI-assisted dispatch and job management for service businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={`${mono.variable} ${bricolage.variable}`}>
      <body className="font-sans antialiased text-slate-900 bg-[#FAF9F6] selection:bg-orange-500 selection:text-white relative min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

