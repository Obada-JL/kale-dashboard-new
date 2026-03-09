import React, { useState, useCallback, createContext, useContext } from 'react';

// Context
const ConfirmContext = createContext(null);

// Hook to use the confirm dialog anywhere
export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
    return context.confirm;
};

// Provider component — wrap your app with this
export const ConfirmProvider = ({ children }) => {
    const [state, setState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'تأكيد',
        cancelText: 'إلغاء',
        variant: 'danger', // 'danger' | 'warning' | 'info'
        resolve: null,
    });

    const confirm = useCallback(({ title, message, confirmText, cancelText, variant } = {}) => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                title: title || 'تأكيد العملية',
                message: message || 'هل أنت متأكد من متابعة هذه العملية؟',
                confirmText: confirmText || 'تأكيد',
                cancelText: cancelText || 'إلغاء',
                variant: variant || 'danger',
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        state.resolve?.(true);
        setState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState(prev => ({ ...prev, isOpen: false }));
    };

    const variantStyles = {
        danger: {
            iconBg: 'rgba(220,53,69,0.08)',
            iconColor: '#dc3546',
            icon: 'bi-exclamation-triangle-fill',
            btnBg: '#dc3545',
            btnHover: '#c82333',
        },
        warning: {
            iconBg: 'rgba(205,133,63,0.1)',
            iconColor: '#CD853F',
            icon: 'bi-exclamation-circle-fill',
            btnBg: '#CD853F',
            btnHover: '#B8732E',
        },
        info: {
            iconBg: 'rgba(74,46,26,0.08)',
            iconColor: '#4A2E1A',
            icon: 'bi-question-circle-fill',
            btnBg: '#4A2E1A',
            btnHover: '#3A1E0A',
        },
    };

    const v = variantStyles[state.variant] || variantStyles.danger;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state.isOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 9999, backdropFilter: 'blur(3px)' }}
                    onClick={handleCancel}
                >
                    <div
                        className="bg-white rounded-3 shadow-lg p-0 overflow-hidden"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            animation: 'confirmSlideIn 0.25s ease-out',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top accent */}
                        <div style={{ height: '4px', background: `linear-gradient(90deg, ${v.btnBg}, ${v.btnHover})` }}></div>

                        <div className="p-4 text-center">
                            {/* Icon */}
                            <div
                                className="d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{
                                    width: '56px', height: '56px', borderRadius: '14px',
                                    backgroundColor: v.iconBg,
                                }}
                            >
                                <i className={`bi ${v.icon}`} style={{ fontSize: '1.6rem', color: v.iconColor }}></i>
                            </div>

                            {/* Title */}
                            <h5 className="fw-bold mb-2" style={{ color: '#4A2E1A' }}>{state.title}</h5>

                            {/* Message */}
                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {state.message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2 p-3 pt-0">
                            <button
                                className="btn flex-fill py-2 fw-semibold"
                                style={{
                                    borderRadius: '10px',
                                    backgroundColor: '#f5f5f5',
                                    color: '#666',
                                    border: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8e8e8'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                                onClick={handleCancel}
                            >
                                {state.cancelText}
                            </button>
                            <button
                                className="btn flex-fill py-2 fw-semibold text-white"
                                style={{
                                    borderRadius: '10px',
                                    backgroundColor: v.btnBg,
                                    border: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = v.btnHover; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = v.btnBg; }}
                                onClick={handleConfirm}
                            >
                                {state.confirmText}
                            </button>
                        </div>
                    </div>

                    {/* Inline keyframe animation */}
                    <style>{`
                        @keyframes confirmSlideIn {
                            from { opacity: 0; transform: scale(0.92) translateY(10px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export default ConfirmProvider;
