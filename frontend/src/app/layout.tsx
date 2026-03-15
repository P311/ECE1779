import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECE1779 Project",
  description: "ECE1779 Cloud Computing Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
