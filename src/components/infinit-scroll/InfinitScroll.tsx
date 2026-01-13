import React from 'react'
import styles from '@/styles/slider.module.css'

interface Props {
    textLine: string;
    quantity: number;
    width: string;
    height: string;
}

const InfinitScroll = ({textLine, quantity, width, height}: Props) => {

    const textTitle = Array(quantity).fill(textLine)
        return (
            <div className={styles.container}>
                <div 
                    className={styles.slider}
                    style={
                        { '--quantity-items': quantity, '--infinity-scroll-width': width, '--infinity-scroll-height': height } as React.CSSProperties
                    }
                >
                    <div className={styles.list}>
                        {
                            textTitle.map((text, index) => {
                                return (
                                    <div 
                                        key={index} 
                                        className={`${styles.item}`}
                                        style={{'--position': index} as React.CSSProperties}
                                    >
                                        <p className={styles.title}>{text}</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
    </div>
  )
}

export default InfinitScroll