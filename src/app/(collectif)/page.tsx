import React from 'react'
import Hero from './hero/hero'
import styles from '@/styles/screen.module.css'

export default function page() {
  return (
    <div className={styles.heroContainer}>
      <Hero />
    </div>
  )
}
