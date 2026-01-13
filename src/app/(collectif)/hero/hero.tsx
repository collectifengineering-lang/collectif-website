'use client';

import React, { useEffect, useRef } from 'react';
import styles from '@/styles/hero.module.css';
import { inter, roboto } from "@/config/fonts";

const Hero = () => {


  const interBubbleRef = useRef<HTMLDivElement | null>(null);
  const curXRef = useRef(0);
  const curYRef = useRef(0);
  const tgXRef = useRef(0);
  const tgYRef = useRef(0);

  useEffect(() => {
    function move() {
      if (interBubbleRef.current) {
        curXRef.current += (tgXRef.current - curXRef.current) / 20;
        curYRef.current += (tgYRef.current - curYRef.current) / 20;
        interBubbleRef.current.style.transform = `translate(${Math.round(curXRef.current)}px, ${Math.round(curYRef.current)}px)`;
      }

      requestAnimationFrame(move);
    }

    window.addEventListener('mousemove', (event) => {
      tgXRef.current = event.clientX;
      tgYRef.current = event.clientY;
    });
    move();


    return () => {
      window.removeEventListener('mousemove', (event) => {
        tgXRef.current = event.clientX;
        tgYRef.current = event.clientY;
      });
    };
  }, []);

  return (
    <>
      <div className={styles.container}>
          <div ref={interBubbleRef} className={styles.titleContainer}>
            <div className={`${roboto.className} ${styles.mainTextBox}`}>
              <div className={styles.gridText}>
                <span className={styles.letter}>C</span>
                <span className={styles.letter}>O</span>
                <span className={styles.letter}>L</span>
                <span className={styles.letter}>L</span>
                <span className={styles.letter}>E</span>
                <span className={styles.letter}>C</span>
                <span className={styles.letter}>T</span>
                <span className={styles.letter}>I</span>
                <span className={styles.titleTextLastLetter}>F</span>
              </div>
            </div>
            <div className={styles.secondaryTextBox}>
              <h2 className={`${inter.className} ${styles.firstText}`}>
                UNIFYING MINDS,
              </h2>
              <h2 className={`${inter.className} ${styles.secondaryText}`}>ENGINEERING</h2>
              <h2 className={`${inter.className} ${styles.thirdText}`}>OUR FUTURE</h2>
            </div>
          </div>
          {/* BACKGROUND COLORS */}
            <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="goo">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -9" result="goo" />
                  <feBlend in="SourceGraphic" in2="goo" />
                </filter>
              </defs>
            </svg>
          <div className={styles.gradientContainer}>
            <div className={styles.g1}></div>
            <div className={styles.g2}></div>
            <div className={styles.g3}></div>
            <div className={styles.g4}></div>
            <div className={styles.g5}></div>
            <div className={styles.g6}></div>
            <div ref={interBubbleRef} className={styles.interactive}></div>
          </div>
      </div>
    </>
  );
};

export default Hero;
