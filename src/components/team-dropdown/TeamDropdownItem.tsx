'use client'

import { Team } from "@/interfaces"
import styles from '@/styles/team.module.css'
import gsap from "gsap";
import Image from "next/image";
import { useRef, useEffect, useCallback } from "react";

interface Props {
  dataTeam: Team;
  bgPosition: string;
}

export const TeamDropdownItem = ({ dataTeam, bgPosition }: Props) => {
  const membersRef = useRef<HTMLLIElement | null>(null);
  const preview = useRef<HTMLImageElement | null>(null);
  const previewImg = useRef<HTMLImageElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const isInside = useRef(false);

  // Usa useCallback para memorizar la función moveStuff
  const moveStuff = useCallback((e: MouseEvent) => {
    const mouseInside = isMouseInsideContainer(e);

    if (mouseInside !== isInside.current) {
      isInside.current = mouseInside;
      if (isInside.current) {
        gsap.to(preview.current, {
          duration: 0.3,
          scale: 0.7,
        });
      } else {
        gsap.to(preview.current, {
          duration: 0.3,
          scale: 0,
        });
      }
    }
  }, []); // No tiene dependencias, así que se memoriza correctamente.

  // Usa useCallback para memorizar la función moveMember
  const moveMember = useCallback((e: MouseEvent) => {
    const previewRect = preview.current?.getBoundingClientRect();
    if (!previewRect) return;

    const offsetX = previewRect.width / 6;
    const offsetY = previewRect.height / 6;

    if (preview.current) {
      preview.current.style.left = `${e.pageX + offsetX}px`;
      preview.current.style.top = `${e.pageY - offsetY}px`;
    }
  }, []); // También sin dependencias.

  // Usa useCallback para memorizar la función moveMemberImg
  const moveMemberImg = useCallback(() => {
    gsap.to(previewImg.current, {
      duration: 0.4,
      backgroundPosition: bgPosition || "0 0",
    });
  }, [bgPosition]); // Dependemos de bgPosition, ya que puede cambiar.

  const isMouseInsideContainer = (e: MouseEvent) => {
    const containerRect = container.current?.getBoundingClientRect();
    if (!containerRect) {
      return false;
    }

    const mouseX = e.pageX;
    const mouseY = e.clientY;
    return (
      mouseX >= containerRect.left &&
      mouseX <= containerRect.right &&
      mouseY >= containerRect.top &&
      mouseY <= containerRect.bottom
    );
  };

  useEffect(() => {
    window.addEventListener("mousemove", moveStuff);
    const membersElement = membersRef.current as HTMLLIElement | null;

    membersElement?.addEventListener("mousemove", moveMember);
    membersElement?.addEventListener("mousemove", moveMemberImg);

    return () => {
      window.removeEventListener("mousemove", moveStuff);
      if (membersElement) {
        membersElement.removeEventListener("mousemove", moveMember);
        membersElement.removeEventListener("mousemove", moveMemberImg);
      }
    };
  }, [moveStuff, moveMember, moveMemberImg]); // Pasamos las funciones memorizaras como dependencias.

  return (
    <div className={styles.container} ref={container}>
      <div className={styles.preview} ref={preview}>
        <Image
          src={`/teams/${dataTeam.images[0]}`}
          alt={dataTeam.name}
          className={styles.preview_img}
          width={300}
          height={300}
          ref={previewImg}
        />
      </div>
      <div className={styles.line}></div>
      <ul className={styles.dropdown}>
        <li
          className={styles.dropdown__List}
          ref={membersRef}
          id={dataTeam.id.toString()}
        >
          <div className={styles.dropdown__Link}>
            <span className={styles.dropdown__content1}>
              <span className={styles.circleButton__content1}>➜</span>
              <span className={styles.nameText}>{dataTeam.name}</span>
              <span className={styles.nameText}>{dataTeam.surname}</span>
            </span>
            <span className={styles.dropdown__content2}>
              <span className={styles.nameText}>{dataTeam.profession}</span>
            </span>
            <input type="checkbox" className={styles.dropdown__check} />
          </div>
          <div className={styles.dropdown__content}>
            <ul className={styles.dropdown__sub}>
              <li className={styles.dropdown__Li}>
                <span className={styles.dropdown__dropdown__li1}>
                  <div className={styles.textContainer__dropdown__li1}>
                    <p className={styles.dropdown__anchor}>
                      {dataTeam.description}
                    </p>
                  </div>
                </span>
                <span className={styles.dropdown__dropdown__li2}>
                  {dataTeam.linkedin !== "" ? (
                    <a
                      href={`${dataTeam.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.dropdown__anchor} ${styles.button__dropdown__li2}`}
                    >
                      {" "}
                      Linkedin
                    </a>
                  ) : (
                    ""
                  )}
                  {dataTeam.email !== "" ? (
                    <a
                      href={`mailto:${dataTeam.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.dropdown__anchor} ${styles.button__dropdown__li2}`}
                    >
                      {" "}
                      Email
                    </a>
                  ) : (
                    ""
                  )}
                  <span className={styles.circleButton__dropdown__li2}>➜</span>
                </span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <div className={styles.line}></div>
    </div>
  );
};
