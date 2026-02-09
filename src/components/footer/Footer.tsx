import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/footer.module.css'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <Image 
            width={100}
            height={100}
            src={`/contact/logo-contact.png`}
            alt={'collectif-logo'}
            className={styles.logoImage}
          />
        </div>
        <div className={styles.footerLinks}>
          <Link href="/studio" className={styles.footerLink}>Studio</Link>
          <Link href="/work" className={styles.footerLink}>Work</Link>
          <Link href="/culture" className={styles.footerLink}>Culture</Link>
          <Link href="/contact" className={styles.footerLink}>Contact</Link>
        </div>
        <div className={styles.footerSocial}>
          <a
            href="https://www.linkedin.com/company/collectif-engineering-pllc/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            LinkedIn
          </a>
          <span className={styles.separator}>|</span>
          <a
            href="https://www.instagram.com/collectifmep/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            Instagram
          </a>
        </div>
        <div className={styles.footerLegal}>
          <Link href="/privacy-policy" className={styles.legalLink}>Privacy Policy</Link>
          <span className={styles.separator}>|</span>
          <Link href="/terms-of-service" className={styles.legalLink}>Terms of Service</Link>
        </div>
        <div className={styles.footerCopyright}>
          <p>Copyright © {year} COLLECTIF Engineering PLLC</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
