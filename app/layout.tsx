import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "My Dashboard App",
  description: "Created with Next.js 16 and React 19",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen ..."
        suppressHydrationWarning={true}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}