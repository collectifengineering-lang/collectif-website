import React from 'react'
import styles from '@/styles/legal.module.css'

const TermsOfService = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.lastUpdated}>Last updated: February 2026</p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
        <p className={styles.text}>
          By accessing and using the COLLECTIF Engineering PLLC website, you agree to be bound by these 
          Terms of Service. If you do not agree with any part of these terms, please do not use our website.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Use of Website</h2>
        <p className={styles.text}>
          This website is provided for informational purposes about COLLECTIF Engineering PLLC and our 
          services. You may browse, view, and access the content on this website for personal, 
          non-commercial purposes. You agree not to misuse, reproduce, or distribute any content from this 
          website without our prior written consent.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Intellectual Property</h2>
        <p className={styles.text}>
          All content on this website, including but not limited to text, images, graphics, logos, and 
          design elements, is the property of COLLECTIF Engineering PLLC and is protected by applicable 
          intellectual property laws. Unauthorized use of any materials on this site may violate copyright, 
          trademark, and other laws.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Form Submissions</h2>
        <p className={styles.text}>
          When you voluntarily submit information through our Contact section, you consent to us using that 
          information to respond to your inquiry. We do not collect any personal information unless you 
          choose to provide it. Please refer to our <a href="/privacy-policy">Privacy Policy</a> for more 
          details on how we handle your information.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Disclaimer</h2>
        <p className={styles.text}>
          The information on this website is provided &quot;as is&quot; without any warranties of any kind, either 
          express or implied. COLLECTIF Engineering PLLC does not warrant that the website will be 
          uninterrupted, error-free, or free of viruses or other harmful components.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
        <p className={styles.text}>
          COLLECTIF Engineering PLLC shall not be liable for any direct, indirect, incidental, 
          consequential, or punitive damages arising out of your use of, or inability to use, this website.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Third-Party Links</h2>
        <p className={styles.text}>
          Our website may contain links to third-party websites. These links are provided for your 
          convenience and do not imply endorsement. We are not responsible for the content or practices of 
          any linked sites.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Changes to These Terms</h2>
        <p className={styles.text}>
          We reserve the right to modify these Terms of Service at any time. Changes will be effective 
          immediately upon posting to this page. Your continued use of the website constitutes acceptance 
          of any modified terms.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <p className={styles.text}>
          If you have any questions about these Terms of Service, please reach out to us through 
          our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  )
}

export default TermsOfService
