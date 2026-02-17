import React from 'react'
import styles from '@/styles/about.module.css';
import AboutContent from '@/components/about-background/AboutContent';
import { teamPrincipalData } from "@/seed/seedTeamPrincipal";
import { studiosData } from '@/seed/seedStudio';

const data = teamPrincipalData.team
const studio = studiosData.studios

const About = () => {
  return (
    <div className={ styles.container } id='expertise'>
        <AboutContent 
            dataPrincipalTeam={data}
            studiosData={studio}
        />

    </div>
  )
}

export default About