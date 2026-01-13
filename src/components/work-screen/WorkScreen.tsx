import { Portfolio } from '@/interfaces';
import React from 'react'
import PortfolioSlideshow from "@/components/work/slideshow/PortfolioSlideshow";
import WorkCard from "@/components/work-card/WorkCard";
import Link from "next/link";
import { inter } from "@/config/fonts";
import styles from '@/styles/work.module.css';
import MoreProjectCard from "@/components/more-project-card/MoreProjectCard";
import { PortfolioMobileSlideShow } from '../work/slideshow/PortfolioMobileSlideShow';


interface Props {
    portfolioWorks: Portfolio;
    morePortfolioWorks: Portfolio[];
}


const WorkScreen = ({portfolioWorks, morePortfolioWorks}: Props) => {
  return (
    <>
        <div className={styles.backToPortfolioSection}>
            <Link href="/work">
                <span className={`${inter.className} ${styles.goBackText} antialiased`}>
                    Back to Portfolio
                </span>
            </Link>
        </div>
        <div className={styles.swiperContainer}>
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
                <h1 className={styles.thirdSection_textTitle}>More Projects</h1>
                <MoreProjectCard portfolioWorks={morePortfolioWorks}/>
            </div>
        </div>
    </>
  )
}

export default WorkScreen