'use client'
import React from 'react'
import styles from '@/styles/studioCard.module.css';

const StudioMainCard = () => {

  const letter = 'MEP-FP, ';

  return (
    <div className={styles.container}>
        <div className={styles.studioMainCardContainer}>
            {/* BACKGROUND COLORS */}
            <div className={styles.mainContentContainer}>
                <div className={`grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4`}>
                    <div className={styles.textTitleContainer}>
                        {/* <h2 className={styles.textTitleMainContent}>
                            MPE-FP
                        </h2> */}
                    </div>
            <div className={styles.textMainContainer}>
                <span className={styles.letterText}>{letter}</span>
                {` design, consulting, commissioning, and R&D firm. We offer comprehensive engineered designs
                from concept to construction, leveraging the last building engineering technologies. Recognized as a 
                Certified Minority-Owned Business, a Disadvantaged Business Enterprise, and a Certified Special Inspection
                Agency in NYC, we are committed to delivering high-quality, fully coordinated designs.`}
            </div>
                </div>
            </div>

            <div className={styles.gradientContainer}>
                <div className={styles.g1}></div>
                <div className={styles.g2}></div>
                <div className={styles.g3}></div>
                <div className={styles.g4}></div>
                <div className={styles.g5}></div>
                <div className={styles.g6}></div>
                <div className={styles.interactive}></div>
            </div>
        </div>
    </div>
  )
}

export default StudioMainCard