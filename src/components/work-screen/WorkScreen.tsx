import { Portfolio } from '@/interfaces';
import React from 'react'
import PortfolioSlideshow from "@/components/work/slideshow/PortfolioSlideshow";
import WorkCard from "@/components/work-card/WorkCard";
import Link from "next/link";
import { roboto } from "@/config/fonts";
import styles from '@/styles/work.module.css';
import MoreProjectCard from "@/components/more-project-card/MoreProjectCard";
import { PortfolioMobileSlideShow } from '../work/slideshow/PortfolioMobileSlideShow';


interface Props {
    portfolioWorks: Portfolio;
    morePortfolioWorks: Portfolio[];
}


const WorkScreen = ({portfolioWorks, morePortfolioWorks}: Props) => {
  return (
    <div className={styles.swiperContainer}>
        <div className={styles.projectHeader}>
            <Link href="/work" className={styles.backButtonLink}>
                <button className={`${roboto.className} ${styles.backButton}`}>
                    &larr; Back
                </button>
            </Link>
            <h2 className={styles.projectTitle}>{portfolioWorks.title.toUpperCase()}</h2>
        </div>

        <div className={styles.firstSection}>
            {portfolioWorks ? (
                <PortfolioSlideshow 
                    title={portfolioWorks.title}
                    images={portfolioWorks.images}
                    className="hidden md:block"
                />
            ) : (
                <p>Portfolio work not found.</p>
            )}
            <div>
                { portfolioWorks ? (
                    <PortfolioMobileSlideShow 
                    title={portfolioWorks.title}
                    images={portfolioWorks.images}
                    className="block md:hidden"
                />) : (
                    <p>Portfolio work not found.</p>
                )}
            </div>
        </div>

        <div className={styles.secondSection}>
            {portfolioWorks ? <WorkCard portfolioWorks={[portfolioWorks]} /> : <p>No portfolio works available.</p>}
        </div>

        <div className={styles.thirdSection}>
            <h2 className={styles.thirdSectionTitle}>MORE PROJECTS</h2>
            <MoreProjectCard portfolioWorks={morePortfolioWorks}/>
        </div>
    </div>
  )
}

export default WorkScreen