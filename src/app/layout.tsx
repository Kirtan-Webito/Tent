import type { Metadata } from "next";
import { Inter, Roboto, Open_Sans, Montserrat, Lato } from "next/font/google"; // Import user requested fonts
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";

// Define fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tent Management System",
  description: "Advanced tent management and booking system",
  icons: {
    icon: "/favicon.ico",
  },
};

import NextTopLoader from 'nextjs-toploader';
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${montserrat.variable} ${lato.variable} antialiased`} suppressHydrationWarning>
        <NextTopLoader color="#EA580C" showSpinner={false} />
        <ToastProvider>
          {children}
          <SpeedInsights />
        </ToastProvider>
      </body>
    </html>
  );
}
