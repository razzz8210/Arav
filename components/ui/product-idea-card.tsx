import { classNames } from "@/app/utils/classNames";
import { useRouter } from "next/navigation";

type ProductIdeaCardProps = {
  isLeft?: boolean;
  imageSrc: string;
  title: string;
  subtitle: string;
  description: string;
  btnMsg: string;
};

export default function ProductIdeaCard({
  isLeft = false,
  imageSrc,
  title,
  subtitle,
  description,
  btnMsg,
}: ProductIdeaCardProps) {
  const router = useRouter();
  return (
    <div className="features rounded-3xl p-2 sm:p-4 md:p-6 lg:p-8">
      <div
        className={classNames(
          "bg-white rounded-2xl h-[500px] sm:h-[550px] md:h-[600px] overflow-hidden flex flex-col lg:flex-row shadow-lg",
          isLeft ? "lg:flex-row-reverse" : "lg:flex-row"
        )}
      >
        {/* Text Section */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-black mb-3 sm:mb-4 font-semibold leading-tight">
            {title}
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-2 font-medium">
            {subtitle}
          </p>
          <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
          <button
            className="self-start cursor-pointer bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:opacity-90 transition-opacity duration-200 text-sm sm:text-base"
            onClick={() => router.push("/signin")}
          >
            {btnMsg}
          </button>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 h-[250px] sm:h-[300px] md:h-[350px] lg:h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
          <video
            src={imageSrc}
            autoPlay
            loop
            muted
            playsInline
            className="object-contain w-full h-full"
            controlsList="nodownload"
          />
        </div>
      </div>
    </div>
  );
}
