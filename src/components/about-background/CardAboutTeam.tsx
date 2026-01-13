import React from 'react'
import { Team } from '@/interfaces'
import { FaLinkedinIn } from "react-icons/fa";
import { IoMailOutline } from "react-icons/io5";
import styles from '@/styles/card.about.module.css';
import Image from "next/image";

interface Props {
    selectedTeams: Team[]
}

const CardAboutTeam = ({ selectedTeams }: Props) => {
  return (
      <div className={styles.container}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {
            selectedTeams.map((data) => (
            <div className={styles.cardContainer} key={data.id}>
                <div>
                    <Image
                        src={`/about/${data.images[0]}`}
                        alt={data.name}
                        className={styles.cardImage}
                        width={300}
                        height={300}
                    />
                </ div>
                <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <div className={styles.cardNameSurnameTitle}>
                                <h1 className={styles.name}>{data.name}</h1>
                                <h1 className={styles.surname}>{data.surname}</h1>
                            </div>
                            <div className={styles.socialLinks}>
                                <a
                                    href={`${data.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaLinkedinIn size={24} />
                                </a>
                                <a
                                    href={`mailto:${data.email}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IoMailOutline size={24} />
                                </a>
                            </div>
                        </div>
                    <div className={styles.professionTitle}>
                            <h3 className={styles.profession}>{data.profession}</h3>
                    </div>
                </div>
                <p className={styles.cardDescription}>{data.description}</p>
            </div>
            ))
        }
      </div>
    </div>
  )
}

export default CardAboutTeam;
