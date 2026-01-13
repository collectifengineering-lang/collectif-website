'use client';

import { useEffect, useState } from "react";
import { roboto } from "@/config/fonts"
import { useUIStore } from "@/store"
import Link from "next/link"
import styles from '@/styles/navbar.module.css'
import { usePathname } from "next/navigation";
import Image from "next/image";

export const TopMenu = () => {

  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const isSideMenuOpen = useUIStore(state => state.isSideMenuOpen);
  const openSideMenu = useUIStore(state => state.openSideMenu);
  const closeSideMenu = useUIStore(state => state.closeSideMenu);

  useEffect(() => {
    if (pathname.startsWith("/works")) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [pathname]);

  const toggleMenu = () => {
    if (isSideMenuOpen) {
      closeSideMenu();
    } else {
      openSideMenu();
    }
  };

  return (
    isVisible ?
    <nav className={styles.container}>
        {/*Logo*/}
        <div className={styles.logoContainer}>
        <Link  className={styles.logoLink} href="/">
          <Image 
            id="imageNavbar" 
            className={styles.logo} 
            src={`/collectif-logo-without-mep.png`} 
            alt='logo-navbar-img'
            width={100}
            height={100}
          />
        </Link>
            <Link href="/">
                <span className={`${roboto.className} ${styles.descriptionText} anitaliased`}>
                  A fully-integrated MEP engineering and R&D firm
                </span>
            </Link>
        </div>

        {/* Center Menu */}
        {!isSideMenuOpen && (
          <div className={styles.linksContainer}>
            <div className="hidden md:block xl:block">
              <div className={styles.firstRowLinkSection}>
                {/* <Link className={`${roboto.className} ${styles.textLink}`} href="/">Home</Link> */}
                <Link className={`${roboto.className} ${styles.textLink}`} href="/studio">Studio</Link>
                <Link className={`${roboto.className} ${styles.textLink}`} href="/work">Work</Link>
                <Link className={`${roboto.className} ${styles.textLink}`} href="/culture">Culture</Link>
                <Link className={`${roboto.className} ${styles.textLink}`} href="/contact">Contact</Link>
              </div>
            </div>
        </div>
        )}

        {/* Menu Button */}
        <div className={styles.menuButton}>
          <button 
            onClick={toggleMenu} 
            className={`${styles.hamMenu} ${isSideMenuOpen ? styles.active : ''}`}
          >
              <span></span>
              <span></span>
              <span></span>
          </button>
        </div>
    </nav>
    : null
  )
}
