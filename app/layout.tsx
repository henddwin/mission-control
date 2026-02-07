import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ConvexClientProvider } from "./ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mission Control - AI Assistant Dashboard",
  description: "Real-time dashboard for monitoring AI assistant activities and tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className="flex h-screen bg-zinc-950">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-8">{children}</div>
            </main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
