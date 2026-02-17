"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from '@/styles/studios.module.css';
import VanillaTilt from 'vanilla-tilt';
import { Studio } from '@/interfaces';

interface Props {
    studiosData: Studio[]
}


interface CardProps {
    images: string;
    title: string;
    description: string;
}

const Card = ({ images, title, description }: CardProps) => {
    const [isActive, setIsActive] = useState(false);
    const cardRef = useRef(null);
    useEffect(() => {
         if (cardRef.current) {
            VanillaTilt.init(cardRef.current, {
                max: 25,
                speed: 400,
                glare: true,
                "max-glare": 0.2
            });
        }
    }, []);

    return (
        <div             
            ref={cardRef}
            className={styles.card}
            data-active={isActive}
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
            style={{ backgroundImage: `url(/studio/${images})` }}
        >
            <div className={styles.cardContent}>
                <h2 className={styles.title}>
                    {title}
                </h2>
                <div className={`${styles.content} ${isActive ? styles.show : ''}`}>
                    <p>{description}</p>
                </div>
            </div>
        </div>
    );
};

const SpecializedStudios = ({studiosData}: Props) => {
    return (
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <h1 className={styles.titleText}>Areas of Expertise</h1>
            </div>
            <div className={`${styles.gridContainer} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center`}>
                {studiosData.map((studio, index) => (
                    <Card 
                        key={index} 
                        title={studio.title}
                        description={studio.description}
                        images={studio.images[0]}
                    />
                ))}
            </div>
        </div>
    );
};

export default SpecializedStudios;
