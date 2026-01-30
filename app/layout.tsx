import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google"; 
import "./globals.css";
import { Toaster } from "sonner";
import ClientWrapper from "./components/ClientWrapper";
import Navbar from "./components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Commerce App",
  description: "A modern e-commerce application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased bg-gradient-to-br from-slate-900 via-black to-slate-900`}
        suppressHydrationWarning
      >
        <ClientWrapper>
          <Navbar />
          <main className="min-h-screen">
            <Toaster position="top-center" richColors />
            {children}
          </main>
        </ClientWrapper>
      </body>
    </html>
  );
}
