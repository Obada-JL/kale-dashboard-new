import React from 'react';
import { Card } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    name: 'أحمد محمد',
    position: 'مدير مدرسة',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'منتجات لين التعليمية ساعدتنا كثيراً في تطوير العملية التعليمية في مدرستنا. الجودة ممتازة والخدمة رائعة.',
    rating: 5
  },
  {
    id: 2,
    name: 'سارة عبدالله',
    position: 'معلمة علوم',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    content: 'أدوات تعليمية متميزة ساعدتني في توصيل المعلومات للطلاب بطريقة سهلة وممتعة. أنصح بها جميع المعلمين.',
    rating: 4
  },
  {
    id: 3,
    name: 'خالد العمري',
    position: 'مشرف تربوي',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    content: 'تجربتي مع منتجات لين التعليمية كانت مميزة جداً. المنتجات عالية الجودة وتلبي احتياجات المدارس الحديثة.',
    rating: 5
  },
  {
    id: 4,
    name: 'نورة السالم',
    position: 'مديرة روضة أطفال',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    content: 'الألعاب التعليمية من لين ساعدت أطفالنا على التعلم بطريقة ممتعة وتفاعلية. نتائج رائعة ومنتجات آمنة للأطفال.',
    rating: 5
  },
  {
    id: 5,
    name: 'فهد الحربي',
    position: 'معلم رياضيات',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    content: 'الوسائل التعليمية من لين ساعدتني في شرح المفاهيم الرياضية المعقدة بطريقة مبسطة. شكراً لكم على هذه المنتجات الرائعة.',
    rating: 4
  }
];

// Custom styles for the testimonial carousel
const testimonialStyles = `
  .testimonial-carousel {
    padding: 40px 0;
  }
  
  .testimonial-card {
    background-color: #f8f9fa;
    border: none;
    border-radius: 15px;
    padding: 30px;
    margin: 20px 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    transition: transform 0.3s ease;
    height: 100%;
  }
  
  .testimonial-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.12);
  }
  
  .testimonial-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .testimonial-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    margin-left: 15px;
  }
  
  .testimonial-author {
    flex: 1;
  }
  
  .testimonial-name {
    margin: 0;
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .testimonial-position {
    color: #6c757d;
    font-size: 0.9rem;
    margin: 0;
  }
  
  .testimonial-content {
    font-style: italic;
    line-height: 1.6;
    margin-bottom: 20px;
    position: relative;
  }
  
  .testimonial-content::before {
    content: '"';
    font-size: 4rem;
    position: absolute;
    top: -20px;
    right: -10px;
    color: rgba(0,0,0,0.1);
    font-family: serif;
  }
  
  .testimonial-rating {
    color: #ffc107;
    font-size: 1.2rem;
  }
  
  .swiper-button-next, .swiper-button-prev {
    color: #3498db;
  }
  
  .swiper-pagination-bullet-active {
    background: #3498db;
  }
  
  .testimonial-fade .swiper-slide {
    opacity: 0 !important;
    transition: opacity 0.3s ease;
  }
  
  .testimonial-fade .swiper-slide-active {
    opacity: 1 !important;
  }
`;

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="testimonial-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

const TestimonialCarousel = ({ 
  title = 'آراء عملائنا',
  effect = 'slide', // 'slide' or 'fade'
  autoplay = true,
  loop = true,
  slidesPerView = 1
}) => {
  // Default autoplay config
  const autoplayConfig = autoplay ? {
    delay: 5000,
    disableOnInteraction: false
  } : false;

  // Determine if we should use the fade effect
  const useFade = effect === 'fade';
  
  // Configure modules based on effect
  const modules = useFade 
    ? [Navigation, Pagination, Autoplay, EffectFade]
    : [Navigation, Pagination, Autoplay];

  // Default breakpoints (only used for slide effect)
  const breakpoints = !useFade ? {
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
  } : {};

  return (
    <div className="testimonial-container">
      <style>{testimonialStyles}</style>
      
      <h2 className="text-center mb-4">{title}</h2>
      
      <Swiper
        modules={modules}
        spaceBetween={30}
        slidesPerView={useFade ? 1 : slidesPerView}
        navigation={true}
        pagination={{ clickable: true }}
        loop={loop}
        autoplay={autoplayConfig}
        effect={useFade ? 'fade' : 'slide'}
        fadeEffect={{ crossFade: true }}
        breakpoints={!useFade ? breakpoints : {}}
        className={`testimonial-carousel ${useFade ? 'testimonial-fade' : ''}`}
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide key={testimonial.id}>
            <Card className="testimonial-card">
              <div className="testimonial-header">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="testimonial-avatar" 
                />
                <div className="testimonial-author">
                  <h5 className="testimonial-name">{testimonial.name}</h5>
                  <p className="testimonial-position">{testimonial.position}</p>
                </div>
              </div>
              <div className="testimonial-content">
                {testimonial.content}
              </div>
              <StarRating rating={testimonial.rating} />
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialCarousel; 