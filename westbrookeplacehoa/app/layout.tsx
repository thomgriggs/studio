import type { Metadata } from "next";
import "./globals.css";
import "../custom-css/hoa-custom.css";

export const metadata: Metadata = {
  title: "Pet Directory | Westbrooke Place — local snapshot",
  description: "A local snapshot of the logged-in Westbrooke Place HOA Express site for CSS testing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn-common.hoa-express.com/stylesheets/templates/13.css?r=b0d0a21815adea8081e0246f793ec8a7"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
