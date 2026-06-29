import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}