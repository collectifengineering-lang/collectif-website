'use client';
import React, { useState } from 'react';
import styles from '@/styles/portfolio.module.css';
import { portfolioData } from "@/seed/seed";
import { ProductGrid } from '@/components/portfolio-grid/PortfolioGrid';
import { PortfolioFilter } from '@/components/portfolio-filter/PortfolioFilter';
import Footer from '@/components/footer/Footer';

const data = portfolioData.portfolio;

const Work = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredData = selectedCategory === 'all' ? data : data.filter((data) => data.category.toUpperCase() === selectedCategory.toUpperCase());

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={ styles.stickyHeader}>   
          <h1 className={styles.staticHeader}>WORK</h1>
        </div>
        <PortfolioFilter onCategoryChange={handleCategoryChange} selectedCategory={selectedCategory} />
        <ProductGrid dataPortfolio={filteredData} selectedCategory={selectedCategory} />
      </div>
      <Footer />
    </>
  );
};

export default Work;
