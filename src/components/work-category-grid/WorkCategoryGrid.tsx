'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from '@/styles/workCategoryGrid.module.css';
import { mainFont } from '@/config/fonts';
import { portfolioData } from '@/seed/seed';

interface CategoryTile {
    name: string;
    value: string;
}

const categories: CategoryTile[] = [
    { name: 'Wellness', value: 'Wellness' },
    { name: 'Cultural', value: 'Cultural' },
    { name: 'Residential', value: 'Residential' },
    { name: 'Modular', value: 'Modular' },
    { name: 'Hospitality', value: 'Hospitality' },
    { name: 'Corporate', value: 'Corporate' },
    { name: 'Commercial', value: 'Commercial' },
];

const getCategoryImage = (categoryValue: string): string => {
    const project = portfolioData.portfolio.find(
        (p) => p.category.toLowerCase() === categoryValue.toLowerCase()
    );
    return project ? `/portfolio/${project.images[0]}` : '';
};

interface Props {
    onCategorySelect: (category: string) => void;
}

const gridAreaMap: Record<string, string> = {
    Wellness: styles.areaWellness,
    Cultural: styles.areaCultural,
    Residential: styles.areaResidential,
    Modular: styles.areaModular,
    Hospitality: styles.areaHospitality,
    Corporate: styles.areaCorporate,
    Commercial: styles.areaCommercial,
};

export const WorkCategoryGrid = ({ onCategorySelect }: Props) => {
    return (
        <div className={styles.grid}>
            {categories.map((category, index) => {
                const image = getCategoryImage(category.value);
                const areaClass = gridAreaMap[category.value] ?? '';
                return (
                    <motion.button
                        key={category.value}
                        className={`${styles.tile} ${areaClass}`}
                        onClick={() => onCategorySelect(category.value)}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.08,
                            ease: 'easeOut',
                        }}
                    >
                        {image && (
                            <Image
                                src={image}
                                alt={category.name}
                                fill
                                className={styles.tileImage}
                                sizes="(max-width: 820px) 100vw, 33vw"
                            />
                        )}
                        <div className={styles.overlay}>
                            <h2 className={`${mainFont.className} ${styles.categoryName}`}>
                                {category.name}
                            </h2>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};
