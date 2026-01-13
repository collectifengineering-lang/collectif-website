'use client'
import { useEffect, useState } from "react";
import { useUIStore } from "@/store";
import { portfolioData } from "@/seed/seed";
import styles from '@/styles/work.module.css';
import WorkScreen from "@/components/work-screen/WorkScreen";
import { useRouter, usePathname } from "next/navigation";

const data = portfolioData.portfolio;

const Work = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false); 
    const portfolioWorks = useUIStore(state => state.portfolioData);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (pathname === '/works') {
            router.push('#portfolio');
        }
    }, [router, pathname]);

    if (!mounted) return null;

    const morePortfolioWorks = data
        .filter(p => p.id !== portfolioWorks?.id)
        .slice(0, 5);

    return (
        <div className={styles.container}>
            {portfolioWorks && (
                <WorkScreen 
                    portfolioWorks={portfolioWorks}
                    morePortfolioWorks={morePortfolioWorks}
                />
            )}
        </div>
    );
}

export default Work;
