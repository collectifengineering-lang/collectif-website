'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/store";
import { IoHomeOutline, IoBriefcaseOutline, IoShareSocialOutline } from "react-icons/io5"
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
                    className={`flex items-center mt-11 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/' ? 'text-[var(--color-collectif-pink)]' : ''}`}
                >
                    <IoHomeOutline 
                        size={ 20 }
                    />
                    <span className="ml-3 text-base">Home</span>
                </Link>
                <Link 
                    href="/profile"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/profile' ? 'text-[var(--color-collectif-pink)]' : ''}`}
                >
                    <FaHelmetSafety 
                        size={ 20 }
                    />
                    <span className="ml-3 text-base">Profile</span>
                </Link>
                <Link 
                    href="/expertise"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/expertise' ? 'text-[var(--color-collectif-pink)]' : ''}`}
                >
                    <FaHelmetSafety 
                        size={ 20 }
                    />
                    <span className="ml-3 text-base">Expertise</span>
                </Link>
                <Link 
                    href="/work"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/work' ? 'text-[var(--color-collectif-pink)]' : ''}`}
                >
                    <IoBriefcaseOutline 
                        size={ 20 }
                    />
                    <span className="ml-3 text-base">Work</span>
                </Link>
                <Link 
                    href="/social"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/social' ? 'text-[var(--color-collectif-pink)]' : ''}`}
                >
                    <IoShareSocialOutline 
                        size={ 20 }
                    />
                    <span className="ml-3 text-base">Social</span>
                </Link>
                <Link 
                    href="/contact"
                    className={`flex items-center mt-8 p-2 hover:bg-gray-100 rounded transition-all ${pathname === '/contact' ? 'text-[var(--color-collectif-pink)]' : ''}`}
                >
                    <FaRegHandshake 
                        size={ 20 }
                    />
                    <span className="ml-3 text-base">Contact</span>
                </Link>
        </nav>
    </div> ) : null
  )
}
