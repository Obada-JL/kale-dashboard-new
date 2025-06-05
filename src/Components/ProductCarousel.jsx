import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import axios from 'axios';
import Swal from 'sweetalert2';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Custom styles for the product carousel
const productCarouselStyles = `
  .product-carousel {
    margin: 20px 0;
    padding-bottom: 40px;
  }
  
  .product-card {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  }
  
  .product-image {
    height: 200px;
    object-fit: cover;
  }
  
  .product-category {
    font-size: 0.8rem;
    margin-bottom: 8px;
  }
  
  .product-price {
    font-weight: bold;
    color: #e74c3c;
    font-size: 1.2rem;
    margin-top: 10px;
  }
  
  .product-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }
  
  .swiper-button-next, .swiper-button-prev {
    color: #3498db;
  }
  
  .swiper-pagination-bullet-active {
    background: #3498db;
  }
`;

const ProductCarousel = ({
  title = 'المنتجات المميزة',
  category = null,
  limit = 10,
  slidesPerView = 1,
  autoplay = false,
  onProductClick = null
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API URL
  const API_BASE_URL = "https://api.lineduc.com/api";
  const PRODUCTS_URL = `${API_BASE_URL}/products`;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build URL with optional category filter
        let url = PRODUCTS_URL;
        if (category) {
          url += `?category=${category}`;
        }

        const response = await axios.get(url);

        // Limit the number of products if needed
        const limitedProducts = response.data.slice(0, limit);
        setProducts(limitedProducts);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('حدث خطأ أثناء جلب المنتجات');

        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء جلب المنتجات. يرجى المحاولة مرة أخرى.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, limit]);

  // Default breakpoints
  const breakpoints = {
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
  };

  // Handle product click
  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Default autoplay config
  const autoplayConfig = autoplay ? {
    delay: 3000,
    disableOnInteraction: false
  } : false;

  return (
    <div className="product-carousel-container">
      <style>{productCarouselStyles}</style>

      <h2 className="text-center mb-4">{title}</h2>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          لا توجد منتجات متاحة حالياً
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={slidesPerView}
          navigation={true}
          pagination={{ clickable: true }}
          loop={true}
          autoplay={autoplayConfig}
          breakpoints={breakpoints}
          className="product-carousel"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <Card className="product-card">
                <Card.Img
                  variant="top"
                  src={`https://api.lineduc.com/productsImages/${product.mainImage}`}
                  className="product-image"
                  alt={product.title.ar || product.title.en}
                />
                <Card.Body>
                  <Badge bg="secondary" className="product-category">
                    {product.category?.name?.ar || product.category?.name?.en || 'غير مصنف'}
                  </Badge>
                  <Card.Title>{product.title.ar || product.title.en}</Card.Title>
                  <Card.Text className="product-description">
                    {product.shortDescription?.ar || product.shortDescription?.en || ''}
                  </Card.Text>
                  <Card.Text className="product-price">
                    {product.price} ليرة
                  </Card.Text>
                  <div className="product-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleProductClick(product)}
                    >
                      عرض التفاصيل
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                    >
                      إضافة للسلة
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ProductCarousel; 