import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GST Exam Platform",
  description: "Educational platform for GST exam preparation — watch lectures, track progress, and ace your exams.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`} style={{ fontFamily: "var(--font-inter), sans-serif" }} suppressHydrationWarning>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "6px",
              padding: "10px 16px",
              fontSize: "0.875rem",
              fontWeight: 500,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
