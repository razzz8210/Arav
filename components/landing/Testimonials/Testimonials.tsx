import { testimonials } from "@/components/landing/Testimonials/data";
import styles from "@/components/landing/Testimonials/Testimonials.module.css";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`${styles.star} ${i < rating ? styles.starActive : styles.starInactive} relative`}>
          <Image
            src="/landing/testimonials/star.png"
            alt="star"
            width={16}
            height={16}
          />
        </div>
      ))}
    </div>
  );
};

export const Testimonials: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!api || isHovered) return;

    // Auto-play functionality
    const autoPlay = setInterval(() => {
      api.scrollNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(autoPlay);
  }, [api, isHovered]);

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Trusted by <span className={styles.accentBlack}>Creators</span>.{" "}
            <span className={styles.accentPurple}>Powered by You</span>.
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div
          className={styles.carouselContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              dragFree: false,
              containScroll: "trimSnaps",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4"
                >
                  <Card className="h-full bg-[#f4f4f5] border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Star Rating */}
                      <StarRating rating={testimonial.rating} />

                      {/* Testimonial Content */}
                      <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium flex-grow">
                        {testimonial.content}
                      </p>

                      {/* Author Info - Always at bottom */}
                      {/* <div className="flex items-center gap-3 mt-auto">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={testimonial.author.avatar} 
                            alt={testimonial.author.name}
                          />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-medium">
                            {testimonial.author.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {testimonial.author.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {testimonial.author.role}
                          </p>
                        </div>
                      </div> */}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows - Bottom Center */}
            <div className={styles.navigationContainer}>
              <CarouselPrevious
                className={`${styles.navigationButton} translate-x-0 translate-y-0`}
              />
              <CarouselNext
                className={`${styles.navigationButton} translate-x-0 translate-y-0`}
              />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};
