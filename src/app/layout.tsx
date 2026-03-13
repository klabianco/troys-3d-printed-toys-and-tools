import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Troy's 3D Printed Toys & Tools",
  description:
    "Practical tools, fun toys, and clever gadgets — all designed and 3D printed by Troy. Buy the finished product or download the STL file.",
  openGraph: {
    title: "Troy's 3D Printed Toys & Tools",
    description:
      "Practical tools, fun toys, and clever gadgets — all designed and 3D printed by Troy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
