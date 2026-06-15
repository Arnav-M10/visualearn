import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visualearn - Learn Anything. See Everything.",
  description:
    "AI-powered visual explanations for any concept, designed as an immersive learning universe.",
  openGraph: {
    title: "Visualearn",
    description: "Learn anything through interactive visual lessons.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
