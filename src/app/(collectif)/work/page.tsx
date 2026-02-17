'use client';
import React from 'react';
import styles from '@/styles/portfolio.module.css';
import { portfolioData } from "@/seed/seed";
import { ProductGrid } from '@/components/portfolio-grid/PortfolioGrid';
import { WorkCategoryGrid } from '@/components/work-category-grid/WorkCategoryGrid';
import { roboto } from '@/config/fonts';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store';

const data = portfolioData.portfolio;

const Work = () => {
  const selectedCategory = useUIStore((state) => state.selectedWorkCategory);
  const setSelectedCategory = useUIStore((state) => state.setSelectedWorkCategory);

  const filteredData = selectedCategory
    ? data.filter((d) => d.category.toUpperCase() === selectedCategory.toUpperCase())
    : [];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {selectedCategory === null ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WorkCategoryGrid onCategorySelect={handleCategorySelect} />
          </motion.div>
        ) : (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.categoryHeader}>
              <button
                className={`${roboto.className} ${styles.backButton}`}
                onClick={handleBack}
              >
                &larr; Back
              </button>
              <h2 className={styles.categoryTitle}>{selectedCategory.toUpperCase()}</h2>
            </div>
            <ProductGrid dataPortfolio={filteredData} selectedCategory={selectedCategory} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Work;
