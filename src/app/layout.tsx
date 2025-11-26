import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JJ | Full Stack Developer",
  description: "Full Stack Developer and AI Engineer specializing in React, Next.js, and machine learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
