import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "ParseCal — Smart Calendar from Any Format",
  description:
    "Upload PDFs, images, or text — AI extracts events and pushes them to your calendar. No more manual event creation.",
  keywords: [
    "calendar",
    "AI",
    "schedule",
    "event parser",
    "OCR",
    "productivity",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen bg-bg text-text"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
