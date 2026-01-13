import styles from '@/styles/about.module.css';
import { Studio, Team } from '@/interfaces'
import CardAboutTeam from './CardAboutTeam';
import SpecializedStudios from './SpecializedStudios';
import StudioMainCard from './StudioMainCard';

interface Props {
    dataPrincipalTeam: Team[],
    studiosData: Studio[]
}

const AboutContent = ({dataPrincipalTeam, studiosData }: Props) => {
  return (
    <div className={styles.container}>
        <StudioMainCard/>
        <SpecializedStudios studiosData={studiosData} />
        <div className={`${styles.thirdSection} ${'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-4'}`}>
          <div className={styles.thirdSectionText}>
            <h1 className={styles.titleText}>
                Our Leadership
            </h1>
            <p> 
                Our three Partners possess decades of combined experience in project engineering, management, and all phases of engineering services, including
                procurement, commissioning, utility coordination, and project closeout.   Our team is enhanced by staff with construction experience, which streamlines the design process by emphasizing value-engineered designs as they are
                developed. We have a proven track record of successful collaboration with design-build teams, ensuring seamless project execution.
            </p>
          </div>
        </div>
        <CardAboutTeam selectedTeams={dataPrincipalTeam}/>
    </div>
  );
};

export default AboutContent;
