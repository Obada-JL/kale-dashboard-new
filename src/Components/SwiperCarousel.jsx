import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const SwiperCarousel = ({ 
  slides, 
  spaceBetween = 30, 
  slidesPerView = 1,
  navigation = true,
  pagination = true,
  loop = true,
  autoplay = false,
  breakpoints = null,
  renderItem
}) => {
  // Default autoplay config
  const autoplayConfig = autoplay ? {
    delay: 3000,
    disableOnInteraction: false
  } : false;

  // Default breakpoints if not provided
  const defaultBreakpoints = {
    640: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 30,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 40,
    },
  };

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={spaceBetween}
      slidesPerView={slidesPerView}
      navigation={navigation}
      pagination={pagination ? { clickable: true } : false}
      loop={loop}
      autoplay={autoplayConfig}
      breakpoints={breakpoints || defaultBreakpoints}
      className="swiper-carousel"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          {renderItem ? renderItem(slide, index) : (
            <div className="swiper-slide-content">
              {slide.image && <img src={slide.image} alt={slide.title || `Slide ${index + 1}`} />}
              {slide.title && <h3>{slide.title}</h3>}
              {slide.description && <p>{slide.description}</p>}
            </div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SwiperCarousel; 