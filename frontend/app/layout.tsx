import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppShell from "./app-shell";


export const metadata: Metadata = {
  title: "HanilMatch",
  description: "AI-powered Korean and Japanese matching platform",
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
