import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Asian Urban Transformation Matrix | AUTM",
    template: "%s | AUTM",
  },
  description:
    "AI-powered research platform tracking population change, housing prices, economic transformation, and demographics across Asia's most dynamic cities.",
  keywords: [
    "Asian cities",
    "urban demographics",
    "housing prices",
    "population growth",
    "Tokyo",
    "Seoul",
    "Shanghai",
    "urban economics",
    "AI research",
  ],
  openGraph: {
    type: "website",
    title: "Asian Urban Transformation Matrix",
    description:
      "Research platform for Asian urban demographics, housing, and economic transformation.",
    siteName: "AUTM",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
