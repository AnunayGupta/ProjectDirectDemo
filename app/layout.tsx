import type { Metadata } from "next";
import { Jost, DM_Serif_Display } from "next/font/google";
import MainLayout from "@/components/layouts/MainLayout";
import TourGuide from "@/components/TourGuide";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kestrel Capital",
  description: "B2B wealth management platform presentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-text font-body flex flex-col">
        <MainLayout>
          {children}
        </MainLayout>
        <TourGuide />
      </body>
    </html>
  );
}
