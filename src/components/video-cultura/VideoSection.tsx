import React from 'react'
import Image from "next/image"
import styles from '@/styles/videoSection.module.css'

const VideoSection = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.overlayText}>
        Let's design the future together
      </h1>
      
      <div className={styles.content}>
        
        {/* GIF animado como fondo */}
        <Image
          src={`/video/NYCsubway.gif`}
          alt="gif animado"
          fill
          className={styles.fullImage}
          unoptimized
          priority
        />

        {/* Overlay semi-transparente */}
        <div className={styles.background}></div>

        {/* Graffiti al fondo, pero visible encima del overlay */}
        <Image
          src={`/video/graffiti.png`}
          alt="graffiti"
          className={styles.backgroundSectionImage}
          width={1200}
          height={200}
          unoptimized
          priority
        />
        
      </div>
    </div>
  )
}

export default VideoSection
