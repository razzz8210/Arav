import { Instagram, X, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";
import styles from "@/components/landing/Footer/Footer.module.css";

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left Section */}
        <div className={styles.leftSection}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Image
              src="/cracked-ai-light-logo.png"
              alt="Cracked AI"
              width={200}
              height={30}
            />
          </div>

          {/* Social Icons */}
          <div className={styles.socialIcons}>
            <a 
              href="https://x.com/crackeddotai" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <X />
            </a>
          </div>
        </div>

        {/* Right Section - Links */}
        <div className={styles.rightSection}>
          <a href="/signin" className={styles.link}>
            Get Started
          </a>
          <a href="mailto:team@cracked.ai" className={styles.link}>
            Contact Us
          </a>
          <a href="#community" className={styles.link}>
            Community
          </a>
          <a href="#features" className={styles.link}>
            Features
          </a>
          <a href="#" className={styles.link}>
            Pricing
          </a>
        </div>
      </div>

      <div className={styles.divider}>
        <hr />
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Cracked AI LLC. All rights reserved.
        </p>
        <div className={styles.bottomLinks}>
          <a href="/privacy-policy" target="_blank" className={styles.bottomLink}>
            Privacy Policy
          </a>
          <a href="/terms-of-service" target="_blank" className={styles.bottomLink}>
            Terms of Service
          </a>
          <a href="#" className={styles.bottomLink}>
            Cookies Settings
          </a>
        </div>
      </div>
    </footer>
  );
};
