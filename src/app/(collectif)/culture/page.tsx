import React from 'react'
import styles from '@/styles/culture.module.css';
import CultureSection from '@/components/culture/CultureSection';
import PeopleSection from '@/components/people/PeopleSection';

const Culture = () => {
  return (
    <div className={styles.container}>
        <div className={ styles.stickyHeader}>  
          <h1 className={styles.staticHeader}>CULTURE</h1>
        </div>
        <CultureSection />
        <PeopleSection />
    </div>
  )
}

export default Culture