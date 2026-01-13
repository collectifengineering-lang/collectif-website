import styles from '@/styles/work.module.css'
import { Portfolio } from '@/interfaces'

interface Props {
    portfolioWorks: Portfolio[];
}
const WorkCard = ({ portfolioWorks } : Props) => {
  return (
    <div className={styles.containerSecondSection}>
          {portfolioWorks.map((work, index) => (
            <div  className={styles.secondSection} key={index}>
              <div className={styles.secondSection__leftSide}>
                <div className={styles.secondSection__leftSide__content}>
                  <h1 className={styles.titlesWork}>{work.title}</h1>
                  <p className={styles.categoryWork}>{work.category}</p>
                  <p className={styles.descriptionWork}>{work.description}</p>
                </div>
              </div>
              <div className={styles.verticalLine}></div>
              <div className={styles.secondSection__rightSide}>
                <div className={styles.seconSection__rightSide__content}>
                  <h2 className={styles.titlesWork}>Client</h2>
                  <p className={styles.contentText}>{work.client}</p>
                  <h2 className={styles.titlesWork} >Architect</h2>
                  <p className={styles.contentText}>{work.architect}</p>
                  <h2 className={styles.titlesWork} >Location</h2>
                  <p className={styles.contentText}>{work.location}</p>
                </div>
              </div>
            </div>
          ))}
  </div>
  )
}

export default WorkCard