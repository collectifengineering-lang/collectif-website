'use client'

import { Portfolio } from "@/interfaces"
import Image from "next/image";
import styles from '@/styles/portfolioItems.module.css'
import { useState } from "react";
import { useUIStore } from "@/store";
import { useRouter } from "next/navigation";

interface Props {
    portfolioData: Portfolio;
}

export const PortfolioGridItem = ({ portfolioData }: Props) => {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    const setPortfolioData = useUIStore(state => state.setPortfolioData);
    
    const handlePortfolio = (portfolioData: Portfolio) => {
            setPortfolioData(portfolioData);
            router.push(`/works`);
    }

    return (
        <div className={styles.container}>
                <button 
                    className={`${styles.portfolioGrid} ${isHovered ? styles.hovered : ""}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => handlePortfolio(portfolioData)}
                >
                    <Image 
                        src={`/portfolio/${portfolioData.images[0]}`}
                        alt={ portfolioData.title }
                        className={styles.imagePortfolio}
                        width={1000}
                        height={1000}
                    />

                    {/* Cartel con el título */}
                    <div className={styles.titleOverlay}>
                        {portfolioData.title}
                    </div>
                </button>
        </div>
    )
}

