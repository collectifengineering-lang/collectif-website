import React from 'react'
import styles from '@/styles/about.module.css';
import AboutContent from '@/components/about-background/AboutContent';
import Footer from '@/components/footer/Footer';
import { teamPrincipalData } from "@/seed/seedTeamPrincipal";
import { studiosData } from '@/seed/seedStudio';

const data = teamPrincipalData.team
const studio = studiosData.studios

const Studio = () => {
  return (
    <>
      <div className={ styles.container }>
          <div className={ styles.stickyHeader}>  
            <h1 className={styles.staticHeader}>STUDIO</h1>
          </div>
          <AboutContent 
              dataPrincipalTeam={data}
              studiosData={studio}
          />
      </div>
      <Footer />
    </>
  )
}

export default Studio
