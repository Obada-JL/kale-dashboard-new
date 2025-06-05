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

      // Fetch basic stats
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

      // Add users promise only for admin
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

  const quickActions = [
    {
      title: 'إضافة طعام جديد',
      description: 'أضف عنصر طعام جديد للقائمة',
      icon: 'bi-egg-fried',
      color: 'primary',
      link: '/foods'
    },
    {
      title: 'إضافة مشروب جديد',
      description: 'أضف مشروب جديد للقائمة',
      icon: 'bi-cup-straw',
      color: 'info',
      link: '/drinks'
    },
    {
      title: 'إضافة حلوى جديدة',
      description: 'أضف حلوى جديدة للقائمة',
      icon: 'bi-cake2',
      color: 'warning',
      link: '/desserts'
    },
    {
      title: 'إضافة شيشة جديدة',
      description: 'أضف نكهة شيشة جديدة',
      icon: 'bi-cloud',
      color: 'secondary',
      link: '/hookah'
    }
  ];

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${color}`}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title text-muted mb-1">{title}</h6>
            <h2 className={`mb-0 fw-bold text-${color}`}>
              {isLoading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : value}
            </h2>
            <small className="text-muted">{description}</small>
          </div>
          <div className={`bg-${color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
            style={{ width: '60px', height: '60px' }}>
            <i className={`${icon} text-${color} fs-3`}></i>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, color, link }) => (
    <Link to={link} className="text-decoration-none">
      <div className="card border-0 shadow-sm h-100 hover-card">
        <div className="card-body p-4 text-center">
          <div className={`bg-${color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3`}
            style={{ width: '80px', height: '80px' }}>
            <i className={`${icon} text-${color} fs-1`}></i>
          </div>
          <h5 className="card-title text-dark">{title}</h5>
          <p className="card-text text-muted small">{description}</p>
          <button className={`btn btn-${color} btn-sm`}>
            <i className="bi bi-plus-circle me-1"></i>
            ابدأ الآن
          </button>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="display-6 fw-bold text-dark mb-1">لوحة تحكم Kale Cafe</h1>
              <p className="text-muted fs-5">مرحباً {user?.username}، إليك نظرة عامة على نظام إدارة المقهى</p>
            </div>
            <div className="text-end">
              <div className="badge bg-success fs-6 px-3 py-2">
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
            color="primary"
            description="العناصر المتوفرة"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="إجمالي المشروبات"
            value={stats.drinks}
            icon="bi-cup-straw"
            color="info"
            description="المشروبات المتوفرة"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="الحلويات والأراكيل"
            value={stats.desserts + stats.hookahs}
            icon="bi-star-fill"
            color="warning"
            description="العناصر الإضافية"
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="إجمالي الصور"
            value={stats.images}
            icon="bi-images"
            color="success"
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
            color="purple"
            description="أقسام القائمة"
          />
        </div>
        {user?.role === 'admin' && (
          <div className="col-md-6">
            <StatCard
              title="المستخدمين"
              value={stats.users}
              icon="bi-people"
              color="danger"
              description="مستخدمو النظام"
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="fw-bold text-dark mb-4">
            <i className="bi bi-lightning-charge text-warning me-2"></i>
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
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="text-dark mb-2">🎉 مرحباً بك في نظام إدارة Kale Cafe</h5>
                  <p className="text-muted mb-0">
                    يمكنك إدارة قائمة المقهى بسهولة، إضافة وتعديل الأطعمة والمشروبات،
                    ورفع الصور، وإدارة الأقسام من خلال هذا النظام.
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    <Link to="/foods" className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-egg-fried me-1"></i>
                      الأطعمة
                    </Link>
                    <Link to="/drinks" className="btn btn-outline-info btn-sm">
                      <i className="bi bi-cup-straw me-1"></i>
                      المشروبات
                    </Link>
                    <Link to="/special-images" className="btn btn-outline-success btn-sm">
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

      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .bg-purple {
          background-color: #6f42c1 !important;
        }
        .text-purple {
          color: #6f42c1 !important;
        }
        .border-purple {
          border-color: #6f42c1 !important;
        }
        .btn-purple {
          background-color: #6f42c1;
          border-color: #6f42c1;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default MainPage;
