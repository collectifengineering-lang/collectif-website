'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/store";
import { IoHomeOutline, IoBriefcaseOutline, IoPersonOutline, IoShareSocialOutline } from "react-icons/io5"
// import { BsPersonGear } from "react-icons/bs";
import { FaRegHandshake } from "react-icons/fa";
import { FaHelmetSafety } from "react-icons/fa6";
import clsx from "clsx";
import { usePathname } from "next/navigation";



export const SideBar = () => {

    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);

    const isSideMenuOpen = useUIStore(state => state.isSideMenuOpen);
    const closeSideMenu = useUIStore(state => state.closeSideMenu);

    useEffect(() => {
    if (pathname.startsWith("/works/")) {
        setIsVisible(false);
    } else {
        setIsVisible(true);
    }
    }, [pathname]);

  return (
    isVisible ? (
    <div>
        {/* background black*/}
        {
            isSideMenuOpen &&  (
                <div className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30" />
            )
        }

        {/* blur */}
        {
            isSideMenuOpen && (
                <div 
                    onClick={ () => closeSideMenu() }
                    className="fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm" 
                />
            )
        }
        
        {/* sideMenu */}
        <nav
            className={
                clsx(
                    "fixed p-6 right-0 top-0 w-[300px] h-screen bg-white z-20 shadow-2x1 transform transition-all duration-300",
                    {
                        "translate-x-full" : !isSideMenuOpen,
                    }
                )
            }>
                {/* menu */}
                <Link 
                    href="/"
                    className={`flex items-center mt-11 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/' ? 'text-[#e62883]' : ''}`}
                >
                    <IoHomeOutline 
                        size={ 20 }
                    />
                    <span className="ml-3 text-ml">Home</span>
                </Link>
                <Link 
                    href="/studio"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/studio' ? 'text-[#e62883]' : ''}`}
                >
                    <FaHelmetSafety 
                        size={ 20 }
                    />
                    <span className="ml-3 text-ml">Studio</span>
                </Link>
                <Link 
                    href="/work"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/work' ? 'text-[#e62883]' : ''}`}
                >
                    <IoBriefcaseOutline 
                        size={ 20 }
                    />
                    <span className="ml-3 text-ml">Work</span>
                </Link>
                <Link 
                    href="/culture"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/culture' ? 'text-[#e62883]' : ''}`}
                >
                    <IoPersonOutline 
                        size={ 20 }
                    />
                    <span className="ml-3 text-ml">Culture</span>
                </Link>
                <Link 
                    href="/social"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/social' ? 'text-[#e62883]' : ''}`}
                >
                    <IoShareSocialOutline 
                        size={ 20 }
                    />
                    <span className="ml-3 text-ml">Social</span>
                </Link>
                <Link 
                    href="/contact"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/contact' ? 'text-[#e62883]' : ''}`}
                >
                    <FaRegHandshake 
                        size={ 20 }
                    />
                    <span className="ml-3 text-ml">Contact</span>
                </Link>
        </nav>
    </div> ) : null
  )
}
