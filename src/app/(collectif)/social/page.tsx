import React from 'react'
import Script from 'next/script';
import styles from '@/styles/social.module.css';

const Social = () => {
  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader}>  
        <h1 className={styles.staticHeader}>SOCIAL</h1>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.widgetContainer}>
          <div data-key="LinkedIn Feed Wall" className="ft" id="ftgqasxwe"></div>
          <Script 
            src="https://wdg.fouita.com/widgets/0x3c1835.js" 
            strategy="lazyOnload"
          />
        </div>
      </div>
    </div>
  )
}

export default Social
