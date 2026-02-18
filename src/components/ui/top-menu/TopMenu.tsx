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
  const isSideMenuOpen = useUIStore(state => state.isSideMenuOpen);
  const openSideMenu = useUIStore(state => state.openSideMenu);
  const closeSideMenu = useUIStore(state => state.closeSideMenu);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const toggleMenu = () => {
    if (isSideMenuOpen) {
      closeSideMenu();
    } else {
      openSideMenu();
    }
  };

  return (
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
        {(!mounted || !isSideMenuOpen) && (
          <div className={styles.linksContainer}>
            <div className="hidden md:block xl:block">
              <div className={styles.firstRowLinkSection}>
                <Link className={`${roboto.className} ${pathname === '/profile' ? styles.textLinkActive : styles.textLink}`} href="/profile">Profile</Link>
                <Link className={`${roboto.className} ${pathname === '/expertise' ? styles.textLinkActive : styles.textLink}`} href="/expertise">Expertise</Link>
                <Link className={`${roboto.className} ${['/work', '/works'].includes(pathname) ? styles.textLinkActive : styles.textLink}`} href="/work">Work</Link>
                <Link className={`${roboto.className} ${pathname === '/social' ? styles.textLinkActive : styles.textLink}`} href="/social">Social</Link>
                <Link className={`${roboto.className} ${pathname === '/contact' ? styles.textLinkActive : styles.textLink}`} href="/contact">Contact</Link>
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
              <span className={styles.hamLine}></span>
              <span className={styles.hamLine}></span>
              <span className={styles.hamLine}></span>
          </button>
        </div>
    </nav>
  )
}
