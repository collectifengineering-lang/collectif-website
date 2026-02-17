import React from 'react'
import ContactCard from '@/components/contact-card/ContactCard';
import styles from '@/styles/contactPage.module.css';

const Contact = () => {
    
  return (
    <div className={styles.pageContainer}>
      <ContactCard />
    </div>
  )
}

export default Contact