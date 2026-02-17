import React from 'react'
import styles from '@/styles/about.module.css';
import AboutContent from '@/components/about-background/AboutContent';
import { teamPrincipalData } from "@/seed/seedTeamPrincipal";
import { studiosData } from '@/seed/seedStudio';

const data = teamPrincipalData.team
const studio = studiosData.studios

const Studio = () => {
  return (
    <div className={ styles.container }>
        <AboutContent 
            dataPrincipalTeam={data}
            studiosData={studio}
        />
    </div>
  )
}

export default Studio
