import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { EnglishConnectButton } from "../components/EnglishConnectButton";

export const metadata: Metadata = {
  title: "Fitness Tracker",
  description: "Privacy-preserving fitness activity tracking with FHEVM",
  icons: {
    icon: "/vault-logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`dark-bg text-foreground antialiased`}>
        <div className="fixed inset-0 w-full h-full dark-bg z-[-20]"></div>
        <main className="flex flex-col min-h-screen">
          <Providers>
            <nav className="w-full px-4 md:px-6 py-6 bg-gray-900/90 backdrop-blur-sm border-b border-purple-500/20 shadow-lg">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                    🏃
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Fitness Tracker</h1>
                    <p className="text-xs text-purple-300">FHEVM Encrypted</p>
                  </div>
                </div>
                <EnglishConnectButton />
              </div>
            </nav>
            <div className="flex-1 py-8">
              {children}
            </div>
          </Providers>
        </main>
      </body>
    </html>
  );
}

