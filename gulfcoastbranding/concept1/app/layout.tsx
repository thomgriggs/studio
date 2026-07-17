import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Gulf Coast Branding | Branded for Success",
  description: "Promotional products, custom apparel, signage, and brand solutions from Dunedin, Florida.",
  openGraph: {
    title: "Gulf Coast Branding | Branded for Success",
    description: "Promotional products, custom apparel, signage, and brand solutions from Dunedin, Florida.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Gulf Coast Branding — Branded for Success" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gulf Coast Branding | Branded for Success",
    description: "Promotional products, custom apparel, signage, and brand solutions from Dunedin, Florida.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
