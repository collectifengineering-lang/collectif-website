import React from 'react'
import ContactCard from '@/components/contact-card/ContactCard';
import VideoSection from '@/components/video-cultura/VideoSection';
import styles from '@/styles/contactPage.module.css';

const Contact = () => {
    
  return (
    <div className={styles.pageContainer}>
      <ContactCard  />
      <div className={styles.videoSectionWrapper}>
        <VideoSection />
      </div>
    </div>
  )
}

export default Contact