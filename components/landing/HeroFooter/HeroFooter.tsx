"use client";

import React from "react";
import styles from "@/components/landing/HeroFooter/HeroFooter.module.css";
import { useRouter } from "next/navigation";

export const HeroFooter = () => {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push("/signin");
  };

  return (
    <section className={styles.heroFooter}>
      <h1 className={styles.mainTitle}>
        Build Something <span className={styles.accentBlue}>Now</span>
      </h1>
      <h1 className={styles.subtitle}>
        Let Cracked <span className={styles.accentGradient}>Do the Rest</span>
      </h1>
      {/* <p className={styles.description}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        varius enim in eros elementum tristique.
      </p> */}
      <button className={styles.button} onClick={handleGetStarted}>
        GET STARTED
      </button>
    </section>
  );
};
