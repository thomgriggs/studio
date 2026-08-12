import type { Metadata } from "next";
import "./globals.css";
import "../custom-css/hoa-custom.css";

export const metadata: Metadata = {
  title: "Westbrooke Place | HOA in Brookhaven, GA",
  description: "A local snapshot of the logged-in Westbrooke Place HOA Express site for CSS testing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://www.westbrookeplacehoa.com/static/css/main.ce945624.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
