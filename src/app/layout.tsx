import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trampio | Professional Services",
  description: "Connect with the best professionals for any service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased flex bg-background min-h-screen`}>
        <Sidebar />
        <main className="flex-1 md:ml-20 transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}


