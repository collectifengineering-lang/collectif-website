import React from 'react'
import styles from '@/styles/about.module.css';
import AboutContent from '@/components/about-background/AboutContent';
import { teamPrincipalData } from "@/seed/seedTeamPrincipal";

const data = teamPrincipalData.team

const About = () => {
  return (
    <div className={ styles.container } id='expertise'>
        <AboutContent 
            dataPrincipalTeam={data}
        />
    </div>
  )
}

export default About