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
        { label: 'Commercial', value: 'commercial' },
        { label: 'Retail', value: 'retail' },
        { label: 'Corporate', value: 'corporate' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Hospitality', value: 'hospitality' },
        { label: 'Cultural', value: 'Cultural' },
        { label: 'Residential', value: 'Residential' },
        { label: 'Wellness', value: 'Wellness' },
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