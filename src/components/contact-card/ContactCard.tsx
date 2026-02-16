"use client";
import React, { useState, useRef } from "react";
import styles from "@/styles/contact.module.css";

const ContactCard = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Spam prevention: honeypot field (should remain empty)
  const [honeypot, setHoneypot] = useState("");
  // Spam prevention: record when the form was loaded
  const formLoadTime = useRef(Date.now());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _website: honeypot,
          _loadedAt: formLoadTime.current,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", company: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardContainer}>
        <div className={styles.introSection}>
          <p className={styles.introText}>
            Whether you are embarking on a new development or renovating an existing space, drop us
            a line. Let's design the future together.
          </p>
        </div>

        {/* Contact Form Section */}
        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>Send Us a Message</h2>
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            {/* Honeypot field - hidden from humans, visible to bots */}
            <div className={styles.honeypotField} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                  placeholder="Your name"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="company" className={styles.formLabel}>
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Your company (optional)"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.formLabel}>
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select a subject</option>
                  <option value="new-project">New Project Inquiry</option>
                  <option value="consultation">Consultation Request</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="careers">Careers</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.formLabel}>
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className={styles.formTextarea}
                placeholder="Tell us about your project or inquiry..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            {submitStatus === "success" && (
              <p className={styles.successMessage}>
                Thank you! Your message has been sent successfully. We'll get back to you soon.
              </p>
            )}
            {submitStatus === "error" && (
              <p className={styles.errorMessage}>
                Something went wrong. Please try again or email us directly at connect@collectif.nyc
              </p>
            )}
          </form>
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
