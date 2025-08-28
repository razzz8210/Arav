import ProductIdeaCard from "@/components/ui/product-idea-card";
import styles from "@/components/landing/Features/Features.module.css";

export const Features = () => {
  return (
    <section id="features" className={styles.features}>
      <div className={styles.ellipse1} />
      <div className={styles.ellipse2} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={`${styles.title} text-black`}>
            All Your Creative Power,
            <span className="bg-gradient-to-r ml-2 text-[#3461EC] bg-clip-text">
              One
            </span>{" "}
            <br />
            <span className="bg-gradient-to-r from-[#775AF2] to-[#8059F3] bg-clip-text text-transparent">
              Al Chat Away
            </span>
          </h2>
        </div>

        <div>
          <ProductIdeaCard
            isLeft={false}
            imageSrc="/landing/features/feature1.webm"
            title="Turn Ideas into Apps & Websites Instantly"
            subtitle="From concept to clarity."
            description="Cracked AI helps you shape ideas into structured product visions with focus and speed."
            btnMsg="Start Creating"
          />
          <ProductIdeaCard
            isLeft={true}
            imageSrc="/landing/features/feature2.webm"
            title="Craft Marketing That Pops with Your Brand"
            subtitle="Marketing that speaks your language."
            description="Generate Al-driven campaigns, videos, and content tailored to your voice. From TikTok reels to ad copy, make it yours in seconds."
            btnMsg="Launch Your Campaign"
          />
          <ProductIdeaCard
            isLeft={false}
            imageSrc="/landing/features/feature3.webm"
            title="Kick Off from Any Idea"
            subtitle="Begin anywhere."
            description="Upload a note, a sketch, or just a thought. Cracked AI turns it into a starting point."
            btnMsg="Get Started"
          />
        </div>
      </div>
    </section>
  );
};
