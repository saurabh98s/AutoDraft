import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "../store/providers";
import { AuthProvider } from "../components/ui/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoDraft | Grant Writing Assistant",
  description: "AI-powered grant writing platform with real-time collaboration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* 👇  let React ignore unexpected attributes */}
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            {children}
            <ToastContainer position="bottom-right" />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
