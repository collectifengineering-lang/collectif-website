'use client'
import React from 'react'
import styles from '@/styles/studioCard.module.css';

const StudioMainCard = () => {

  return (
    <div className={styles.container}>
        <div className={styles.studioMainCardContainer}>
            <div className={styles.mainContentContainer}>
                <div className={`grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4`}>
                    <div className={styles.textTitleContainer}>
                        <h2 className={styles.textTitleMainContent}>
                            OWNER AND DESIGN FOCUSED
                        </h2>
                    </div>
                    <div className={styles.textMainContainer}>
                        <p>
                            At Collectif, we specialize in delivering comprehensive MEP-FP engineered designs
                            from concept to construction, leveraging the latest building engineering technologies.
                            Certified as a Minority-Owned Business in NYS and NYC, and a Certified Special Inspection
                            Agency in NYC, we are committed to delivering high-quality, fully coordinated designs.
                        </p>
                        <p className={styles.secondParagraph}>
                            Collectif was founded in 2016 to meet the demand for owner and design-focused MEP
                            services. This vision has driven us to develop engineering solutions that combine technical
                            excellence with a deep understanding of our clients&#39; design and operational needs. As a
                            boutique firm, we pride ourselves on our responsiveness and agility, ensuring
                            personalized attention and tailored solutions while maintaining a commitment to the broader
                            vision.
                        </p>
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