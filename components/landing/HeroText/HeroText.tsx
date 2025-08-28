import styles from "@/components/landing/HeroText/HeroText.module.css";
import { useRouter } from "next/navigation";

const HeroText = () => {
  const router = useRouter();
  return (
    <div className={styles.heroText}>
      <div className={styles.textBlock}>
        Turn your ideas into <span className={styles.accent}>apps</span>,
        stunning <span className={styles.accent}>websites</span>, viral{" "}
        <span className={styles.accent}>reels</span>, and branded assets in
        minutes.
      </div>

      <div className={styles.textBlock}>
        No coding, no stress - just chat and watch cracked.ai bring your vision
        to life.
        <div className={styles.subtitle}>
          - All in <span className={styles.accent}>one</span> place
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={() => router.push("/signin")}
          className={styles.button}
        >
          START FOR FREE
        </button>
        <p className={styles.subtitle}>No Card Required</p>
      </div>
    </div>
  );
};

export default HeroText;
