import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ConvexClientProvider } from "./ConvexClientProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mission Control — OpenClaw",
  description: "Real-time dashboard for monitoring AI assistant activities and tasks",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mission Control",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className="flex h-screen bg-[#0A0A0A]">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <div className="mx-auto max-w-[1400px] p-6 md:p-8 lg:p-12">
                {children}
              </div>
            </main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
