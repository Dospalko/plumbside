import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
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
    <html lang="sk" className={`${inter.variable} ${headingFont.variable}`}>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-blue-100 selection:text-blue-900 relative min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

