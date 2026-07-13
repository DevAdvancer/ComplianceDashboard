import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-custom",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Compliance Management System",
  description:
    "Enterprise compliance workflow built with Next.js 15 and Supabase.",
  icons: {
    icon: "/silverspace.png",
    shortcut: "/silverspace.png",
    apple: "/silverspace.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${plexMono.variable} bg-slate-950 text-slate-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
