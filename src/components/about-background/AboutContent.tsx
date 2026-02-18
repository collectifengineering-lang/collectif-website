import styles from '@/styles/about.module.css';
import { Team } from '@/interfaces'
import CardAboutTeam from './CardAboutTeam';
import StudioMainCard from './StudioMainCard';
import Image from 'next/image';

interface Props {
    dataPrincipalTeam: Team[],
}

const AboutContent = ({dataPrincipalTeam }: Props) => {
  return (
    <div className={styles.container}>
        <div className={styles.ownerAndBannerRow}>
            <div className={styles.bannerColumn}>
                <div className={styles.bannerImageWrapper}>
                    <Image
                        src="/about/profile-banner.png"
                        alt="Collectif Engineering"
                        width={900}
                        height={500}
                        className={styles.bannerImage}
                        priority
                    />
                    <h1 className={styles.aboutUsText}>ABOUT<br/>US</h1>
                    <div className={styles.missionOverlay}>
                        <h2 className={styles.missionLabel}>OUR MISSION</h2>
                        <p className={styles.missionText}>
                            TO COLLECTIVELY SOLVE HUMANITY&#39;S ENGINEERING CHALLENGES AND ELEVATE OUR WELL-BEING IN THE BUILT ENVIRONMENT.
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles.ownerColumn}>
                <StudioMainCard/>
            </div>
        </div>
        <div className={styles.leadershipRow}>
          <div className={styles.leadershipTextColumn}>
            <h1 className={styles.titleText}>
                EXPERT LEADERSHIP
            </h1>
            <p className={styles.leadershipDescription}> 
                Our leadership brings years of hands-on technical expertise,
                problem-solving and a deep understanding of how design
                impacts constructability, schedules, and budgets.
            </p>
          </div>
          <div className={styles.leadershipCardsColumn}>
            <CardAboutTeam selectedTeams={dataPrincipalTeam}/>
          </div>
        </div>
    </div>
  );
};

export default AboutContent;
