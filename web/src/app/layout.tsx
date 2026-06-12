import type { Metadata } from "next";
import { Shantell_Sans, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

import Navbar from "@/shared/components/Navbar";
import { isAdmin } from "@/shared/auth";

const shantell = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-shantell",
  weight: "variable",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "JJ's Grasshut",
  description:
    "JJ's corner of the internet, projects, rambles, photos, and a slowly growing second brain.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await isAdmin();
  return (
    <html lang="en" className={`${shantell.variable} ${atkinson.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Navbar initialAdmin={admin} />
        {children}
      </body>
    </html>
  );
}
