import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../../config/apiService';

const OrderLogsPage = () => {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchLogs = useCallback(async (page = 1) => {
        try {
            setIsLoading(true);
            const params = { page, limit: 20 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (dateFrom) params.from = dateFrom;
            if (dateTo) params.to = dateTo;

            const response = await apiService.orders.getLogs(params);
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
        } catch (error) {
            handleApiError(error, 'جلب سجل الطلبات');
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchLogs(1);
    }, [fetchLogs]);

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.pages) return;
        fetchLogs(page);
    };

    const handlePrintReceipt = async (order) => {
        try {
            await apiService.print.receipt(order);
            toast.success('تم إرسال الفاتورة إلى الطابعة بنجاح');
        } catch (error) {
            handleApiError(error, 'طباعة الفاتورة');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            active: { label: 'نشط', bg: '#6B4226', icon: 'bi-hourglass-split' },
            completed: { label: 'مكتمل', bg: '#4A7C3F', icon: 'bi-check-circle-fill' },
            cancelled: { label: 'ملغى', bg: '#aaa', icon: 'bi-x-circle-fill' },
        };
        const s = map[status] || map.active;
        return (
            <span className="badge d-inline-flex align-items-center gap-1 px-2 py-1" style={{ backgroundColor: s.bg, fontSize: '0.75rem' }}>
                <i className={`bi ${s.icon}`}></i>{s.label}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    // Group orders by day
    const groupedOrders = orders.reduce((groups, order) => {
        const dayKey = new Date(order.createdAt).toLocaleDateString('ar-SA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!groups[dayKey]) groups[dayKey] = [];
        groups[dayKey].push(order);
        return groups;
    }, {});

    // Summary stats for current page
    const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: 'var(--bs-kale-cream, #F5EDE3)', minHeight: '100vh' }}>
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-6 fw-bold mb-1 d-flex gap-2 align-items-center" style={{ color: '#4A2E1A' }}>
                        <i className="bi bi-journal-text" style={{ color: '#6B4226' }}></i>
                        سجل الطلبات
                    </h1>
                    <p className="text-muted fs-6">عرض وتصفية جميع الطلبات السابقة والحالية</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="row mb-4 g-3">
                {[
                    { label: 'إجمالي الطلبات', value: pagination.total, icon: 'bi-receipt', color: '#6B4226' },
                    { label: 'مكتملة', value: completedCount, icon: 'bi-check-circle', color: '#4A7C3F' },
                    { label: 'ملغاة', value: cancelledCount, icon: 'bi-x-circle', color: '#aaa' },
                    { label: 'إجمالي المبالغ', value: `${totalAmount.toLocaleString()} ل.ت`, icon: 'bi-cash-stack', color: '#CD853F' },
                ].map((stat, i) => (
                    <div key={i} className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-3">
                                <i className={`bi ${stat.icon} fs-2 mb-2`} style={{ color: stat.color }}></i>
                                <h3 className="fw-bold mb-0" style={{ color: stat.color }}>{stat.value}</h3>
                                <small className="text-muted">{stat.label}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body py-3">
                            <div className="row g-3 align-items-end">
                                {/* Status filter */}
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label fw-semibold" style={{ color: '#4A2E1A', fontSize: '0.85rem' }}>
                                        <i className="bi bi-funnel me-1"></i>الحالة
                                    </label>
                                    <div className="d-flex gap-1 flex-wrap">
                                        {[
                                            { key: 'all', label: 'الكل' },
                                            { key: 'active', label: 'نشط' },
                                            { key: 'completed', label: 'مكتمل' },
                                            { key: 'cancelled', label: 'ملغى' },
                                        ].map(f => (
                                            <button
                                                key={f.key}
                                                onClick={() => setStatusFilter(f.key)}
                                                className="btn btn-sm"
                                                style={{
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: statusFilter === f.key ? '#6B4226' : '#fff',
                                                    color: statusFilter === f.key ? '#fff' : '#6B4226',
                                                    border: `1px solid ${statusFilter === f.key ? '#6B4226' : 'rgba(107,66,38,0.2)'}`,
                                                    fontWeight: statusFilter === f.key ? '600' : 'normal',
                                                }}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date From */}
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label fw-semibold" style={{ color: '#4A2E1A', fontSize: '0.85rem' }}>
                                        <i className="bi bi-calendar-event me-1"></i>من تاريخ
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                    />
                                </div>

                                {/* Date To */}
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label fw-semibold" style={{ color: '#4A2E1A', fontSize: '0.85rem' }}>
                                        <i className="bi bi-calendar-event me-1"></i>إلى تاريخ
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                    />
                                </div>

                                {/* Reset */}
                                <div className="col-lg-3 col-md-6">
                                    <button
                                        className="btn w-100"
                                        style={{
                                            backgroundColor: 'rgba(107,66,38,0.08)',
                                            color: '#6B4226',
                                            border: '1px solid rgba(107,66,38,0.15)',
                                            borderRadius: '8px',
                                        }}
                                        onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                                        إعادة تعيين
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders grouped by day */}
            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: '#6B4226', width: '3rem', height: '3rem' }}></div>
                    <p className="text-muted mt-3">جاري تحميل السجلات...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
                        <p className="text-muted mt-3">لا توجد طلبات تطابق معايير البحث.</p>
                    </div>
                </div>
            ) : (
                Object.entries(groupedOrders).map(([dayLabel, dayOrders]) => {
                    const dayTotal = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                    return (
                        <div key={dayLabel} className="mb-4">
                            {/* Day header */}
                            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #6B4226, #CD853F)',
                                    }} className="d-flex align-items-center justify-content-center">
                                        <i className="bi bi-calendar3 text-white" style={{ fontSize: '0.85rem' }}></i>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0" style={{ color: '#4A2E1A', fontSize: '0.95rem' }}>{dayLabel}</h6>
                                        <small className="text-muted">{dayOrders.length} طلبات</small>
                                    </div>
                                </div>
                                <span className="badge px-3 py-2" style={{ backgroundColor: 'rgba(107,66,38,0.08)', color: '#6B4226', fontSize: '0.85rem' }}>
                                    {dayTotal.toLocaleString()} ل.ت
                                </span>
                            </div>

                            {/* Day orders */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>الطاولة</th>
                                                    <th>العناصر</th>
                                                    <th>المجموع</th>
                                                    <th>الحالة</th>
                                                    <th>مستلم الطلب</th>
                                                    <th>الوقت</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dayOrders.map(order => (
                                                    <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => setViewingOrder(order)}>
                                                        <td>
                                                            <span className="badge" style={{ backgroundColor: order.orderType === 'delivery' ? '#CD853F' : '#6B4226' }}>
                                                                {order.orderType === 'delivery' ? 'سفري' : `طاولة ${order.table?.number || '?'}`}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">{order.items?.length || 0} عناصر</small>
                                                        </td>
                                                        <td>
                                                            <span className="fw-bold" style={{ color: '#6B4226' }}>
                                                                {(order.totalAmount || 0).toLocaleString()} ل.ت
                                                            </span>
                                                        </td>
                                                        <td>{getStatusBadge(order.status)}</td>
                                                        <td><small className="text-muted">{order.createdBy || '-'}</small></td>
                                                        <td><small className="text-muted">{formatTime(order.createdAt)}</small></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="row mt-4">
                    <div className="col-12 d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            عرض {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total} طلب
                        </small>
                        <nav>
                            <ul className="pagination mb-0" style={{ gap: '4px' }}>
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}
                                        style={{ borderRadius: '8px', color: '#6B4226', border: '1px solid rgba(107,66,38,0.2)' }}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.pages <= 7) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 4) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.pages - 3) {
                                        pageNum = pagination.pages - 6 + i;
                                    } else {
                                        pageNum = pagination.page - 3 + i;
                                    }
                                    return (
                                        <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pageNum)}
                                                style={{
                                                    borderRadius: '8px',
                                                    minWidth: '38px',
                                                    textAlign: 'center',
                                                    backgroundColor: pagination.page === pageNum ? '#6B4226' : '#fff',
                                                    color: pagination.page === pageNum ? '#fff' : '#6B4226',
                                                    border: `1px solid ${pagination.page === pageNum ? '#6B4226' : 'rgba(107,66,38,0.2)'}`,
                                                    fontWeight: pagination.page === pageNum ? '600' : 'normal',
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                })}
                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}
                                        style={{ borderRadius: '8px', color: '#6B4226', border: '1px solid rgba(107,66,38,0.2)' }}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {viewingOrder && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between" style={{ background: 'linear-gradient(135deg, #F5EDE3, #ece0d4)' }}>
                                <h5 className="modal-title d-flex gap-2 align-items-center mb-0" style={{ color: '#4A2E1A' }}>
                                    <i className="bi bi-receipt"></i>
                                    تفاصيل الطلب
                                    <span className="badge" style={{ backgroundColor: viewingOrder.orderType === 'delivery' ? '#CD853F' : '#6B4226' }}>
                                        {viewingOrder.orderType === 'delivery' ? 'سفري' : `طاولة ${viewingOrder.table?.number || '?'}`}
                                    </span>
                                    {getStatusBadge(viewingOrder.status)}
                                </h5>
                                <div className="d-flex gap-2">
                                    <button onClick={() => handlePrintReceipt(viewingOrder)} className="btn btn-sm btn-outline-secondary d-print-none" title="طباعة الفاتورة">
                                        <i className="bi bi-printer"></i>
                                    </button>
                                    <button onClick={() => setViewingOrder(null)} className="btn btn-sm btn-outline-danger d-print-none">
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="modal-body">
                                {/* Order info */}
                                <div className="d-flex justify-content-between mb-3 p-2 rounded-2" style={{ backgroundColor: '#FAFAF7' }}>
                                    <small className="text-muted">
                                        <i className="bi bi-clock me-1"></i>
                                        {formatDate(viewingOrder.createdAt)} — {formatTime(viewingOrder.createdAt)}
                                    </small>
                                    <div className="d-flex gap-3">
                                        <small className="text-muted">
                                            <i className="bi bi-credit-card me-1"></i>
                                            {viewingOrder.paymentMethod === 'cash' ? 'نقداً' : viewingOrder.paymentMethod === 'credit_card' ? 'بطاقة' : '-'}
                                        </small>
                                        <small className="text-muted">
                                            <i className="bi bi-person me-1"></i>
                                            {viewingOrder.createdBy || '-'}
                                        </small>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="list-group list-group-flush rounded-3 shadow-sm" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                    {viewingOrder.items?.map((item, idx) => (
                                        <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#fff' }}>
                                            <div>
                                                <div className="fw-bold" style={{ color: '#4A2E1A' }}>{item.name}</div>
                                                <div className="d-flex align-items-center mt-1 gap-2">
                                                    <span className="badge" style={{ backgroundColor: 'rgba(107,66,38,0.1)', color: '#6B4226' }}>{item.quantity} ×</span>
                                                    <small className="text-muted">{Number(item.price).toLocaleString()} ل.ت</small>
                                                </div>
                                                {item.notes && (
                                                    <small className="text-muted d-block mt-1">
                                                        <i className="bi bi-chat-text me-1"></i>{item.notes}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="fw-bold" style={{ color: '#6B4226' }}>
                                                {(item.price * item.quantity).toLocaleString()} ل.ت
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Notes */}
                                {viewingOrder.notes && (
                                    <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(107,66,38,0.04)', border: '1px dashed rgba(107,66,38,0.15)' }}>
                                        <small className="fw-semibold d-block mb-1" style={{ color: '#6B4226' }}>
                                            <i className="bi bi-sticky me-1"></i>ملاحظات عامة
                                        </small>
                                        <small className="text-muted">{viewingOrder.notes}</small>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="mt-3 p-3 rounded-3 text-center" style={{ backgroundColor: 'rgba(107,66,38,0.06)', border: '1px dashed rgba(107,66,38,0.15)' }}>
                                    <span className="fw-bold fs-5" style={{ color: '#4A2E1A' }}>
                                        المجموع الكلي: {(viewingOrder.totalAmount || 0).toLocaleString()} ل.ت
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Printable Receipt (Hidden from screen, absolute positioned in print) */}
            {viewingOrder && (
                <div id="receipt-printable" className="d-none d-print-block bg-white p-3 text-dark">
                    <div className="text-center mb-3">
                        <h4 className="fw-bold mb-1">Kale Cafe</h4>
                        <div className="mt-2 fw-bold" style={{ fontSize: '1.2rem', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0' }}>
                            {viewingOrder.orderType === 'delivery' ? 'طلب سفري' : `طاولة ${viewingOrder.table?.number || '?'}`}
                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-2 pb-2" style={{ borderBottom: '1px solid #ddd', fontSize: '0.85rem' }}>
                        <span>الدفع: {viewingOrder.paymentMethod === 'cash' ? 'نقداً' : 'بطاقة'}</span>
                        <span>{formatTime(viewingOrder.createdAt)}</span>
                    </div>

                    <div className="mb-3">
                        <table className="w-100" style={{ fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                    <th className="text-end pb-1">الصنف</th>
                                    <th className="text-center pb-1">الكمية</th>
                                    <th className="text-start pb-1">السعر</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewingOrder.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="text-end py-1">{item.name}</td>
                                        <td className="text-center py-1">{item.quantity}</td>
                                        <td className="text-start py-1">{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {viewingOrder.notes && (
                        <div className="mb-3" style={{ fontSize: '0.85rem' }}>
                            <strong>ملاحظات:</strong> {viewingOrder.notes}
                        </div>
                    )}

                    <div className="d-flex justify-content-between pt-2 fw-bold" style={{ borderTop: '2px dashed #000', fontSize: '1.2rem' }}>
                        <span>الإجمالي:</span>
                        <span>{(viewingOrder.totalAmount || 0).toLocaleString()} ل.ت</span>
                    </div>
                    
                    <div className="text-center mt-4 pb-2" style={{ fontSize: '0.8rem' }}>
                        شكراً لزيارتكم!
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderLogsPage;
