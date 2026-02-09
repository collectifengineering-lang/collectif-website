import React from 'react'
import styles from '@/styles/legal.module.css'

const PrivacyPolicy = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.lastUpdated}>Last updated: February 2026</p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Introduction</h2>
        <p className={styles.text}>
          COLLECTIF Engineering PLLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to 
          protecting your personal information. This Privacy Policy explains how we collect, use, and 
          safeguard information when you visit our website.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Information We Collect</h2>
        <p className={styles.text}>
          We do not automatically collect any personal information from visitors to our website. The only 
          personal information we receive is what you voluntarily provide through our Contact section, which 
          may include your name, email address, phone number, and any message content you choose to share.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
        <p className={styles.text}>
          Any information you voluntarily submit through our Contact form is used solely for the purpose of 
          responding to your inquiry or request. We do not sell, trade, or otherwise transfer your personal 
          information to third parties.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Cookies and Tracking</h2>
        <p className={styles.text}>
          Our website may use Google Analytics to help us understand general site traffic patterns. This 
          service may use cookies to collect anonymous usage data. No personally identifiable information 
          is collected through these cookies.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Third-Party Links</h2>
        <p className={styles.text}>
          Our website may contain links to third-party websites, such as LinkedIn and Instagram. We are not 
          responsible for the privacy practices or content of these external sites. We encourage you to review 
          the privacy policies of any third-party sites you visit.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Security</h2>
        <p className={styles.text}>
          We take reasonable measures to protect any information you provide to us. However, no method of 
          transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
        <p className={styles.text}>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with 
          an updated revision date.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <p className={styles.text}>
          If you have questions about this Privacy Policy, please reach out to us through 
          our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  )
}

export default PrivacyPolicy
