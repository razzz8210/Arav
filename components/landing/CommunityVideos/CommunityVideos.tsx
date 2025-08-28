import styles from "@/components/landing/CommunityVideos/CommunityVideos.module.css";
import {
  communityImages,
  getPostTypeColor,
} from "@/components/landing/CommunityVideos/data";
import Image from "next/image";

export const CommunityVideos: React.FC = () => {
  return (
    <div id="community" className={`${styles.communityVideos} bg-[#FFFFFF]`}>
      <div className={`${styles.container} mt-[15px] bg-[#0a0a0a]`}>
        <h2 className={`${styles.title} text-white`}>From the Community</h2>
        <p className={`${styles.description} text-white`}>
          From the Community: Discover real stories and insights shared by our
          users. Join the conversation and see how others are making the most of
          their experience.
        </p>

        <div className={styles.carousel}>
          <div className={styles.marquee}>
            <div className={styles.marqueeContent}>
              {communityImages.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={styles.communityCard}
                >
                  <div className={styles.imageContainer}>
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.content}>
                    <div
                      className={styles.postType}
                      style={{
                        backgroundColor: getPostTypeColor(item.postType),
                      }}
                    >
                      {item.postType}
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicate items for seamless loop */}
              {communityImages.map((item, index) => (
                <div
                  key={`${item.id}-duplicate-${index}`}
                  className={styles.communityCard}
                >
                  <div className={styles.imageContainer}>
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className={styles.image}
                    />
                    <div className={styles.overlay}>
                      <div className={styles.playButton}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path d="M8 5v14l11-7z" fill="white" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className={styles.content}>
                    <div
                      className={styles.postType}
                      style={{
                        backgroundColor: getPostTypeColor(item.postType),
                      }}
                    >
                      {item.postType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
