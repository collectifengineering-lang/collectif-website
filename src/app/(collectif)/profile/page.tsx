import React from 'react'
import styles from '@/styles/culture.module.css';
import ProfileSection from '@/components/culture/CultureSection';
import PeopleSection from '@/components/people/PeopleSection';

const Profile = () => {
  return (
    <div className={styles.container}>
        <ProfileSection />
        <PeopleSection />
    </div>
  )
}

export default Profile
