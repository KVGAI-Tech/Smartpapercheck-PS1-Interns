import type { Metadata } from "next";
import { Inter , DM_Sans, } from "next/font/google";
import "../globals.css";
import Sidebar from "../components/SideBar";


const inter = DM_Sans({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <div className="h-screen w-full flex ">
        <Sidebar />
        
        {children}
        </div>
        </body>
    </html>
  );
}
