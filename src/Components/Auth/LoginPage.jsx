import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/homelogo.png";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [showSeedAdmin, setShowSeedAdmin] = useState(false);
    const { login, seedAdmin, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!credentials.username.trim() || !credentials.password.trim()) return;

        const result = await login(credentials);
        if (result.success) {
            navigate('/');
        }
    };

    const handleSeedAdmin = async () => {
        const result = await seedAdmin();
        if (result.success) {
            setCredentials({
                username: 'admin',
                password: 'admin123'
            });
            setShowSeedAdmin(false);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #8B4513 0%, #D2B48C 50%, #CD853F 100%)',
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
                                background: 'rgba(255, 255, 255, 0.95)',
                                boxShadow: '0 20px 40px rgba(139, 69, 19, 0.3)'
                            }}>

                            {/* Header Section */}
                            <div className="card-header border-0 bg-transparent text-center pt-5 pb-0">
                                <div className="mb-4">
                                    <div className="position-relative d-inline-block">
                                        <div className="bg-white rounded-circle shadow-lg p-3 d-inline-flex align-items-center justify-content-center"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                boxShadow: '0 8px 24px rgba(139, 69, 19, 0.2)'
                                            }}>
                                            <img src={Logo} alt="Logo" style={{ maxWidth: '70px', height: 'auto' }} />
                                        </div>
                                        <div className="position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                transform: 'translate(8px, -8px)',
                                                background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)'
                                            }}>
                                            <i className="bi bi-shield-check text-white" style={{ fontSize: '12px' }}></i>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="fw-bold mb-2" style={{
                                    fontSize: '1.75rem',
                                    color: '#8B4513'
                                }}>
                                    لوحة تحكم Kale Cafe
                                </h2>
                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                                    قم بتسجيل الدخول للوصول إلى نظام الإدارة
                                </p>
                            </div>

                            <div className="card-body px-5 pb-5">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="username" className="form-label fw-semibold text-dark mb-2">
                                            <i className="bi bi-person-circle me-2" style={{ color: '#8B4513' }}></i>
                                            اسم المستخدم أو البريد الإلكتروني
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                value={credentials.username}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isLoading}
                                                className="form-control form-control-lg border-0 shadow-sm"
                                                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                                                style={{
                                                    borderRadius: '16px',
                                                    backgroundColor: '#f8f9fa',
                                                    paddingLeft: '20px',
                                                    paddingRight: '50px',
                                                    fontSize: '1rem',
                                                    border: '2px solid transparent',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#CD853F';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(205, 133, 63, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'transparent';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                            <i className="bi bi-person position-absolute"
                                                style={{
                                                    left: '16px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    fontSize: '1.1rem',
                                                    color: '#8B4513'
                                                }}></i>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label fw-semibold text-dark mb-2">
                                            <i className="bi bi-shield-lock me-2" style={{ color: '#8B4513' }}></i>
                                            كلمة المرور
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={credentials.password}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isLoading}
                                                className="form-control form-control-lg border-0 shadow-sm"
                                                placeholder="أدخل كلمة المرور"
                                                style={{
                                                    borderRadius: '16px',
                                                    backgroundColor: '#f8f9fa',
                                                    paddingLeft: '20px',
                                                    paddingRight: '50px',
                                                    fontSize: '1rem',
                                                    border: '2px solid transparent',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#CD853F';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(205, 133, 63, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'transparent';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                            <i className="bi bi-lock position-absolute"
                                                style={{
                                                    left: '16px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    fontSize: '1.1rem',
                                                    color: '#8B4513'
                                                }}></i>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !credentials.username.trim() || !credentials.password.trim()}
                                        className="btn btn-lg w-100 fw-bold text-white border-0 shadow-sm position-relative overflow-hidden"
                                        style={{
                                            borderRadius: '16px',
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
                                            fontSize: '1.1rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isLoading) {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 20px rgba(139, 69, 19, 0.4)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        {isLoading ? (
                                            <div className="d-flex align-items-center justify-content-center">
                                                <div className="spinner-border spinner-border-sm me-2" style={{ width: '18px', height: '18px' }}></div>
                                                جاري تسجيل الدخول...
                                            </div>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                تسجيل الدخول
                                            </>
                                        )}
                                    </button>
                                </form>

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
};

export default LoginPage; 