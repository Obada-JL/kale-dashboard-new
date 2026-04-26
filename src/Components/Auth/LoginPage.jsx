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
        <div dir="rtl" style={{
            backgroundColor: 'var(--bs-kale-cream, #F5EDE3)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            fontFamily: "'Cairo', sans-serif"
        }}>
            <div className="card border-0" style={{
                width: '100%',
                maxWidth: '420px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 30px rgba(74, 46, 26, 0.08)'
            }}>
                <div className="card-body p-4 p-md-5">
                    <div className="text-center mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(107, 66, 38, 0.05)'
                        }}>
                            <img src={Logo} alt="Kale Cafe Logo" style={{ width: '60px' }} />
                        </div>
                        <h4 className="fw-bold mb-1" style={{ color: '#4A2E1A' }}>لوحة تحكم Kale Cafe</h4>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>قم بتسجيل الدخول للوصول إلى نظام الإدارة</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="username" className="form-label fw-semibold mb-1 w-100 text-end" style={{ fontSize: '0.85rem', color: '#6B4226' }}>
                                اسم المستخدم أو البريد الإلكتروني
                            </label>
                            <div className="input-group" dir="ltr">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={credentials.username}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    className="form-control border-end-0 bg-light shadow-none text-end"
                                    placeholder="أدخل اسم المستخدم..."
                                    style={{ borderColor: 'rgba(107,66,38,0.2)' }}
                                />
                                <span className="input-group-text border-start-0 bg-light" style={{ borderColor: 'rgba(107,66,38,0.2)' }}>
                                    <i className="bi bi-person" style={{ color: '#8B5E3C' }}></i>
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 text-start">
                            <label htmlFor="password" className="form-label fw-semibold mb-1 w-100 text-end" style={{ fontSize: '0.85rem', color: '#6B4226' }}>
                                كلمة المرور
                            </label>
                            <div className="input-group" dir="ltr">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={credentials.password}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    className="form-control border-end-0 bg-light shadow-none text-end"
                                    placeholder="أدخل كلمة المرور..."
                                    style={{ borderColor: 'rgba(107,66,38,0.2)' }}
                                />
                                <span className="input-group-text border-start-0 bg-light" style={{ borderColor: 'rgba(107,66,38,0.2)' }}>
                                    <i className="bi bi-lock" style={{ color: '#8B5E3C' }}></i>
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !credentials.username.trim() || !credentials.password.trim()}
                            className="btn w-100 text-white fw-bold d-flex justify-content-center align-items-center gap-2 shadow-sm"
                            style={{
                                padding: '12px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6B4226 0%, #CD853F 100%)',
                                border: 'none',
                                transition: 'all 0.3s ease',
                                opacity: (isLoading || !credentials.username.trim() || !credentials.password.trim()) ? 0.7 : 1
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>جاري تسجيل الدخول...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right"></i>
                                    <span>تسجيل الدخول</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="position-absolute bottom-0 w-100 text-center pb-3">
                <small style={{ color: '#8B5E3C' }}>
                    <i className="bi bi-shield-check ms-1"></i>
                    نظام إدارة Kale Cafe - محمي وآمن
                </small>
            </div>
        </div>
    );
};

export default LoginPage; 
