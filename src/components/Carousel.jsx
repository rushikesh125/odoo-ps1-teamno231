import { bannerImages } from "@/lib/constant";
import { useState } from "react";
const Carousel=() => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, bannerImages.length - 1));
  };

  return (
    <div className="relative">
      <div className="flex overflow-x-hidden">
        {bannerImages.map((image, index) => (
          <img
            key={index}
            src={"/images/"+image}
            alt={`Image ${index + 1}`}
            className={`w-full h-48 object-cover ${index === currentIndex ? 'block' : 'hidden'}`}
          />
        ))}
      </div>
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 focus:outline-none"
        onClick={handlePrev}
        disabled={currentIndex === 0}
      >
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 focus:outline-none"
        onClick={handleNext}
        disabled={currentIndex === bannerImages.length - 1}
      >
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Carousel;