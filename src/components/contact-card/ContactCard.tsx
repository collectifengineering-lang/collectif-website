"use client";
import React from "react";
import styles from "@/styles/contact.module.css";

const ContactCard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.cardContainer}>
        <div className={styles.introSection}>
          <p className={styles.introText}>
            Whether you are embarking on a new development or renovating an existing space, drop us
            a line. Let's design the future together.
          </p>
        </div>
        
        <div className={styles.contactInfoSection}>
          <div className={styles.contactMethods}>
            <div className={styles.contactBox}>
              <span className={styles.contactLabel}>Email</span>
              <a
                href="mailto:connect@collectif.nyc"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                connect@collectif.nyc
              </a>
            </div>
            <div className={styles.contactBox}>
              <span className={styles.contactLabel}>Phone</span>
              <a href="tel:+16466100343" className={styles.contactLink}>
                +1 646.610.0343
              </a>
            </div>
            <div className={styles.contactBox}>
              <span className={styles.contactLabel}>Social Media</span>
              <div className={styles.socialMedia}>
                <a
                  href="https://www.linkedin.com/company/collectif-engineering-pllc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  LinkedIn
                </a>
                <span className={styles.separator}>|</span>
                <a
                  href="https://www.instagram.com/collectifmep/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
          
          <div className={styles.addressSection}>
            <div className={styles.addressBox}>
              <p className={styles.addressTitle}>NEW YORK</p>
              <p>27 W 20th Street Suite 204</p>
              <p>New York, NY 10001</p>
            </div>
            <div className={styles.addressBox}>
              <p className={styles.addressTitle}>SAN JUAN</p>
              <p>1607 Ave. Ponce de Leon STE GME 6</p>
              <p>San Juan, PR 00909</p>
            </div>
            <div className={styles.addressBox}>
              <p className={styles.addressTitle}>MIAMI</p>
              <p>701 Brickell Ave Suite 1550</p>
              <p>Miami, FL 33131</p>
            </div>
            <div className={styles.addressBox}>
              <p className={styles.addressTitle}>NEW JERSEY</p>
              <p>1585 Springfield Ave Suite 2</p>
              <p>Maplewood, NJ 07040</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
