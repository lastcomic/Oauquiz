import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Old Age University — The Second Draft Placement Exam",
  description:
    "An official placement exam for the second half of life. You are not starting over. You are starting from the most informed position of your life.",
};

export const viewport: Viewport = {
  themeColor: "#1B2A47",
  width: "device-width",
  initialScale: 1,
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
