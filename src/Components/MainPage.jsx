import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../config/apiService';
import { useAuth } from '../context/AuthContext';

const MainPage = () => {
  const [stats, setStats] = useState({
    foods: 0,
    drinks: 0,
    desserts: 0,
    hookahs: 0,
    categories: 0,
    images: 0,
    users: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      const promises = [
        apiService.foods.getAll().catch(() => ({ data: [] })),
        apiService.drinks.getAll().catch(() => ({ data: [] })),
        apiService.desserts.getAll().catch(() => ({ data: [] })),
        apiService.hookahs.getAll().catch(() => ({ data: [] })),
        apiService.categories.getAll().catch(() => ({ data: [] })),
        apiService.images.food.getAll().catch(() => ({ data: [] })),
        apiService.images.drink.getAll().catch(() => ({ data: [] })),
        apiService.images.dessert.getAll().catch(() => ({ data: [] })),
        apiService.images.hookah.getAll().catch(() => ({ data: [] })),
        apiService.images.special.getAll().catch(() => ({ data: [] }))
      ];

      if (user?.role === 'admin') {
        promises.push(apiService.users.getAll().catch(() => ({ data: [] })));
      }

      const results = await Promise.all(promises);

      const [
        foodsRes,
        drinksRes,
        dessertsRes,
        hookahsRes,
        categoriesRes,
        foodImagesRes,
        drinkImagesRes,
        dessertImagesRes,
        hookahImagesRes,
        specialImagesRes,
        usersRes
      ] = results;

      const totalImages =
        foodImagesRes.data.length +
        drinkImagesRes.data.length +
        dessertImagesRes.data.length +
        hookahImagesRes.data.length +
        specialImagesRes.data.length;

      setStats({
        foods: foodsRes.data.length,
        drinks: drinksRes.data.length,
        desserts: dessertsRes.data.length,
        hookahs: hookahsRes.data.length,
        categories: categoriesRes.data.length,
        images: totalImages,
        users: user?.role === 'admin' && usersRes ? usersRes.data.length : 0
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('فشل في تحميل الإحصائيات');
    } finally {
      setIsLoading(false);
    }
  };

  // Brand color variations for stat cards
  const statCardStyles = [
    { bg: '#6B4226', bgLight: 'rgba(107,66,38,0.08)', text: '#6B4226' },   // Kale Brown
    { bg: '#8B5E3C', bgLight: 'rgba(139,94,60,0.08)', text: '#8B5E3C' },   // Brown Light
    { bg: '#CD853F', bgLight: 'rgba(205,133,63,0.08)', text: '#CD853F' },   // Accent
    { bg: '#D2B48C', bgLight: 'rgba(210,180,140,0.12)', text: '#8B5E3C' }, // Tan
    { bg: '#4A2E1A', bgLight: 'rgba(74,46,26,0.08)', text: '#4A2E1A' },    // Dark Brown
    { bg: '#8B4513', bgLight: 'rgba(139,69,19,0.08)', text: '#8B4513' },    // Saddle Brown
  ];

  const quickActions = [
    {
      title: 'إضافة طعام جديد',
      description: 'أضف عنصر طعام جديد للقائمة',
      icon: 'bi-egg-fried',
      link: '/foods',
      style: statCardStyles[0]
    },
    {
      title: 'إضافة مشروب جديد',
      description: 'أضف مشروب جديد للقائمة',
      icon: 'bi-cup-straw',
      link: '/drinks',
      style: statCardStyles[1]
    },
    {
      title: 'إضافة حلوى جديدة',
      description: 'أضف حلوى جديدة للقائمة',
      icon: 'bi-cake2',
      link: '/desserts',
      style: statCardStyles[2]
    },
    {
      title: 'إضافة شيشة جديدة',
      description: 'أضف نكهة شيشة جديدة',
      icon: 'bi-cloud',
      link: '/hookah',
      style: statCardStyles[3]
    },
    {
      title: 'إدارة الطاولات',
      description: 'إدارة طاولات المطعم والطلبات',
      icon: 'bi-grid-1x2',
      link: '/tables',
      style: statCardStyles[4]
    }
  ];

  const StatCard = ({ title, value, icon, style, description }) => (
    <div className="card border-0 shadow-sm h-100"
      style={{ borderRight: `4px solid ${style.bg}` }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title text-muted mb-1" style={{ fontSize: '0.85rem' }}>{title}</h6>
            <h2 className="mb-0 fw-bold" style={{ color: style.text }}>
              {isLoading ? (
                <div className="spinner-border spinner-border-sm" role="status"
                  style={{ color: style.bg }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : value}
            </h2>
            <small className="text-muted">{description}</small>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '56px', height: '56px', backgroundColor: style.bgLight }}>
            <i className={`${icon} fs-3`} style={{ color: style.bg }}></i>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, link, style }) => (
    <Link to={link} className="text-decoration-none">
      <div className="card border-0 shadow-sm h-100 hover-card">
        <div className="card-body p-4 text-center">
          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: '72px', height: '72px', backgroundColor: style.bgLight }}>
            <i className={`${icon} fs-1`} style={{ color: style.bg }}></i>
          </div>
          <h5 className="card-title" style={{ color: '#4A2E1A' }}>{title}</h5>
          <p className="card-text text-muted small mb-3">{description}</p>
          <button className="btn btn-sm text-white px-3"
            style={{ background: `linear-gradient(135deg, ${style.bg} 0%, #CD853F 100%)`, border: 'none', borderRadius: '8px' }}>
            <i className="bi bi-plus-circle me-1"></i>
            ابدأ الآن
          </button>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: 'var(--bs-kale-cream, #F5EDE3)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="display-6 fw-bold mb-1" style={{ color: '#4A2E1A' }}>لوحة تحكم Kale Cafe</h1>
              <p className="text-muted fs-5">مرحباً {user?.username}، إليك نظرة عامة على نظام إدارة المقهى</p>
            </div>
            <div className="text-end">
              <div className="badge fs-6 px-3 py-2 text-white" 
                style={{ background: 'linear-gradient(135deg, #6B4226 0%, #8B5E3C 100%)' }}>
                <i className="bi bi-circle-fill me-2" style={{ fontSize: '8px' }}></i>
                النظام يعمل بشكل طبيعي
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-5 g-4">
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="إجمالي الأطعمة"
            value={stats.foods}
            icon="bi-egg-fried"
            style={statCardStyles[0]}
            description="العناصر المتوفرة"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="إجمالي المشروبات"
            value={stats.drinks}
            icon="bi-cup-straw"
            style={statCardStyles[1]}
            description="المشروبات المتوفرة"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="الحلويات والأراكيل"
            value={stats.desserts + stats.hookahs}
            icon="bi-star-fill"
            style={statCardStyles[2]}
            description="العناصر الإضافية"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="إجمالي الصور"
            value={stats.images}
            icon="bi-images"
            style={statCardStyles[3]}
            description="الصور المرفوعة"
          />
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="row mb-5 g-4">
        <div className="col-md-6">
          <StatCard
            title="الأقسام"
            value={stats.categories}
            icon="bi-grid-3x3-gap"
            style={statCardStyles[4]}
            description="أقسام القائمة"
          />
        </div>
        {user?.role === 'admin' && (
          <div className="col-md-6">
            <StatCard
              title="المستخدمين"
              value={stats.users}
              icon="bi-people"
              style={statCardStyles[5]}
              description="مستخدمو النظام"
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="fw-bold mb-4" style={{ color: '#4A2E1A' }}>
            <i className="bi bi-lightning-charge me-2" style={{ color: '#CD853F' }}></i>
            إجراءات سريعة
          </h3>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {quickActions.map((action, index) => (
          <div key={index} className="col-xl-3 col-lg-4 col-md-6">
            <QuickActionCard {...action} />
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderTop: '3px solid #6B4226' }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="mb-2" style={{ color: '#4A2E1A' }}>☕ مرحباً بك في نظام إدارة Kale Cafe</h5>
                  <p className="text-muted mb-0">
                    يمكنك إدارة قائمة المقهى بسهولة، إضافة وتعديل الأطعمة والمشروبات،
                    ورفع الصور، وإدارة الأقسام من خلال هذا النظام.
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    <Link to="/foods" className="btn btn-sm text-white"
                      style={{ background: '#6B4226', borderRadius: '8px' }}>
                      <i className="bi bi-egg-fried me-1"></i>
                      الأطعمة
                    </Link>
                    <Link to="/drinks" className="btn btn-sm text-white"
                      style={{ background: '#8B5E3C', borderRadius: '8px' }}>
                      <i className="bi bi-cup-straw me-1"></i>
                      المشروبات
                    </Link>
                    <Link to="/special-images" className="btn btn-sm text-white"
                      style={{ background: '#CD853F', borderRadius: '8px' }}>
                      <i className="bi bi-images me-1"></i>
                      الصور
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(107,66,38,0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default MainPage;
