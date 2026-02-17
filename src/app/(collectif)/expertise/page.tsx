import React from "react";
import Image from "next/image";
import styles from "@/styles/expertise.module.css";

const focusAreas = [
  {
    title: "Advanced Control Sequences Integrations to New Technologies",
    subtitle:
      "Precision-engineered building automation systems that optimize comfort, energy efficiency, and operational performance.",
    image: "/expertise/control-sequences.png",
  },
  {
    title: "Modular Construction & Volumetric Design",
    subtitle:
      "Factory-built precision meets on-site efficiency for faster, smarter project delivery.",
    image: "/expertise/modular.png",
  },
  {
    title: "Hospitality & Client Engagement",
    subtitle:
      "Creating immersive guest experiences through thoughtful engineering and collaborative design.",
    image: "/expertise/hospitality.png",
  },
  {
    title: "High-End Architectural Integration",
    subtitle:
      "Seamlessly embedding MEP systems within distinctive architectural visions without compromise.",
    image: "/expertise/architectural.png",
  },
];

const services = [
  "Mechanical / HVAC Design",
  "Electrical / Lighting Design",
  "Fire Alarm / Life Safety Design",
  "Plumbing / Fire Protection Design",
  "Research & Development",
  "Commissioning",
  "MEP Owner's Representation",
  "NYC Special / Progress Inspections",
  "Energy Modeling",
];

const expertise = [
  "Hospitality",
  "Wellness",
  "Residential",
  "Cultural",
  "Commercial",
  "Corporate",
  "Modular",
  "Marine",
  "Healthcare",
];

const Expertise = () => {
  return (
    <div className={styles.container}>
      {/* Focus Areas with Overlapping Pink Box */}
      <div className={styles.focusWrapper}>
        <div className={styles.pinkOverlay}>
          <h1 className={styles.heroTitle}>Unique Focus Areas</h1>
          <p className={styles.heroDescription}>
            What sets us apart? Our unique focus areas reflect our commitment to
            innovation and client satisfaction. We blend diverse perspectives and
            technical expertise to deliver projects that are not only functional
            but also inspiring and sustainable through four focus areas.
          </p>
        </div>

        <div className={styles.focusGrid}>
          {focusAreas.map((area) => (
            <div key={area.title} className={styles.focusCard}>
              <Image
                src={area.image}
                alt={area.title}
                fill
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
                className={styles.focusCardImage}
                priority
              />
              <div className={styles.focusCardOverlay}>
                <span className={styles.focusCardTitle}>{area.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Services & Expertise */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesColumn}>
          <h2 className={styles.columnTitle}>Our Services</h2>
          <ul className={styles.columnList}>
            {services.map((item) => (
              <li key={item} className={styles.columnListItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.servicesColumn}>
          <h2 className={styles.columnTitle}>Our Expertise</h2>
          <ul className={styles.columnList}>
            {expertise.map((item) => (
              <li key={item} className={styles.columnListItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.servicesColumn}>
          <p className={styles.servicesDescription}>
            We provide a broad range of design, consulting, and inspection
            services, specializing in mechanical, electrical, and plumbing
            systems, as well as energy modeling and commissioning. With expertise
            across industries such as hospitality, wellness, residential, and
            commercial, we deliver tailored solutions to meet the specific needs
            of each project, ensuring efficiency, safety, and sustainability.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Expertise;
