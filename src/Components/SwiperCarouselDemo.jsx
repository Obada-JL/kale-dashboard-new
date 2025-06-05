import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import SwiperCarousel from './SwiperCarousel';

// Sample data for the carousel
const sampleSlides = [
  {
    image: 'https://via.placeholder.com/600x400/3498db/ffffff?text=Slide+1',
    title: 'عنوان الشريحة الأولى',
    description: 'وصف للشريحة الأولى يظهر هنا'
  },
  {
    image: 'https://via.placeholder.com/600x400/e74c3c/ffffff?text=Slide+2',
    title: 'عنوان الشريحة الثانية',
    description: 'وصف للشريحة الثانية يظهر هنا'
  },
  {
    image: 'https://via.placeholder.com/600x400/2ecc71/ffffff?text=Slide+3',
    title: 'عنوان الشريحة الثالثة',
    description: 'وصف للشريحة الثالثة يظهر هنا'
  },
  {
    image: 'https://via.placeholder.com/600x400/f39c12/ffffff?text=Slide+4',
    title: 'عنوان الشريحة الرابعة',
    description: 'وصف للشريحة الرابعة يظهر هنا'
  },
  {
    image: 'https://via.placeholder.com/600x400/9b59b6/ffffff?text=Slide+5',
    title: 'عنوان الشريحة الخامسة',
    description: 'وصف للشريحة الخامسة يظهر هنا'
  }
];

// Sample products data
const productSlides = [
  {
    id: 1,
    image: 'https://via.placeholder.com/300x300/3498db/ffffff?text=Product+1',
    title: 'منتج 1',
    price: '199 ليرة',
    category: 'الفئة الأولى'
  },
  {
    id: 2,
    image: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=Product+2',
    title: 'منتج 2',
    price: '299 ليرة',
    category: 'الفئة الثانية'
  },
  {
    id: 3,
    image: 'https://via.placeholder.com/300x300/2ecc71/ffffff?text=Product+3',
    title: 'منتج 3',
    price: '399 ليرة',
    category: 'الفئة الأولى'
  },
  {
    id: 4,
    image: 'https://via.placeholder.com/300x300/f39c12/ffffff?text=Product+4',
    title: 'منتج 4',
    price: '499 ليرة',
    category: 'الفئة الثالثة'
  },
  {
    id: 5,
    image: 'https://via.placeholder.com/300x300/9b59b6/ffffff?text=Product+5',
    title: 'منتج 5',
    price: '599 ليرة',
    category: 'الفئة الثانية'
  }
];

// Custom styles for the carousel
const carouselStyles = `
  .swiper-carousel {
    margin: 20px 0;
    padding-bottom: 40px;
  }
  
  .swiper-slide-content {
    text-align: center;
    padding: 20px;
  }
  
  .swiper-slide-content img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  .swiper-slide-content h3 {
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .swiper-slide-content p {
    color: #666;
  }
  
  .product-card {
    height: 100%;
    transition: transform 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  
  .product-image {
    height: 200px;
    object-fit: cover;
  }
  
  .product-category {
    font-size: 0.8rem;
    color: #666;
  }
  
  .product-price {
    font-weight: bold;
    color: #e74c3c;
  }
`;

const SwiperCarouselDemo = () => {
  // Custom render function for product slides
  const renderProductSlide = (product, index) => (
    <Card className="product-card">
      <Card.Img variant="top" src={product.image} className="product-image" />
      <Card.Body>
        <Card.Title>{product.title}</Card.Title>
        <Card.Text className="product-category">{product.category}</Card.Text>
        <Card.Text className="product-price">{product.price}</Card.Text>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="py-5">
      <style>{carouselStyles}</style>

      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">عرض شرائح بسيط</h2>
          <SwiperCarousel
            slides={sampleSlides}
            autoplay={true}
          />
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">عرض المنتجات</h2>
          <SwiperCarousel
            slides={productSlides}
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            }}
            renderItem={renderProductSlide}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="text-center mb-4">عرض شرائح بدون تنقل تلقائي</h2>
          <SwiperCarousel
            slides={sampleSlides.slice(0, 3)}
            pagination={true}
            navigation={true}
            loop={false}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default SwiperCarouselDemo; 