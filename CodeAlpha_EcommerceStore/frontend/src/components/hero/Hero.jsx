import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

const sliderData = [
  {
    id: 1,
    title: "Experience Pure Sound - Your Perfect Headphones Awaits!",
    offer: "Limited Time Offer 30% Off",
    buttonText1: "Buy now",
    buttonText2: "Find more",
    imgSrc: `${import.meta.env.VITE_API_URL}/uploads/header_headphone_image.png`,
  },
  {
    id: 2,
    title: "Next-Level Gaming Starts Here - Discover PlayStation 5 Today!",
    offer: "Hurry up only few lefts!",
    buttonText1: "Shop Now",
    buttonText2: "Explore Deals",
    imgSrc: `${import.meta.env.VITE_API_URL}/uploads/header_playstation_image.png`,
  },
  {
    id: 3,
    title: "Power Meets Elegance - Apple MacBook Pro is Here for you!",
    offer: "Exclusive Deal 40% Off",
    buttonText1: "Order Now",
    buttonText2: "Learn More",
    imgSrc: `${import.meta.env.VITE_API_URL}/uploads/header_macbook_image.png`,
  },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = sliderData.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 3000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <section>
      <div className="bg-[#E6E9F2] max-w-5xl mx-auto mt-6 rounded-xl overflow-hidden">
        <div
          className="flex w-full items-center transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sliderData.map((slide) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 overflow-hidden"
              style={{ flex: "0 0 100%" }}
            >
              <div className="flex flex-col md:flex-row items-center px-6 py-10 md:px-14 md:gap-8">
                {/* Content - Left on Desktop */}
                <div className="w-full md:w-1/2 text-center md:text-left order-2 md:order-1">
                  <p className="text-blue-600 font-semibold">{slide.offer}</p>
                  <h1 className="text-2xl md:text-4xl font-bold mt-2 leading-tight">
                    {slide.title}
                  </h1>
                  <div className="flex gap-6 mt-8 justify-center md:justify-start">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-3xl font-medium whitespace-nowrap">
                      {slide.buttonText1}
                    </button>
                    <button className="group flex items-center gap-2 font-medium text-gray-800 whitespace-nowrap">
                      {slide.buttonText2}
                      <ArrowRight
                        className="group-hover:translate-x-1 transition-transform duration-200"
                        size={20}
                      />
                    </button>
                  </div>
                </div>

                {/* Image - Right on Desktop */}
                <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0 order-1 md:order-2">
                  <img
                    src={slide.imgSrc}
                    alt=""
                    className="w-52 sm:w-64 md:w-72 lg:w-80 h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-5">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "bg-blue-600 scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
