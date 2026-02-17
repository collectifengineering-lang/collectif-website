import React from 'react'
import styles from '@/styles/portfolio.module.css'
import { roboto } from "@/config/fonts";

interface Props {
    onCategoryChange: (category: string) => void;
    selectedCategory: string;
  }
  

export const PortfolioFilter = ({ onCategoryChange, selectedCategory }: Props) => {
    const categories = [
        { label: 'Show All', value: 'all' },
        { label: 'Wellness', value: 'Wellness' },
        { label: 'Cultural', value: 'Cultural' },
        { label: 'Hospitality', value: 'hospitality' },
        { label: 'Modular', value: 'Modular' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Residential', value: 'Residential' },
        { label: 'Corporate', value: 'corporate' },
        { label: 'Healthcare', value: 'healthcare' },
      ];
    
      return (
        <div className={styles.linkSelector}>
          <ul className={`${roboto.className} ${styles.actions}`}>
            {categories.map((category) => (
              <li key={category.value}>
                <button
                  className={`${styles.action} ${selectedCategory === category.value ? styles.active : ''}`}
                  onClick={() => onCategoryChange(category.value)}
                >
                  {category.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    };