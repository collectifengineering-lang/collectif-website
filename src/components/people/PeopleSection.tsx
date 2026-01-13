import React from 'react'
import PeopleTeam from './PeopleTeam'
import styles from '@/styles/people.module.css';
import { teamPeopleData } from '@/seed/seedPeople';

const peopleData = teamPeopleData.people;

const PeopleSection = () => {
  return (
    <div 
        className={styles.containerPeopleSection}
        >
            <div className={styles.headerSection}>
                <h1 className={styles.titleHeader}>PEOPLE</h1>
            </div>
        <PeopleTeam dataPeople={peopleData} />
    </div>
  )
}

export default PeopleSection