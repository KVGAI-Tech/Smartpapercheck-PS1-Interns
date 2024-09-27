// import type { Metadata } from "next";
// import { Inter , DM_Sans } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from "./context/AuthProvider";
// import { Toaster } from "@/components/ui/toaster";

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'], // Specify the weights you need
//   variable: '--font-dm-sans',    // Define a CSS variable for the font
// });

// export const metadata: Metadata = {
//   title: "DataMBA - Empowering MBA Education with Cutting-Edge Datasets",
//   description: "DataMBA revolutionizes business education by providing comprehensive, real-world datasets tailored for MBA institutions.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
     
     
       
//       <body className={dmSans.className}>
        
//         <AuthProvider>
//         {children}
//         </AuthProvider>
        
//         <Toaster/>
//       </body>
     
     
//     </html>
//   );
// }
// layouts/MainLayout.tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "DataMBA - Empowering MBA Education with Cutting-Edge Datasets",
  description: "DataMBA revolutionizes business education by providing comprehensive, real-world datasets tailored for MBA institutions.",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <AuthProvider>
          <div className="h-screen w-full">
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
