import type { Metadata } from "next";
import { Inter , DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Specify the weights you need
  variable: '--font-dm-sans',    // Define a CSS variable for the font
});

export const metadata: Metadata = {
  title: "DataMBA - Empowering MBA Education with Cutting-Edge Datasets",
  description: "DataMBA revolutionizes business education by providing comprehensive, real-world datasets tailored for MBA institutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
