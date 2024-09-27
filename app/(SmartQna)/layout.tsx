// import type { Metadata } from "next";
// import { Inter , DM_Sans, } from "next/font/google";
// import "../globals.css";
// import Sidebar from "../components/SideBar";
// import { AuthProvider } from "../context/AuthProvider";


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
     
      
      
//      <body className={dmSans.className}>
//         <div className="h-screen w-full flex ">
        
        
//         <Sidebar />
        
//         {children}
         
//         </div>
//         </body>
        
      
      
     
     
//     </html>
//   );
// }
// layouts/SidebarLayout.tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../globals.css";
import Sidebar from "@/app/components/SideBar";
import { AuthProvider } from "../context/AuthProvider";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

 export const metadata: Metadata = {
  title: "DataMBA - Empowering MBA Education with Cutting-Edge Datasets",
  description: "DataMBA revolutionizes business education by providing comprehensive, real-world datasets tailored for MBA institutions.",
};

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <div className={cn("w-full h-screen flex" ,  dmSans.className)}>
        <AuthProvider>
          
            <Sidebar/>
           
              {children}
            
          
        </AuthProvider>
        </div>
    
  );
}
