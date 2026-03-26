import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADA Consortium 2.0",
  description: "ADA Firebase demo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}