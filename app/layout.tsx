import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cam Weather Studio",
  description: "Broadcast weather graphics studio"
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
