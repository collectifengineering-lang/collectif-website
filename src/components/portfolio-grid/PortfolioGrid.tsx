'use client';

import React, { useState, useEffect } from 'react';
import { Portfolio } from '@/interfaces';
import { PortfolioGridItem } from './PortfolioGridItem';
import { motion } from 'framer-motion';
import styles from '@/styles/portfolioButton.module.css';
import { roboto } from "@/config/fonts";

interface Props {
    dataPortfolio: Portfolio[],
    selectedCategory: string,
}

export const ProductGrid = ({ dataPortfolio, selectedCategory }: Props) => {


  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const newCount = selectedCategory === 'all' ? 9 : dataPortfolio.length;
    setVisibleCount(newCount);
  }, [selectedCategory, dataPortfolio]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {dataPortfolio.slice(0, visibleCount).map((data) => (
          <motion.div 
              key={data.id}
              layout
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
          >
            <PortfolioGridItem portfolioData={data} />
          </motion.div>
        ))}
      </div>

    {selectedCategory === 'all' && visibleCount < dataPortfolio.length && (
      <div>
      <div 
        className="group m-3 w-[70px] h-[70px] rounded-full overflow-hidden outline-none hover:rotate-90 duration-300 cursor-pointer"
        onClick={handleShowMore}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="70px"
          height="70px"
          viewBox="0 0 24 24"
          className="stroke-pinkCustom fill-none group-hover:fill-rose-950 group-active:stroke-rose-950 group-active:fill-slate-700 group-active:duration-0 duration-300"
        >
          <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" strokeWidth="1.5"></path>
          <path d="M8 12H16" strokeWidth="1.5"></path>
          <path d="M12 16V8" strokeWidth="1.5"></path>
        </svg>
      </div>

        <p className={`${roboto.className} ${styles.showMore}`}>Show More</p>
      </div>
    )}
    </div>
  );
};
