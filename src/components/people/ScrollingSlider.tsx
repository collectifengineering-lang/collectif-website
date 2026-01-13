import React from 'react'
import Image from "next/image";
import styles from '@/styles/sliderPeopleTeam.module.css'

interface Props {
    teamImages: string[],
    reverse?: boolean,
    duration?: string,
    width: string;
    height: string;
}
const ScrollingSlider = ({
    teamImages,
    reverse = false,
    duration,
    width,
    height
  }: Props) => {


    return (
      <div
        className={reverse ? styles.slider : styles.slider2}
        style={{
          '--infinit-people-image-width': width,
          '--infinit-people-image-height': height,
          '--animation-duration': `${duration}s`,
          '--quantity-slider': teamImages.length,
        } as React.CSSProperties}
      >
        <div className={reverse ? styles.list : styles.list2}>

          {teamImages.map((image, index) => (
            <div
              key={index}
              className={reverse ? styles.item : styles.item2}
              style={{ '--position': index } as React.CSSProperties}
            >
              <Image
                src={`/team/${image}`}
                alt={image.replace(/\.[^/.]+$/, '')}
                className={styles.ImageTeamScroll}
                width={100}
                height={100}
              />
            </div>
          ))}
           {teamImages.map((image, index) => (
            <div
              key={index}
              className={reverse ? styles.item : styles.item2}
              style={{ '--position': index } as React.CSSProperties}
            >
              <Image
                src={`/team/${image}`}
                alt={image.replace(/\.[^/.]+$/, '')}
                className={styles.ImageTeamScroll}
                width={100}
                height={100}
              />
            </div>
          ))}
        </div>
      </div>
      
    )
  }

export default ScrollingSlider