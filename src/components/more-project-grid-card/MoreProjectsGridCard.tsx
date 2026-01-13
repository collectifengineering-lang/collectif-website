'use client'

import styles from '@/styles/work.module.css';
import Image from 'next/image';
import { Portfolio } from '@/interfaces';
import { useRouter } from "next/navigation";
import { useUIStore } from '@/store';

interface Props {
    portfolioWorks: Portfolio;
}

const MoreProjectsGridCard = ({ portfolioWorks }: Props) => {
    const setPortfolioData = useUIStore(state => state.setPortfolioData);
    const router = useRouter();
    const handlePortfolio = (portfolio: Portfolio) => {
        setPortfolioData(portfolio); // Guarda los datos del portafolio seleccionado
        router.push(`/works`); // Navega a la página del proyecto específico
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardImageSection}>
                <button 
                    onClick={() => handlePortfolio(portfolioWorks)} // Pasa el proyecto correcto
                >
                    <Image 
                        width={1000}
                        height={1000}
                        src={`/portfolio/${portfolioWorks.images[0]}`}
                        alt={portfolioWorks.title}
                        className="object-fill"
                    />
                </button>
            </div>
            <div className={styles.contentSection}>
                <h3 className={styles.cardTitle}>{portfolioWorks.title}</h3>
            </div>
        </div>
    );
}

export default MoreProjectsGridCard;
