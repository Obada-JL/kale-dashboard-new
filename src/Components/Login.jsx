import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../config/apiService';
import Logo from "../assets/homelogo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.users.login({ username, password });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Check user role
      if (user.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error('ليس لديك صلاحية الوصول إلى لوحة التحكم');
        return;
      }

      toast.success('تم تسجيل الدخول بنجاح');
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      handleApiError(error, 'تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'50\' cy=\'50\' r=\'1\' fill=\'%23ffffff\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>")',
        opacity: 0.1
      }}></div>

      <div className="container-fluid h-100 position-relative">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col-xl-4 col-lg-5 col-md-6 col-sm-8">
            {/* Main Login Card */}
            <div className="card border-0 shadow-lg position-relative overflow-hidden"
              style={{
                borderRadius: '24px',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.95)'
              }}>

              {/* Header Section */}
              <div className="card-header border-0 bg-transparent text-center pt-5 pb-0">
                <div className="mb-4">
                  <div className="position-relative d-inline-block">
                    <div className="bg-white rounded-circle shadow-lg p-3 d-inline-flex align-items-center justify-content-center"
                      style={{ width: '100px', height: '100px' }}>
                      <img src={Logo} alt="Logo" style={{ maxWidth: '70px', height: 'auto' }} />
                    </div>
                    <div className="position-absolute top-0 end-0 bg-success rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '24px', height: '24px', transform: 'translate(8px, -8px)' }}>
                      <i className="bi bi-shield-check text-white" style={{ fontSize: '12px' }}></i>
                    </div>
                  </div>
                </div>

                <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.75rem' }}>
                  مرحباً بك في لوحة التحكم
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                  قم بتسجيل الدخول للوصول إلى نظام إدارة Kale Cafe
                </p>
              </div>

              <div className="card-body px-5 pb-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark mb-2">
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      اسم المستخدم
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control form-control-lg border-0 shadow-sm"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم"
                        required
                        disabled={isLoading}
                        style={{
                          borderRadius: '16px',
                          backgroundColor: '#f8f9fa',
                          paddingLeft: '20px',
                          paddingRight: '50px',
                          fontSize: '1rem'
                        }}
                      />
                      <i className="bi bi-person position-absolute text-muted"
                        style={{
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '1.1rem'
                        }}></i>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark mb-2">
                      <i className="bi bi-shield-lock me-2 text-primary"></i>
                      كلمة المرور
                    </label>
                    <div className="position-relative">
                      <input
                        type="password"
                        className="form-control form-control-lg border-0 shadow-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        required
                        disabled={isLoading}
                        style={{
                          borderRadius: '16px',
                          backgroundColor: '#f8f9fa',
                          paddingLeft: '20px',
                          paddingRight: '50px',
                          fontSize: '1rem'
                        }}
                      />
                      <i className="bi bi-lock position-absolute text-muted"
                        style={{
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '1.1rem'
                        }}></i>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-bold text-white border-0 shadow-sm position-relative overflow-hidden"
                    disabled={isLoading}
                    style={{
                      borderRadius: '16px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" style={{ width: '18px', height: '18px' }}></div>
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        تسجيل الدخول
                      </>
                    )}
                  </button>
                </form>

                {/* Security Notice */}
                <div className="mt-4 p-3 rounded-4" style={{ backgroundColor: 'rgba(13, 110, 253, 0.05)' }}>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                      <i className="bi bi-shield-check text-primary"></i>
                    </div>
                    <div>
                      <small className="text-dark fw-semibold d-block">نظام آمن ومحمي</small>
                      <small className="text-muted">للوصول إلى هذا النظام، يجب أن تكون مدير معتمد</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-white-50">
                <i className="bi bi-shield-fill-check me-1"></i>
                نظام إدارة Kale Cafe - محمي بأعلى معايير الأمان
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
