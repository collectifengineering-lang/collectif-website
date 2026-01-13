import { Portfolio } from '@/interfaces'
import MoreProjectsGridCard from '../more-project-grid-card/MoreProjectsGridCard';
import styles from '@/styles/work.module.css'

interface Props {
    portfolioWorks: Portfolio[];
}

const MoreProjectCard = ({ portfolioWorks } : Props) => {
  return (
    <div className='m-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'>
      {portfolioWorks.map((work) => (
        <div key={work.id} className={styles.cardContainer}>
          <MoreProjectsGridCard
            portfolioWorks={work}
          />
        </div>
      ))}
    </div>
  )
}

export default MoreProjectCard