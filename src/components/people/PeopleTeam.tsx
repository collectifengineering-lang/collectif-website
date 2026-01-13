'use client'
import styles from '@/styles/people.module.css';
import ScrollingSlider from './ScrollingSlider';
import useMobile from '@/hooks/mobile/useMobile';
import { useEffect, useState } from 'react';
import { People } from '@/interfaces';

interface Props {
  dataPeople: People[];
	}

const PeopleTeam = ({dataPeople} : Props) => {

  const shuffleArray = (array: string[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };
  const isMobile = useMobile(768);
  const imageSize = isMobile ? '200px' : '400px';

  const [shuffledTeam1, setShuffledTeam1] = useState<string[]>([]);
  const [shuffledTeam2, setShuffledTeam2] = useState<string[]>([]);
  const [shuffledTeam3, setShuffledTeam3] = useState<string[]>([]);

  useEffect(() => {
    setShuffledTeam1(shuffleArray(dataPeople[0].images));
    setShuffledTeam2(shuffleArray(dataPeople[0].images));
    setShuffledTeam3(shuffleArray(dataPeople[0].images));
  }, []);


  return (
    <div className={styles.container}>
        <ScrollingSlider teamImages={shuffledTeam1} reverse={true}  duration='10'  width={imageSize} height={imageSize}  />
        <ScrollingSlider teamImages={shuffledTeam2} reverse={false} duration='10'  width={imageSize} height={imageSize} />
        <ScrollingSlider teamImages={shuffledTeam3} reverse={true}  duration='10'  width={imageSize} height={imageSize}  />
        <div className={styles.textUnified}>
          <div className={styles.leftSideBottomSection}>
            <h1 className={styles.textTitleBottomSection}>
              UNIFYING MINDS...
            </h1>
            <h2>
              We’re proud to bring together a of passionate
              dynamic team, problem solvers, creative thinkers,
              and experts, all working seamlessly to deliver
              exceptional results.
            </h2>
          <span>
              We believe the best results come from teamwork.
              By blending diverse perspectives with a shared
              vision, we’re able to transform bold ideas into
              reality. Whether we’re brainstorming over coffee
              or diving deep into a project, our collaborative
              approach ensures every detail aligns with your
              goals.
          </span>
          </div>
        </div>
    </div>
  );
};

export default PeopleTeam;
