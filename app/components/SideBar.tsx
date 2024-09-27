// 'use client'
// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Search, Upload, BarChart2, User2Icon, LogOut, Home, LayoutGrid, Menu, X } from "lucide-react"
// import { usePathname } from 'next/navigation';
// import { useAuth } from '../context/AuthProvider';

// const Sidebar = () => {
//     const pathname = usePathname();
//     const [isOpen, setIsOpen] = useState(false);
//     const [isMobile, setIsMobile] = useState(false);
//     const {logout} = useAuth() ;
 
//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 768);
//         };
//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     const toggleSidebar = () => {
//         setIsOpen(!isOpen);
//     };

//     const navItems = [
//         {name: 'Dashboard', icon: <LayoutGrid width={15} height={15} />, pathname: '/Dashboard'},
//         {name: 'Discover', icon: <Search width={15} height={15} />, pathname: '/Discover'},
//         {name: 'Upload', icon: <Upload width={15} height={15} />, pathname: '/Upload'},
//         {name: 'TA', icon: <User2Icon width={15} height={15} />, pathname: '/TA'},
//         {name: 'Courses', icon: <BarChart2 width={15} height={15} />, pathname: '/Courses'},
//     ];

//     const sidebarClasses = `
//         ${isMobile ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform' : 'relative'}
//         ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
//         w-64 bg-[#a855f7] text-white h-screen flex flex-col justify-center p-5 rounded-[0px_20px_20px_0px]
//     `;

//     return (
//         <>
        
//             {isMobile && (
//                 <button
//                     onClick={toggleSidebar}
//                     className="fixed top-4 left-4 z-50 p-2 bg-[#a855f7] text-white rounded-md"
//                 >
//                     { <Menu size={24} />}
//                 </button>
//             )}
//             <div className={sidebarClasses}>
//                 <div className="mx-auto p-1 flex justify-center">
//                     <Image src={'/logo.png'} alt="Quickads Logo" width={100} height={100} />
//                     {
//                         isMobile && isOpen && (
//                             <button
//                                 onClick={toggleSidebar}
//                                 className="absolute top-4 right-4 z-50 p-2 bg-[#a855f7] text-white rounded-md"
//                             >
//                                 <X size={24} />
//                             </button>
//                         )   
//                     }
//                 </div>
//                 <div className="bg-[linear-gradient(to_right,rgba(222,222,222,0),rgb(222,222,222),rgba(222,222,222,0))] w-full h-0.5 mt-3"></div>

//                 <nav className="flex-1 mt-5 justify-between">
//                     <ul className="space-y-2 px-4">
//                         {navItems.map((item) => {
//                             const isActive = pathname === item.pathname;
//                             return (
//                                 <li className='w-full' key={item.name}>
//                                     <Link href={item.pathname} 
//                                           className={isActive ? 
//                                             'tracking-normal leading-[1.43rem] opacity-100 text-[16px] flex items-center p-2 rounded-md font-sans text-gray-25 font-semibold text-nowrap bg-white/10' : 
//                                             'tracking-normal leading-[1.43rem] opacity-50 text-[16px] flex items-center p-2 rounded-md font-sans font-semibold text-nowrap hover:opacity-100 text-gray-25 hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300'}
//                                           onClick={() => isMobile && setIsOpen(false)}
//                                     >
//                                         <span className="mr-3">{item.icon}</span>
//                                         {item.name}
//                                     </Link>
//                                 </li>
//                             )
//                         })}
//                     </ul>
//                 </nav>

//                 <div className="p-4 border-t border-purple-500">
//                     <div onClick={logout}  className="opacity-50 text-[16px] gap-3 flex items-center p-2 rounded-md font-sans font-semibold text-nowrap hover:opacity-100 text-whiteAlpha-200 hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300">
//                         <LogOut width={15} height={15} />
//                       <span >Log Out</span>
//                     </div>
//                 </div>
             
//             </div>
            
          
//         </>
//     );
// };

// export default Sidebar;
'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Upload, BarChart2, User2Icon, LogOut, LayoutGrid, Menu, X } from "lucide-react";
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthProvider';

const Sidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMounted, setIsMounted] = useState(false); // New state for tracking component mount

    useEffect(() => {
        // Set the component as mounted
        setIsMounted(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const navItems = [
        { name: 'Dashboard', icon: <LayoutGrid width={15} height={15} />, pathname: '/Dashboard' },
        { name: 'Discover', icon: <Search width={15} height={15} />, pathname: '/Discover' },
        { name: 'Upload', icon: <Upload width={15} height={15} />, pathname: '/Upload' },
        { name: 'TA', icon: <User2Icon width={15} height={15} />, pathname: '/TA' },
        { name: 'Courses', icon: <BarChart2 width={15} height={15} />, pathname: '/Courses' },
    ];

    // Don't render Sidebar until the component is mounted to avoid SSR mismatch
    if (!isMounted) {
        return null; // Render nothing during server-side rendering
    }

    const sidebarClasses = `
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform' : 'relative'}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        w-64 bg-[#a855f7] text-white h-screen flex flex-col justify-center p-5 rounded-[0px_20px_20px_0px]
    `;

    return (
        <>
            {isMobile && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-4 left-4 z-50 p-2 bg-[#a855f7] text-white rounded-md"
                >
                    {<Menu size={24} />}
                </button>
            )}
            <div className={sidebarClasses}>
                <div className="mx-auto p-1 flex justify-center">
                    <Image src={'/logo.png'} alt="Quickads Logo" width={100} height={100} />
                    {isMobile && isOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="absolute top-4 right-4 z-50 p-2 bg-[#a855f7] text-white rounded-md"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
                <div className="bg-[linear-gradient(to_right,rgba(222,222,222,0),rgb(222,222,222),rgba(222,222,222,0))] w-full h-0.5 mt-3"></div>

                <nav className="flex-1 mt-5 justify-between">
                    <ul className="space-y-2 px-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.pathname;
                            return (
                                <li className="w-full" key={item.name}>
                                    <Link
                                        href={item.pathname}
                                        className={isActive
                                            ? 'tracking-normal leading-[1.43rem] opacity-100 text-[16px] flex items-center p-2 rounded-md font-sans text-gray-25 font-semibold text-nowrap bg-white/10'
                                            : 'tracking-normal leading-[1.43rem] opacity-50 text-[16px] flex items-center p-2 rounded-md font-sans font-semibold text-nowrap hover:opacity-100 text-gray-25 hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300'
                                        }
                                        onClick={() => isMobile && setIsOpen(false)}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-purple-500">
                    <div
                        onClick={logout}
                        className="opacity-50 text-[16px] gap-3 flex items-center p-2 rounded-md font-sans font-semibold text-nowrap hover:opacity-100 text-whiteAlpha-200 hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300"
                    >
                        <LogOut width={15} height={15} />
                        <span>Log Out</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
