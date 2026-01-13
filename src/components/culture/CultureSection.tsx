'use client'
import React from 'react'
import styles from '@/styles/culture.module.css';
import Image from 'next/image';
import InfinitScrollCulture from '../infinite-scroll-culture/InfinitScrollCulture';
import useMobile from '@/hooks/mobile/useMobile';

const CultureSection = () => {
  const isMobile = useMobile(768);
  const isTablet = useMobile(1054);
  return (
    <div className={styles.containerCulture}>
      <div className={styles.contentContainerCulture}>
        {/* Sección del header */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${styles.customGap}`}>
          <div className={styles.headerCultureleftBox}>
            <span className={styles.secondaryText}>
              TO COLLECTIVELY SOLVE HUMANITY’S ENGINEERING CHALLENGES AND 
              ELEVATE OUR WELL-BEING IN THE BUILT ENVIRONMENT.
            </span>
          </div>
          <div className={styles.headerCulturerightBox}>
            <span>
              Our mission is more than just a statement; it’s a guiding principle that drives everything
              we do and extends beyond the projects we undertake. It’s a call to action to
              continuously push the boundaries of what’s possible. We aim to inspire future
              generations and thought leaders to join us in the pursuit of creating a better, more
              equitable world through the built environment.
            </span>
          </div>
        </div>

        {/* Contenedor de las dos columnas */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${styles.customGap}`}>
          {/* Primera columna */}
          <div className={styles.firstColumn}>
            <span>
              What sets us apart? Our unique focus areas reflect our commitment to innovation and
              client satisfaction. We blend diverse perspectives and technical expertise to deliver
              projects that are not only functional but also inspiring and sustainable through four focus
              areas.
            </span>
            <Image
              src={`/culture/Bathhouse-Forbes.png`}
              alt={'forbesbathhouse'}
              className={styles.imageInColumn}
              width={100}
              height={100}
            />
            <span>
              Advanced Control Sequences and Integrations to new technologies: We lead in smart
              building technologies, implementing advanced control sequences for optimized energy
              management and user comfort, enhancing system performance. We even worked
              closely with one of our clients to integrate Bitcoin miners to their HVAC systems to
              recover the waste heat. Our commitment and involvement goes from the drawing board
              to building operations.
            </span>
          </div>

          {/* Segunda columna */}
          {!isMobile && !isTablet ? (          <div className={styles.secondColumn}>
            <div className={styles.secondColumnUpperBox}>
              <Image
                src={`/culture/ModularHome2.png`}
                alt={'modularhome'}
                className={styles.imageInColumn}
                width={100}
                height={100}
              />
                <span>
                  Modular Construction / Volumetric Design: We specialize in MEP solutions for modular
                  and volumetric construction, ensuring efficiency, speed, and sustainability through pre-
                  fabricated systems that integrate seamlessly. We are fully committed to solve our
                  housing crisis - one module at a time.
                </span>
            </div>
            <div className={styles.secondColumnBottomBox}>
              <div className={styles.textInDivideColumn}>
                  <span>
                    High-End Architectural Integration: Our MEP systems are designed to complement
                    architectural visions, often hidden to maintain aesthetic appeal, ensuring functionality
                    without compromising design.
                  </span>
                  <span>
                    Hospitality and Client Engagement: Known as the &quot;Hospitality MEP Engineers,&quot; we
                    create welcoming spaces, both in our office—where we entertain clients and
                    friends—and in our projects, prioritizing user-friendly, and enjoyable environments.
                  </span>
                </div>
                <div className={styles.imageInDivideColumn}>
                  <Image
                    src={`/culture/bathroom.jpg`}
                    alt={'modularhome'}
                    className={styles.imageInColumnDivide}
                    width={100}
                    height={100}
                  />
                </div>
            </div>
          </div>) : 
            (
              <div className="w-full flex flex-col md:flex-row gap-4">
                {/* Second Column */}
                <div className="w-full flex flex-col gap-4">
                  {/* Upper Box */}
                  <div className="flex flex-col gap-4">
                    <Image
                      src="/culture/ModularHome2.png"
                      alt="modularhome"
                      width={100}
                      height={100}
                      className="w-full h-auto object-contain"
                    />
                    <p>
                      Modular Construction / Volumetric Design: We specialize in MEP solutions for modular
                      and volumetric construction, ensuring efficiency, speed, and sustainability through pre-
                      fabricated systems that integrate seamlessly. We are fully committed to solve our
                      housing crisis - one module at a time.
                    </p>
                  </div>

                  {/* Bottom Box */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Texts */}
                    <div className="flex flex-col justify-between gap-4 w-full">
                      <p>
                        High-End Architectural Integration: Our MEP systems are designed to complement
                        architectural visions, often hidden to maintain aesthetic appeal, ensuring functionality
                        without compromising design.
                      </p>
                      <p>
                        Hospitality and Client Engagement: Known as the &quot;Hospitality MEP Engineers,&quot; we
                        create welcoming spaces, both in our office—where we entertain clients and
                        friends—and in our projects, prioritizing user-friendly, and enjoyable environments.
                      </p>
                    </div>

                    {/* Image */}
                    <div className="relative w-full md:w-1/2 aspect-square overflow-hidden">
                      <Image
                        src="/culture/bathroom.jpg"
                        alt="bathroom"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
        }

        </div>
      </div>
        <div className={styles.culturePartnerSection}>
          <div className={styles.culturePartnerHeader}>
            <h2 className={styles.titleCulturePartnerSection}>Notable collaborations, clients and partners</h2>
          </div>
          <InfinitScrollCulture />
        </div>
    </div>
  )
}

export default CultureSection
