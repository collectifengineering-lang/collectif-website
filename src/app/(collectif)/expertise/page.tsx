import React from 'react'
import styles from '@/styles/about.module.css';
import ExpertiseContent from '@/components/about-background/AboutContent';
import { teamPrincipalData } from "@/seed/seedTeamPrincipal";
import { studiosData } from '@/seed/seedStudio';

const data = teamPrincipalData.team
const studio = studiosData.studios

const Expertise = () => {
  return (
    <div className={ styles.container }>
        <ExpertiseContent 
            dataPrincipalTeam={data}
            studiosData={studio}
        />
    </div>
  )
}

export default Expertise
