import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../../config/apiService';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../ConfirmDialog';
import { FiX } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const TablesPage = () => {
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddTable, setShowAddTable] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableOrders, setTableOrders] = useState([]);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const { user } = useAuth();
    const isStaff = user?.role === 'staff';

    const confirm = useConfirm();

    // Menu data from database
    const [menuItems, setMenuItems] = useState({
        foods: [],
        drinks: [],
        desserts: [],
        hookahs: []
    });
    const [menuSearch, setMenuSearch] = useState('');
    const [activeMenuTab, setActiveMenuTab] = useState('foods');
    const [openCategories, setOpenCategories] = useState({});

    // Custom order item
    const [customItem, setCustomItem] = useState({ name: '', nameTr: '', price: '' });
    const [showCustomItem, setShowCustomItem] = useState(false);

    // New table form
    const [newTable, setNewTable] = useState({ number: '', capacity: 4, location: '' });

    // Order items (selected from menu)
    const [orderItems, setOrderItems] = useState([]);
    const [orderNotes, setOrderNotes] = useState('');
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [pageTab, setPageTab] = useState('tables');
    const [orderType, setOrderType] = useState('table');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [printLang, setPrintLang] = useState('ar');
    const [originalOrderItems, setOriginalOrderItems] = useState([]);
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        fetchTables();
        fetchOrders();
        fetchMenuItems();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await apiService.tables.getAll();
            setTables(response.data);
        } catch (error) {
            handleApiError(error, 'جلب الطاولات');
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await apiService.orders.getAll('active');
            setOrders(response.data);
        } catch (error) {
            handleApiError(error, 'جلب الطلبات');
        }
    };

    const fetchTableOrders = async (tableId) => {
        try {
            const response = await apiService.orders.getByTable(tableId);
            setTableOrders(response.data);
            return response.data;
        } catch (error) {
            handleApiError(error, 'جلب طلبات الطاولة');
            return [];
        }
    };

    const fetchMenuItems = async () => {
        try {
            const [foodsRes, drinksRes, dessertsRes, hookahsRes] = await Promise.all([
                apiService.foods.getAll().catch(() => ({ data: [] })),
                apiService.drinks.getAll().catch(() => ({ data: [] })),
                apiService.desserts.getAll().catch(() => ({ data: [] })),
                apiService.hookahs.getAll().catch(() => ({ data: [] })),
            ]);
            setMenuItems({
                foods: foodsRes.data,
                drinks: drinksRes.data,
                desserts: dessertsRes.data,
                hookahs: hookahsRes.data,
            });
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const handleAddTable = async (e) => {
        e.preventDefault();
        if (!newTable.number) return;
        try {
            setIsLoading(true);
            await apiService.tables.add(newTable);
            setNewTable({ number: '', capacity: 4, location: '' });
            setShowAddTable(false);
            await fetchTables();
            toast.success('تم إضافة الطاولة بنجاح');
        } catch (error) {
            handleApiError(error, 'إضافة طاولة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTable = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await apiService.tables.update(editingTable._id, editingTable);
            setEditingTable(null);
            await fetchTables();
            toast.success('تم تحديث الطاولة بنجاح');
        } catch (error) {
            handleApiError(error, 'تحديث طاولة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTable = async (tableId) => {
        const confirmed = await confirm({
            title: 'حذف الطاولة',
            message: 'هل أنت متأكد من حذف هذه الطاولة؟ سيتم حذف جميع الطلبات المرتبطة بها.',
            confirmText: 'حذف',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            setIsLoading(true);
            await apiService.tables.delete(tableId);
            await fetchTables();
            toast.success('تم حذف الطاولة بنجاح');
        } catch (error) {
            handleApiError(error, 'حذف طاولة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTableClick = async (table) => {
        setSelectedTable(table);
        setOrderType('table'); // Default to table for table clicks
        setPaymentMethod('cash');
        setOrderItems([]);
        setOrderNotes('');
        setEditingOrderId(null);
        setMenuSearch('');
        setActiveMenuTab('foods');
        const ordersRes = await fetchTableOrders(table._id);

        // If table is occupied, load the active order for editing
        if (table.status === 'occupied') {
            const activeOrder = (ordersRes || tableOrders).find(o => o.status === 'active');
            if (activeOrder) {
                setEditingOrderId(activeOrder._id);
                setOrderType(activeOrder.orderType || 'table');
                setPaymentMethod(activeOrder.paymentMethod || 'cash');
                console.log(activeOrder);
                const items = activeOrder.items?.map(item => ({
                    name: item.name,
                    nameTr: item.nameTr || '',
                    price: item.price,
                    quantity: item.quantity,
                    notes: item.notes || ''
                })) || [];
                setOrderItems(items);
                setOriginalOrderItems([...items]);
                setOrderNotes(activeOrder.notes || '');
                setDiscount(activeOrder.discount || 0);
            }
        } else {
            setOriginalOrderItems([]);
            setDiscount(0);
        }
        setShowOrderModal(true);
    };

    const handleDeliveryOrderClick = () => {
        setSelectedTable(null);
        setOrderType('delivery');
        setPaymentMethod('cash');
        setOrderItems([]);
        setOriginalOrderItems([]);
        setDiscount(0);
        setOrderNotes('');
        setEditingOrderId(null);
        setMenuSearch('');
        setActiveMenuTab('foods');
        setShowOrderModal(true);
    };

    // Menu item selection
    const handleAddMenuItemToOrder = (item) => {
        const existingIndex = orderItems.findIndex(oi => oi.name === item.name);
        if (existingIndex >= 0) {
            const updated = [...orderItems];
            updated[existingIndex].quantity += 1;
            setOrderItems(updated);
        } else {
            console.log(item);
            setOrderItems([...orderItems, {
                name: item.name,
                nameTr: item.nameTr || '',
                price: item.price,
                quantity: 1,
                notes: ''
            }]);
        }
    };

    const handleOrderItemQuantity = (index, delta) => {
        const updated = [...orderItems];
        updated[index].quantity = Math.max(1, updated[index].quantity + delta);
        setOrderItems(updated);
    };

    const handleOrderItemNotes = (index, notes) => {
        const updated = [...orderItems];
        updated[index].notes = notes;
        setOrderItems(updated);
    };

    const handleRemoveOrderItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleCreateOrder = async (e) => {
        e?.preventDefault();
        if (orderItems.length === 0) {
            toast.error('يرجى إضافة عنصر واحد على الأقل');
            return;
        }
        try {
            setIsLoading(true);
            console.log(orderItems);
            const itemsPayload = orderItems.map(item => ({
                name: item.name,
                nameTr: item.nameTr || '',
                price: Number(item.price),
                quantity: Number(item.quantity),
                notes: item.notes || ''
            }));

            if (editingOrderId) {
                // Update existing order
                await apiService.orders.update(editingOrderId, {
                    orderType,
                    paymentMethod,
                    tableNumber: selectedTable?.number || null,
                    discount: Number(discount) || 0
                });
                toast.success('تم تحديث الطلب بنجاح');
            } else {
                // Create new order
                await apiService.orders.add({
                    table: selectedTable?._id || null,
                    tableNumber: selectedTable?.number || null,
                    items: itemsPayload,
                    notes: orderNotes,
                    createdBy: user?.username || '',
                    orderType,
                    paymentMethod,
                    discount: Number(discount) || 0
                });
                toast.success('تم إنشاء الطلب بنجاح');
            }
            setOrderItems([]);
            setOrderNotes('');
            setEditingOrderId(null);
            await fetchTables();
            await fetchOrders();
            if (selectedTable) {
                await fetchTableOrders(selectedTable._id);
            }

            // Auto-print bar receipt
            const currentOrderData = {
                table: selectedTable || { number: selectedTable?.number || 'سفري' },
                tableNumber: selectedTable?.number || null,
                items: itemsPayload,
                notes: orderNotes,
                orderType,
                createdAt: new Date().toISOString(),
                discount: Number(discount) || 0,
                tax: paymentMethod === 'credit_card' ? orderItemsSubtotal * 0.05 : 0
            };
            
            handlePrintBarReceipt(currentOrderData, editingOrderId ? originalOrderItems : null);

            setShowOrderModal(false); // Close modal after successful order
        } catch (error) {
            handleApiError(error, editingOrderId ? 'تحديث طلب' : 'إنشاء طلب');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrderStatus = async (orderId, status, pMethod) => {
        const msg = status === 'completed' ? 'إكمال' : 'إلغاء';
        const confirmed = await confirm({
            title: `${msg} الطلب`,
            message: `هل أنت متأكد من ${msg} هذا الطلب؟`,
            confirmText: msg,
            variant: status === 'completed' ? 'info' : 'warning',
        });
        if (!confirmed) return;
        try {
            setIsLoading(true);
            await apiService.orders.updateStatus(orderId, status, pMethod);
            await fetchTables();
            await fetchOrders();
            if (selectedTable) await fetchTableOrders(selectedTable._id);
            toast.success(`تم ${msg} الطلب بنجاح`);
        } catch (error) {
            handleApiError(error, `${msg} طلب`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmed = await confirm({
            title: 'حذف الطلب',
            message: 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذه العملية.',
            confirmText: 'حذف',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            setIsLoading(true);
            await apiService.orders.delete(orderId);
            await fetchTables();
            await fetchOrders();
            if (selectedTable) await fetchTableOrders(selectedTable._id);
            toast.success('تم حذف الطلب بنجاح');
        } catch (error) {
            handleApiError(error, 'حذف طلب');
        } finally {
            setIsLoading(false);
        }
    };

    // Helpers
    const getStatusBadge = (status) => {
        const map = {
            available: { label: 'متاحة', bg: '#4A2E1A', icon: 'bi-check-circle' },
            occupied: { label: 'مشغولة', bg: '#CD853F', icon: 'bi-person-fill' },
            reserved: { label: 'محجوزة', bg: '#D2B48C', icon: 'bi-bookmark-fill' },
        };
        const s = map[status] || map.available;
        return (
            <span className="badge ps-2 pe-1 py-1" style={{ backgroundColor: s.bg, fontSize: '0.75rem' }}>
                <i className={`bi ${s.icon} me-1`}></i>{s.label}
            </span>
        );
    };

    const handlePrintReceipt = async (order, lang = 'ar') => {
        try {
            await apiService.print.receipt({ ...order, lang });
            toast.success('تم إرسال الفاتورة إلى الطابعة بنجاح');
        } catch (error) {
            handleApiError(error, 'طباعة الفاتورة');
        }
    };

    const handlePrintBarReceipt = async (order, previousItems = null) => {
        try {
            await apiService.print.barReceipt({ ...order, previousItems, lang: 'ar' });
            // toast.success('تم إرسال طلب البار إلى الطابعة');
        } catch (error) {
            console.error('Bar print error:', error);
            toast.error('فشل إرسال طلب البار');
        }
    };

    const handleExportToExcel = () => {
        try {
            const dataToExport = orders.map(order => ({
                'رقم الطاولة': order.orderType === 'delivery' ? 'سفري' : (order.table?.number || '?'),
                'نوع الطلب': order.orderType === 'delivery' ? 'سفري' : 'طاولة',
                'العناصر': order.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || '',
                'الإجمالي': order.totalAmount || 0,
                'الكاشير': order.createdBy || '',
                'التاريخ': new Date(order.createdAt).toLocaleString('ar-SA'),
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Active Orders");
            XLSX.writeFile(wb, `Active_Orders_${new Date().toLocaleDateString()}.xlsx`);
            toast.success('تم تصدير البيانات إلى إكسل بنجاح');
        } catch (error) {
            console.error('Excel Export Error:', error);
            toast.error('فشل في تصدير البيانات');
        }
    };

    const getOrderStatusBadge = (status) => {
        const map = {
            active: { label: 'نشط', bg: '#6B4226' },
            completed: { label: 'مكتمل', bg: '#8B5E3C' },
            cancelled: { label: 'ملغى', bg: '#aaa' },
        };
        const s = map[status] || map.active;
        return <span className="badge" style={{ backgroundColor: s.bg }}>{s.label}</span>;
    };

    const getCategoryName = (cat) => {
        if (!cat) return '';
        return typeof cat === 'object' ? cat.name : cat;
    };

    const availableCount = tables.filter(t => t.status === 'available').length;
    const occupiedCount = tables.filter(t => t.status === 'occupied').length;
    const reservedCount = tables.filter(t => t.status === 'reserved').length;
    const activeOrdersCount = orders.filter(o => o.status === 'active').length;
    const totalOrdersAmount = orders.filter(o => o.status === 'active').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const orderItemsSubtotal = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    }, [orderItems]);

    const orderTax = useMemo(() => {
        return paymentMethod === 'credit_card' ? orderItemsSubtotal * 0.05 : 0;
    }, [orderItemsSubtotal, paymentMethod]);

    const orderTotal = useMemo(() => {
        return (orderItemsSubtotal - (Number(discount) || 0)) - orderTax;
    }, [orderItemsSubtotal, discount, orderTax]);

    const filteredTables = tables.filter(table =>
        filterStatus === 'all' || table.status === filterStatus
    );

    const locationOptions = ['', 'داخلي', 'قسم العائلات'];

    // Menu tabs config
    const menuTabs = [
        { key: 'foods', label: 'الأطعمة', icon: 'bi-egg-fried', color: '#6B4226' },
        { key: 'drinks', label: 'المشروبات', icon: 'bi-cup-straw', color: '#8B5E3C' },
        { key: 'desserts', label: 'الحلويات', icon: 'bi-cake2', color: '#CD853F' },
        { key: 'hookahs', label: 'الأراكيل', icon: 'bi-cloud', color: '#D2B48C' },
    ];

    // Filter menu items by search (search all categories if search is active)
    const filteredMenuItems = menuSearch 
        ? Object.values(menuItems).flat().filter(item =>
            item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
            (item.nameTr && item.nameTr.toLowerCase().includes(menuSearch.toLowerCase()))
          )
        : (menuItems[activeMenuTab] || []);

    // Group by category
    const groupedMenuItems = filteredMenuItems.reduce((groups, item) => {
        const catName = getCategoryName(item.category) || 'بدون فئة';
        if (!groups[catName]) groups[catName] = [];
        groups[catName].push(item);
        return groups;
    }, {});

    const toggleCategory = (catName) => {
        setOpenCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
    };

    const isCategoryOpen = (catName) => {
        // Default to closed unless explicitly opened, or if searching
        return menuSearch ? true : openCategories[catName] === true;
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: 'var(--bs-kale-cream, #F5EDE3)', minHeight: '100vh' }}>
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h1 className="display-6 fw-bold mb-1 d-flex gap-2" style={{ color: '#4A2E1A' }}>
                                <i className="bi bi-grid-1x2 me-3" style={{ color: '#6B4226' }}></i>
                                إدارة الطاولات والطلبات
                            </h1>
                            <p className="text-muted fs-5">إدارة طاولات المطعم واستلام الطلبات ومتابعتها</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="row mb-4 g-3">
                {[
                    { label: 'إجمالي الطاولات', value: tables.length, icon: 'bi-grid-1x2', color: '#6B4226' },
                    { label: 'متاحة', value: availableCount, icon: 'bi-check-circle', color: '#4A2E1A' },
                    { label: 'مشغولة', value: occupiedCount, icon: 'bi-person-fill', color: '#CD853F' },
                    { label: 'طلبات نشطة', value: activeOrdersCount, icon: 'bi-receipt', color: '#8B5E3C' },
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

            {/* Page Tabs */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex gap-2 p-1 rounded-3" style={{ backgroundColor: 'rgba(107,66,38,0.06)', display: 'inline-flex' }}>
                        {[
                            { key: 'tables', label: 'الطاولات', icon: 'bi-grid-3x3-gap', count: tables.length },
                            { key: 'orders', label: 'الطلبات النشطة', icon: 'bi-receipt', count: orders.length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setPageTab(tab.key)}
                                className="btn d-flex align-items-center gap-2 px-4 py-2"
                                style={{
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: pageTab === tab.key ? '600' : '400',
                                    backgroundColor: pageTab === tab.key ? '#fff' : 'transparent',
                                    color: pageTab === tab.key ? '#4A2E1A' : '#8B7355',
                                    boxShadow: pageTab === tab.key ? '0 2px 8px rgba(107,66,38,0.12)' : 'none',
                                    transition: 'all 0.25s ease',
                                }}
                            >
                                <i className={`bi ${tab.icon}`}></i>
                                {tab.label}
                                <span className="badge" style={{
                                    backgroundColor: pageTab === tab.key ? '#6B4226' : 'rgba(107,66,38,0.12)',
                                    color: pageTab === tab.key ? '#fff' : '#6B4226',
                                    fontSize: '0.7rem',
                                }}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tables Grid */}
            {pageTab === 'tables' && (
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0" style={{ color: '#4A2E1A' }}>
                                <i className="bi bi-grid-3x3-gap me-2"></i>
                                الطاولات
                            </h5>
                            <div className="d-flex align-items-center gap-2">
                                {[
                                    { key: 'all', label: 'الكل', icon: 'bi-grid' },
                                    { key: 'available', label: 'متاح', icon: 'bi-check-circle' },
                                    { key: 'occupied', label: 'مشغول', icon: 'bi-person-fill' },
                                    { key: 'reserved', label: 'محجوز', icon: 'bi-calendar-event' },
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setFilterStatus(filter.key)}
                                        className={`btn btn-sm d-flex align-items-center px-3 py-1`}
                                        style={{
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            backgroundColor: filterStatus === filter.key ? '#6B4226' : '#fff',
                                            color: filterStatus === filter.key ? '#fff' : '#6B4226',
                                            border: `1px solid ${filterStatus === filter.key ? '#6B4226' : 'rgba(107,66,38,0.2)'}`,
                                            fontWeight: filterStatus === filter.key ? '600' : 'normal',
                                            boxShadow: filterStatus === filter.key ? '0 2px 6px rgba(107,66,38,0.2)' : 'none'
                                        }}
                                    >
                                        <i className={`bi ${filter.icon} ms-1`}></i>
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                            {/* {totalOrdersAmount > 0 && (
                                <span className="badge fs-6 px-3 py-2 text-white" style={{ background: '#6B4226' }}>
                                    إجمالي الطلبات النشطة: {totalOrdersAmount.toLocaleString()} ل.ت
                                </span>
                            )} */}
                        <div className="d-flex align-items-center gap-2">
                            <button
                                onClick={handleDeliveryOrderClick}
                                className="btn text-white px-4 d-flex gap-1"
                                style={{ background: 'linear-gradient(135deg, #8B5E3C 0%, #CD853F 100%)', borderRadius: '10px' }}
                                disabled={isLoading}
                            >
                                <i className="bi bi-bicycle me-2"></i>
                                طلب سفري
                            </button>
                            {!isStaff && (
                                <button
                                    onClick={() => setShowAddTable(true)}
                                    className="btn text-white px-4 d-flex gap-1"
                                    style={{ background: 'linear-gradient(135deg, #6B4226 0%, #CD853F 100%)', borderRadius: '10px' }}
                                    disabled={isLoading}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    إضافة طاولة
                                </button>
                            )}

                        </div>
                        </div>
                        <div className="card-body">
                            {filteredTables.length > 0 ? (
                                <div className="row g-3">
                                    {filteredTables.map((table) => {
                                        const tableActiveOrders = orders.filter(o =>
                                            (o.table?._id || o.table) === table._id
                                        );
                                        const tableTotal = tableActiveOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
                                        return (
                                            <div key={table._id} className="col-xl-2 col-lg-3 col-md-4 col-6">
                                                <div
                                                    className="card border-0 h-100 position-relative overflow-hidden"
                                                    onClick={() => handleTableClick(table)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        borderRadius: '14px',
                                                        borderRight: `4px solid ${table.status === 'occupied' ? '#CD853F' : table.status === 'reserved' ? '#D2B48C' : '#4A2E1A'}`,
                                                        backgroundColor: '#fff',
                                                        boxShadow: '0 2px 10px rgba(74,46,26,0.06)',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(107,66,38,0.16)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(74,46,26,0.06)';
                                                    }}
                                                >
                                                    {/* Status ribbon */}
                                                    <div style={{
                                                        height: '4px',
                                                        background: table.status === 'occupied'
                                                            ? 'linear-gradient(90deg, #CD853F, #DEB887)'
                                                            : table.status === 'reserved'
                                                                ? 'linear-gradient(90deg, #D2B48C, #E8D5B7)'
                                                                : 'linear-gradient(90deg, #4A2E1A, #6B4226)',
                                                    }}></div>

                                                    <div className="card-body p-3 d-flex flex-column align-items-center">
                                                        {/* Table number badge */}
                                                        <div className="d-flex align-items-center justify-content-center mb-3"
                                                            style={{
                                                                width: '56px', height: '56px',
                                                                borderRadius: '14px',
                                                                background: table.status === 'occupied'
                                                                    ? 'linear-gradient(135deg, rgba(205,133,63,0.15), rgba(222,184,135,0.1))'
                                                                    : table.status === 'reserved'
                                                                        ? 'linear-gradient(135deg, rgba(210,180,140,0.18), rgba(232,213,183,0.1))'
                                                                        : 'linear-gradient(135deg, rgba(74,46,26,0.1), rgba(107,66,38,0.05))',
                                                                border: `1.5px solid ${table.status === 'occupied' ? 'rgba(205,133,63,0.2)' : table.status === 'reserved' ? 'rgba(210,180,140,0.25)' : 'rgba(74,46,26,0.1)'}`,
                                                            }}>
                                                            <span className="fw-bold" style={{ fontSize: '1.4rem', color: table.status === 'occupied' ? '#CD853F' : '#4A2E1A' }}>
                                                                {table.number}
                                                            </span>
                                                        </div>

                                                        {/* Status badge */}
                                                        <div className="mb-3">{getStatusBadge(table.status)}</div>

                                                        {/* Info section */}
                                                        <div className="w-100 rounded-3 p-2 mb-2" style={{ backgroundColor: '#FAFAF7' }}>
                                                            <div className="d-flex align-items-center justify-content-center" style={{ fontSize: '0.78rem', color: '#6B4226' }}>
                                                                <i className="bi bi-people-fill me-1" style={{ opacity: 0.7 }}></i>
                                                                <span>{table.capacity} مقاعد</span>
                                                            </div>
                                                            {table.location && (
                                                                <>
                                                                    <div className="mx-auto my-1" style={{ width: '60%', height: '1px', backgroundColor: 'rgba(107,66,38,0.08)' }}></div>
                                                                    <div className="d-flex align-items-center justify-content-center" style={{ fontSize: '0.75rem', color: '#8B5E3C' }}>
                                                                        <i className="bi bi-geo-alt-fill me-1" style={{ opacity: 0.6 }}></i>
                                                                        <span>{table.location}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Active order total */}
                                                        {tableTotal > 0 && (
                                                            <div className="w-100 text-center py-1 px-2 rounded-2 mb-2"
                                                                style={{ backgroundColor: 'rgba(107,66,38,0.07)', border: '1px dashed rgba(107,66,38,0.15)' }}>
                                                                <span className="fw-bold" style={{ color: '#6B4226', fontSize: '0.85rem' }}>
                                                                    {tableTotal.toLocaleString()} ل.ت
                                                                </span>
                                                            </div>
                                                        )}

                                                        {!isStaff && (
                                                            <div className="d-flex justify-content-center gap-2 mt-auto pt-1">
                                                                <button className="btn btn-sm d-flex align-items-center justify-content-center"
                                                                    style={{
                                                                        width: '30px', height: '30px', borderRadius: '8px',
                                                                        backgroundColor: 'rgba(107,66,38,0.06)', border: '1px solid rgba(107,66,38,0.1)',
                                                                        color: '#6B4226', fontSize: '0.75rem', transition: 'all 0.2s ease',
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#6B4226'; e.currentTarget.style.color = '#fff'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(107,66,38,0.06)'; e.currentTarget.style.color = '#6B4226'; }}
                                                                    onClick={(e) => { e.stopPropagation(); setEditingTable({ ...table }); }}
                                                                    disabled={isLoading}>
                                                                    <i className="bi bi-pencil-fill"></i>
                                                                </button>
                                                                <button className="btn btn-sm d-flex align-items-center justify-content-center"
                                                                    style={{
                                                                        width: '30px', height: '30px', borderRadius: '8px',
                                                                        backgroundColor: 'rgba(220,53,69,0.06)', border: '1px solid rgba(220,53,69,0.12)',
                                                                        color: '#dc3545', fontSize: '0.75rem', transition: 'all 0.2s ease',
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dc3545'; e.currentTarget.style.color = '#fff'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(220,53,69,0.06)'; e.currentTarget.style.color = '#dc3545'; }}
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTable(table._id); }}
                                                                    disabled={isLoading}>
                                                                    <i className="bi bi-trash-fill"></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-grid-1x2 text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-3">لا توجد طاولات. أضف طاولة للبدء.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Active Orders Summary */}
            {pageTab === 'orders' && orders.length > 0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0" style={{ color: '#4A2E1A' }}>
                                    <i className="bi bi-receipt me-2"></i>
                                    الطلبات النشطة ({orders.length})
                                </h5>
                                <button 
                                    onClick={handleExportToExcel}
                                    className="btn btn-sm text-white d-flex align-items-center gap-2"
                                    style={{ background: '#6B4226', borderRadius: '8px' }}
                                >
                                    <i className="bi bi-file-earmark-excel"></i>
                                    تصدير إكسل
                                </button>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>الطاولة</th>
                                                <th>العناصر</th>
                                                <th>المجموع</th>
                                                <th>مستلم الطلب</th>
                                                <th>الوقت</th>
                                                <th className="text-center">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order._id}>
                                                    <td>
                                                        <span className="badge" style={{ backgroundColor: order.orderType === 'delivery' ? '#CD853F' : '#6B4226' }}>
                                                            {order.orderType === 'delivery' ? 'سفري' : `طاولة ${order.table?.number || '?'}`}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-link p-2 text-decoration-none border-1 " 
                                                            style={{ color: '#6B4226', fontSize: '0.85rem',border:'1px solid #6B4226' }}
                                                            onClick={() => setViewingOrder(order)}
                                                        >
                                                            <i className="bi bi-eye me-1"></i>
                                                            عرض {order.items?.length || 0} عناصر
                                                        </button>
                                                    </td>
                                                    <td className="fw-bold" style={{ color: '#6B4226' }}>
                                                        {(order.totalAmount || 0).toLocaleString()} ل.ت
                                                    </td>
                                                    <td><small className="text-muted">{order.createdBy || '-'}</small></td>
                                                    <td><small className="text-muted">{new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</small></td>
                                                    <td className="text-center">
                                                        <div className="d-flex gap-1 justify-content-center">
                                                            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                                                onClick={() => handlePrintReceipt(order, 'ar')}
                                                                title="طباعة عربي"
                                                                disabled={isLoading}>
                                                                <i className="bi bi-printer"></i>AR
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                                                onClick={() => handlePrintReceipt(order, 'tr')}
                                                                title="Türkçe Yazdır"
                                                                disabled={isLoading}>
                                                                <i className="bi bi-printer"></i>TR
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                                                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                                                onClick={() => handlePrintBarReceipt(order)}
                                                                title="طباعة بار"
                                                                disabled={isLoading}>
                                                                <i className="bi bi-cup-straw"></i>Bar
                                                            </button>
                                                            <div className="vr mx-1"></div>
                                                            {!isStaff && (
                                                                <>
                                                                    <button className="btn btn-sm text-white d-flex align-items-center gap-1"
                                                                        style={{ backgroundColor: '#4A2E1A', fontSize: '0.75rem' }}
                                                                        onClick={() => handleOrderStatus(order._id, 'completed', order.paymentMethod)}
                                                                        disabled={isLoading}>
                                                                        <i className="bi bi-check-lg"></i>إكمال
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                        style={{ fontSize: '0.75rem' }}
                                                                        onClick={() => handleOrderStatus(order._id, 'cancelled')}
                                                                        disabled={isLoading}>
                                                                        <i className="bi bi-x-lg"></i>إلغاء
                                                                    </button>
                                                                </>
                                                            )}

                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {pageTab === 'orders' && orders.length === 0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <i className="bi bi-receipt text-muted" style={{ fontSize: '3rem' }}></i>
                                <p className="text-muted mt-3">لا توجد طلبات نشطة حالياً.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========== MODALS =========== */}

            {/* Add Table Modal */}
            {showAddTable && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between">
                                <h5 className="modal-title d-flex gap-2"><i className="bi bi-plus-circle me-2"></i>إضافة طاولة جديدة</h5>
                                <button onClick={() => setShowAddTable(false)} className="btn btn-danger"><FiX/></button>
                            </div>
                            <form onSubmit={handleAddTable}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">رقم الطاولة</label>
                                            <input type="number" className="form-control" value={newTable.number}
                                                onChange={e => setNewTable({ ...newTable, number: e.target.value })}
                                                required disabled={isLoading} min="1" placeholder="1" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">عدد المقاعد</label>
                                            <input type="number" className="form-control" value={newTable.capacity}
                                                onChange={e => setNewTable({ ...newTable, capacity: e.target.value })}
                                                disabled={isLoading} min="1" max="20" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">الموقع</label>
                                            <select className="form-select" value={newTable.location}
                                                onChange={e => setNewTable({ ...newTable, location: e.target.value })}
                                                disabled={isLoading}>
                                                {locationOptions.map(loc => (
                                                    <option key={loc} value={loc}>{loc || 'بدون تحديد'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowAddTable(false)} className="btn btn-secondary" disabled={isLoading}>إلغاء</button>
                                    <button type="submit" className="btn text-white d-flex gap-1" style={{ background: 'linear-gradient(135deg, #6B4226, #CD853F)' }} disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري الإضافة...</> : <><i className="bi bi-check-circle me-2"></i>إضافة</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Table Modal */}
            {editingTable && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between">
                                <h5 className="modal-title"><i className="bi bi-pencil me-2"></i>تعديل طاولة {editingTable.number}</h5>
                                <button onClick={() => setEditingTable(null)} className="btn btn-danger"><FiX /></button>
                            </div>
                            <form onSubmit={handleUpdateTable}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">رقم الطاولة</label>
                                            <input type="number" className="form-control" value={editingTable.number}
                                                onChange={e => setEditingTable({ ...editingTable, number: e.target.value })}
                                                required disabled={isLoading} min="1" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">عدد المقاعد</label>
                                            <input type="number" className="form-control" value={editingTable.capacity}
                                                onChange={e => setEditingTable({ ...editingTable, capacity: e.target.value })}
                                                disabled={isLoading} min="1" max="20" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">الحالة</label>
                                            <select className="form-select" value={editingTable.status}
                                                onChange={e => setEditingTable({ ...editingTable, status: e.target.value })}
                                                disabled={isLoading}>
                                                <option value="available">متاحة</option>
                                                <option value="reserved">محجوزة</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">الموقع</label>
                                            <select className="form-select" value={editingTable.location || ''}
                                                onChange={e => setEditingTable({ ...editingTable, location: e.target.value })}
                                                disabled={isLoading}>
                                                {locationOptions.map(loc => (
                                                    <option key={loc} value={loc}>{loc || 'بدون تحديد'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setEditingTable(null)} className="btn btn-secondary" disabled={isLoading}>إلغاء</button>
                                    <button type="submit" className="btn text-white" style={{ background: 'linear-gradient(135deg, #6B4226, #CD853F)' }} disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري التحديث...</> : <><i className="bi bi-check-circle me-2"></i>حفظ</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Modal (Table Details + Menu Browser) */}
            {showOrderModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable ">
                        <div className="modal-content" style={{ maxHeight: '92vh', width: '100%' }}>
                            <div className="modal-header d-flex justify-content-between align-items-center w-100" style={{ background: 'linear-gradient(135deg, #F5EDE3, #ece0d4)' }}>
                                <h5 className="gap-3 d-flex align-items-center mb-0" style={{ color: '#4A2E1A' }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <i className={`bi ${orderType === 'delivery' ? 'bi-bicycle' : 'bi-grid-1x2'} me-2`}></i>
                                    <span style={{ whiteSpace: "nowrap" }}>
                                      {orderType === 'delivery' ? 'طلب سفري' : `طاولة ${selectedTable?.number}`}
                                    </span>
                                  </div>         
                                  {selectedTable && <span className="ms-2">{getStatusBadge(selectedTable.status)}</span>}
                                </h5>
                                <div className="d-flex align-items-end justify-content-end w-100">
                                <button onClick={() => { setShowOrderModal(false); setSelectedTable(null); }} className="btn btn-danger"> <FiX/></button>
                                </div>
                            </div>
                            <div className="modal-body p-0">
                                <div className="row g-0" style={{ minHeight: '60vh' }}>
                                    {/* Left side: Menu Browser */}
                                    <div className="col-lg-6 border-end" style={{ backgroundColor: '#FDF8F3' }}>
                                        <div className="p-3">
                                            <h6 className="fw-bold mb-3 d-flex gap-2" style={{ color: '#4A2E1A' }}>
                                                <i className="bi bi-menu-button-wide me-2"></i>اختر من القائمة
                                            </h6>

                                            {/* Search Bar */}
                                            <div className="position-relative mb-3">
                                                <i className="bi bi-search position-absolute" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B5E3C' }}></i>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm pe-5"
                                                    placeholder="ابحث في القائمة..."
                                                    value={menuSearch}
                                                    onChange={e => setMenuSearch(e.target.value)}
                                                    style={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                                />
                                            </div>

                                            {/* Menu Tabs */}
                                            <div className="d-flex gap-1 mb-3 flex-wrap">
                                                {menuTabs.map(tab => (
                                                    <button
                                                        key={tab.key}
                                                        className={`btn btn-sm d-flex gap-1 ${activeMenuTab === tab.key ? 'text-white' : ''}`}
                                                        style={{
                                                            backgroundColor: activeMenuTab === tab.key ? tab.color : 'rgba(107,66,38,0.06)',
                                                            color: activeMenuTab === tab.key ? '#fff' : tab.color,
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            border: 'none',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onClick={() => { setActiveMenuTab(tab.key); setMenuSearch(''); }}
                                                    >
                                                        <i className={`bi ${tab.icon} me-1`}></i>
                                                        {tab.label}
                                                        <span className="badge ms-1" style={{
                                                            backgroundColor: activeMenuTab === tab.key ? 'rgba(255,255,255,0.25)' : 'rgba(107,66,38,0.1)',
                                                            color: activeMenuTab === tab.key ? '#fff' : tab.color,
                                                            fontSize: '0.65rem'
                                                        }}>
                                                            {menuItems[tab.key]?.length || 0}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Menu Items List */}
                                            <div style={{ maxHeight: '45vh', overflowY: 'auto' }}>
                                                {Object.keys(groupedMenuItems).length > 0 ? (
                                                    Object.entries(groupedMenuItems).map(([catName, items]) => (
                                                        <div key={catName} className="mb-2">
                                                            <div
                                                                className="d-flex align-items-center mb-1 py-2 px-2 rounded-2 gap-2"
                                                                onClick={() => toggleCategory(catName)}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    backgroundColor: 'rgba(107,66,38,0.06)',
                                                                    transition: 'all 0.2s ease',
                                                                    userSelect: 'none',
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(107,66,38,0.1)'}
                                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(107,66,38,0.06)'}
                                                            >
                                                                <i className={`bi ${isCategoryOpen(catName) ? 'bi-chevron-down' : 'bi-chevron-left'} me-2`}
                                                                    style={{ color: '#6B4226', fontSize: '0.75rem', transition: 'transform 0.2s ease' }}></i>
                                                                <span className="fw-semibold" style={{ color: '#6B4226', fontSize: '0.8rem' }}>
                                                                    {catName}
                                                                </span>
                                                                <span className="badge ms-2" style={{ backgroundColor: 'rgba(107,66,38,0.12)', color: '#6B4226', fontSize: '0.65rem' }}>
                                                                    {items.length}
                                                                </span>
                                                                <div className="flex-grow-1 ms-2" style={{ height: '1px', backgroundColor: 'rgba(107,66,38,0.1)' }}></div>
                                                            </div>
                                                            <div style={{
                                                                maxHeight: isCategoryOpen(catName) ? '5000px' : '0',
                                                                overflow: 'hidden',
                                                                transition: 'max-height 0.3s ease',
                                                            }}>
                                                                {items.map(item => {
                                                                    const inOrder = orderItems.find(oi => oi.name === item.name);
                                                                    return (
                                                                        <div
                                                                            key={item._id}
                                                                            className="d-flex justify-content-between align-items-center py-2 px-3 mb-1 rounded-3"
                                                                            style={{
                                                                                backgroundColor: inOrder ? 'rgba(107,66,38,0.06)' : '#fff',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s ease',
                                                                                border: inOrder ? '1px solid rgba(107,66,38,0.15)' : '1px solid rgba(0,0,0,0.04)',
                                                                            }}
                                                                            onClick={() => handleAddMenuItemToOrder(item)}
                                                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(107,66,38,0.06)'}
                                                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = inOrder ? 'rgba(107,66,38,0.06)' : '#fff'}
                                                                        >
                                                                            <div>
                                                                                <span className="fw-semibold" style={{ fontSize: '0.9rem', color: '#4A2E1A' }}>
                                                                                    {item.name}
                                                                                    {item.nameTr && (
                                                                                        <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                                                                                            {item.nameTr}
                                                                                        </div>
                                                                                    )}
                                                                                </span>
                                                                                {inOrder && (
                                                                                    <span className="badge ms-2" style={{ backgroundColor: '#6B4226', fontSize: '0.65rem' }}>
                                                                                        ×{inOrder.quantity}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <span className="fw-bold" style={{ color: '#6B4226', fontSize: '0.85rem' }}>
                                                                                    {item.price?.toLocaleString()} ل.ت
                                                                                </span>
                                                                                <i className="bi bi-plus-circle" style={{ color: '#CD853F', fontSize: '1.1rem' }}></i>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <i className="bi bi-search text-muted" style={{ fontSize: '2rem' }}></i>
                                                        <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>
                                                            {menuSearch ? 'لا توجد نتائج مطابقة' : 'لا توجد عناصر'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Custom Item Form */}
                                            <div className="border-top pt-3 mt-2">
                                                <div
                                                    className="d-flex gap-2 align-items-center py-2 px-2 rounded-2 mb-2"
                                                    onClick={() => setShowCustomItem(!showCustomItem)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        backgroundColor: 'rgba(107,66,38,0.06)',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(107,66,38,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(107,66,38,0.06)'}
                                                >
                                                    <i className={`bi ${showCustomItem ? 'bi-chevron-down' : 'bi-chevron-left'} me-2`}
                                                        style={{ color: '#6B4226', fontSize: '0.75rem' }}></i>
                                                    <i className="bi bi-pencil-square me-2" style={{ color: '#6B4226', fontSize: '0.8rem' }}></i>
                                                    <span className="fw-semibold" style={{ color: '#4A2E1A', fontSize: '0.85rem' }}>إضافة عنصر مخصص</span>
                                                </div>
                                                {showCustomItem && (
                                                    <div className="d-flex flex-column gap-2">
                                                        <div className="d-flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                placeholder="اسم العنصر (عربي)"
                                                                value={customItem.name}
                                                                onChange={e => setCustomItem({ ...customItem, name: e.target.value })}
                                                                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                placeholder="Product Name (TR)"
                                                                value={customItem.nameTr}
                                                                onChange={e => setCustomItem({ ...customItem, nameTr: e.target.value })}
                                                                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                                                            />
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                placeholder="السعر"
                                                                value={customItem.price}
                                                                onChange={e => setCustomItem({ ...customItem, price: e.target.value })}
                                                                style={{ borderRadius: '8px', fontSize: '0.85rem', maxWidth: '120px' }}
                                                                min="0"
                                                            />
                                                            <button
                                                                className="btn btn-sm text-white flex-grow-1"
                                                                style={{ background: 'linear-gradient(135deg, #6B4226, #CD853F)', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                                                disabled={!customItem.name || !customItem.price}
                                                                onClick={() => {
                                                                    handleAddMenuItemToOrder({ 
                                                                        name: customItem.name, 
                                                                        nameTr: customItem.nameTr, 
                                                                        price: Number(customItem.price) 
                                                                    });
                                                                    setCustomItem({ name: '', nameTr: '', price: '' });
                                                                }}
                                                            >
                                                                <i className="bi bi-plus me-1"></i>
                                                                إضافة للطلب
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: Order Summary + Active Orders */}
                                    <div className="col-lg-6">
                                        <div className="p-3">
                                            {/* Current Order Items */}
                                            <h6 className="fw-bold mb-3 d-flex gap-2" style={{ color: '#4A2E1A' }}>
                                                <i className="bi bi-cart3 me-2"></i>
                                                الطلب الحالي
                                                {orderItems.length > 0 && (
                                                    <span className="badge ms-2" style={{ backgroundColor: '#6B4226', fontSize: '0.7rem' }}>
                                                        {orderItems.length} عنصر
                                                    </span>
                                                )}
                                            </h6>

                                            {/* Order Details: Payment Method Only (Order Type is automatic) */}
                                            <div className="row g-2 mb-3">
                                                <div className="col-12">
                                                    <label className="form-label small fw-bold mb-1">طريقة الدفع</label>
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            type="button"
                                                            className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${paymentMethod === 'cash' ? 'btn-dark' : 'btn-outline-dark'}`}
                                                            onClick={() => setPaymentMethod('cash')}
                                                            style={{ borderRadius: '8px', py: '10px' }}
                                                        >
                                                            <i className="bi bi-cash"></i>
                                                            نقداً
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${paymentMethod === 'credit_card' ? 'btn-dark' : 'btn-outline-dark'}`}
                                                            onClick={() => setPaymentMethod('credit_card')}
                                                            style={{ borderRadius: '8px', py: '10px' }}
                                                        >
                                                            <i className="bi bi-credit-card"></i>
                                                            بطاقة
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {orderItems.length > 0 ? (
                                                <div className="mb-3">
                                                    {orderItems.map((item, index) => (
                                                        <div key={index} className="d-flex align-items-center justify-content-between py-2 px-3 mb-1 rounded-3"
                                                            style={{ backgroundColor: 'rgba(107,66,38,0.03)', border: '1px solid rgba(107,66,38,0.08)' }}>
                                                            <div className="flex-grow-1">
                                                                <div className="fw-semibold" style={{ fontSize: '0.85rem', color: '#4A2E1A' }}>
                                                                    {item.name}
                                                                    {item.nameTr && (
                                                                        <span className="text-muted ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                                                                            ({item.nameTr})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <small className="text-muted">{Number(item.price).toLocaleString()} ل.ت </small>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm mt-1"
                                                                    placeholder="ملاحظات..."
                                                                    value={item.notes}
                                                                    onChange={e => handleOrderItemNotes(index, e.target.value)}
                                                                    style={{ fontSize: '0.75rem', borderRadius: '6px', maxWidth: '200px' }}
                                                                />
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 ms-2">
                                                                <div className="btn-group btn-group-sm">
                                                                    <button className="btn btn-outline-secondary" style={{ padding: '1px 8px' }}
                                                                        onClick={() => handleOrderItemQuantity(index, -1)}>−</button>
                                                                    <span className="btn btn-outline-secondary disabled fw-bold" style={{ padding: '1px 10px', minWidth: '35px' }}>
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button className="btn btn-outline-secondary" style={{ padding: '1px 8px' }}
                                                                        onClick={() => handleOrderItemQuantity(index, 1)}>+</button>
                                                                </div>
                                                                <span className="fw-bold" style={{ color: '#6B4226', fontSize: '0.85rem', minWidth: '60px', textAlign: 'left' }}>
                                                                    {(item.price * item.quantity).toLocaleString()}
                                                                </span>
                                                                <button className="btn btn-sm btn-outline-danger" style={{ padding: '1px 6px', fontSize: '0.7rem' }}
                                                                    onClick={() => handleRemoveOrderItem(index)}>
                                                                    <i className="bi bi-x"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-3 mb-3 rounded-3" style={{ backgroundColor: 'rgba(107,66,38,0.03)' }}>
                                                    <i className="bi bi-cart text-muted" style={{ fontSize: '1.5rem' }}></i>
                                                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.85rem' }}>اختر عناصر من القائمة على اليمين</p>
                                                </div>
                                            )}

                                            {/* Order Notes */}
                                            <div className="mb-2">
                                                <input type="text" className="form-control form-control-sm" placeholder="ملاحظات عامة على الطلب..."
                                                    value={orderNotes} onChange={e => setOrderNotes(e.target.value)} disabled={isLoading}
                                                    style={{ borderRadius: '8px', fontSize: '0.85rem' }} />
                                            </div>

                                            {/* Discount Input */}
                                            <div className="mb-3">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text" style={{ backgroundColor: 'rgba(107,66,38,0.06)', color: '#6B4226', border: '1px solid rgba(107,66,38,0.1)' }}>خصم (ل.ت)</span>
                                                    <input 
                                                        type="number" 
                                                        className="form-control" 
                                                        value={discount} 
                                                        onChange={e => setDiscount(e.target.value)}
                                                        min="0"
                                                        placeholder="0"
                                                        style={{ border: '1px solid rgba(107,66,38,0.1)' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Total + Submit */}
                                            {orderItems.length > 0 && (
                                                <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: 'rgba(107,66,38,0.06)', border: '1px solid rgba(107,66,38,0.12)' }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-dashed" style={{ fontSize: '0.85rem' }}>
                                                        <span className="text-muted">المجموع الفرعي:</span>
                                                        <span className="fw-semibold">{orderItemsSubtotal.toLocaleString()} ل.ت</span>
                                                    </div>
                                                    {Number(discount) > 0 && (
                                                        <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-dashed text-danger" style={{ fontSize: '0.85rem' }}>
                                                            <span>الخصم:</span>
                                                            <span>-{Number(discount).toLocaleString()} ل.ت</span>
                                                        </div>
                                                    )}
                                                    {orderTax > 0 && (
                                                        <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-dashed text-danger" style={{ fontSize: '0.85rem' }}>
                                                            <span>خصم بطاقة (5%):</span>
                                                            <span>-{orderTax.toLocaleString()} ل.ت</span>
                                                        </div>
                                                    )}
                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <span className="fw-bold fs-5" style={{ color: '#4A2E1A' }}>الإجمالي:</span>
                                                        <span className="fw-bold fs-4" style={{ color: '#6B4226' }}>
                                                            {orderTotal.toLocaleString()} ل.ت
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <button onClick={handleCreateOrder} className="btn text-white w-100 mb-4 d-flex gap-2 align-items-center justify-content-center"
                                                style={{ background: editingOrderId ? 'linear-gradient(135deg, #CD853F, #DEB887)' : 'linear-gradient(135deg, #6B4226, #CD853F)', borderRadius: '10px' }}
                                                disabled={isLoading || orderItems.length === 0}>
                                                {isLoading 
                                                    ? <><span className="spinner-border spinner-border-sm me-2"></span>{editingOrderId ? 'جاري التحديث...' : 'جاري الإنشاء...'}</>
                                                    : editingOrderId 
                                                        ? <><i className="bi bi-pencil-square me-2"></i>تحديث الطلب ({orderItems.length} عنصر)</>
                                                        : <><i className="bi bi-receipt me-2"></i>إنشاء طلب ({orderItems.length} عنصر)</>}
                                            </button>

                                            {/* Active Orders for this Table */}
                                            {tableOrders.filter(o => o.status === 'active').length > 0 && (
                                                <div className="border-top pt-3">
                                                    <h6 className="fw-bold mb-2" style={{ color: '#4A2E1A', fontSize: '0.9rem' }}>
                                                        <i className="bi bi-receipt me-2"></i>طلبات نشطة لهذه الطاولة
                                                    </h6>
                                                    {tableOrders.filter(o => o.status === 'active').map(order => (
                                                        <div key={order._id} className="card border-0 mb-2" style={{ backgroundColor: 'rgba(107,66,38,0.03)', borderRight: '3px solid #6B4226' }}>
                                                            <div className="card-body p-2">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div style={{ fontSize: '0.8rem' }}>
                                                                        {order.items?.map((item, idx) => (
                                                                            <span key={idx} className="me-2">
                                                                                {item.name} <small className="text-muted">×{item.quantity}</small>
                                                                                {idx < order.items.length - 1 && '، '}
                                                                            </span>
                                                                        ))}
                                                                        {order.notes && <div><small className="text-muted"><i className="bi bi-chat-text me-1"></i>{order.notes}</small></div>}
                                                                    </div>
                                                                    <div className="text-end ms-2">
                                                                        <div className="fw-bold mb-1" style={{ color: '#6B4226', fontSize: '0.85rem' }}>
                                                                            {(order.totalAmount || 0).toLocaleString()} ل.ت
                                                                        </div>
                                                                        <div className="btn-group">
                                                                            <button className="btn btn-sm btn-outline-secondary"
                                                                                style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                                                                                onClick={() => handlePrintReceipt(order, 'ar')}
                                                                                title="طباعة عربي">
                                                                                <i className="bi bi-printer"></i> AR
                                                                            </button>
                                                                            <button className="btn btn-sm btn-outline-secondary"
                                                                                style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                                                                                onClick={() => handlePrintReceipt(order, 'tr')}
                                                                                title="Türkçe Yazdır">
                                                                                <i className="bi bi-printer"></i> TR
                                                                            </button>
                                                                            <button className="btn btn-sm btn-outline-dark"
                                                                                style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                                                                                onClick={() => handlePrintBarReceipt(order)}
                                                                                title="طباعة بار">
                                                                                <i className="bi bi-cup-straw"></i> Bar
                                                                            </button>
                                                                            {!isStaff && (
                                                                                <>
                                                                                    <button className="btn btn-sm text-white"
                                                                                        style={{ backgroundColor: '#4A2E1A', fontSize: '0.65rem', padding: '1px 6px' }}
                                                                                        onClick={() => handleOrderStatus(order._id, 'completed', paymentMethod)}>
                                                                                        <i className="bi bi-check-lg"></i>
                                                                                    </button>
                                                                                    <button className="btn btn-sm btn-outline-danger"
                                                                                        style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                                                                                        onClick={() => handleOrderStatus(order._id, 'cancelled')}>
                                                                                        <i className="bi bi-x-lg"></i>
                                                                                    </button>
                                                                                    <button className="btn btn-sm btn-outline-secondary"
                                                                                        style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                                                                                        onClick={() => handleDeleteOrder(order._id)}>
                                                                                        <i className="bi bi-trash"></i>
                                                                                    </button>
                                                                                </>
                                                                            )}

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                    <i className="bi bi-clock me-1"></i>
                                                                    {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                                                    {order.createdBy && <> · {order.createdBy}</>}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Past Orders */}
                                            {/* {tableOrders.filter(o => o.status !== 'active').length > 0 && (
                                                <div className="border-top pt-3 mt-3">
                                                    <h6 className="fw-bold mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                        <i className="bi bi-clock-history me-2"></i>سجل الطلبات السابقة
                                                    </h6>
                                                    {tableOrders.filter(o => o.status !== 'active').slice(0, 5).map(order => (
                                                        <div key={order._id} className="d-flex justify-content-between align-items-center py-1 border-bottom" style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                                                            <div>
                                                                <small>{order.items?.map(i => i.name).join('، ')}</small>
                                                                <span className="ms-2">{getOrderStatusBadge(order.status)}</span>
                                                            </div>
                                                            <small className="text-muted">{(order.totalAmount || 0).toLocaleString()} ل.ت</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {viewingOrder && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-0 pb-2" style={{ backgroundColor: '#FDF8F3' }}>
                                <h5 className="modal-title fw-bold" style={{ color: '#4A2E1A' }}>
                                    <i className="bi bi-receipt me-2"></i>
                                    تفاصيل الطلب - {viewingOrder.table?.number ? `طاولة ${viewingOrder.table.number}` : 'سفري'}
                                </h5>
                                <div className="d-flex align-items-center justify-content-around w-50">
                                <div className="d-flex align-items-center gap-2">
                                    <button onClick={() => handlePrintReceipt(viewingOrder, 'ar')} className="btn btn-sm btn-outline-secondary d-print-none d-flex align-items-center gap-1" title="طباعة عربي">
                                        <i className="bi bi-printer"></i> AR
                                    </button>
                                    <button onClick={() => handlePrintReceipt(viewingOrder, 'tr')} className="btn btn-sm btn-outline-secondary d-print-none d-flex align-items-center gap-1" title="Türkçe Yazdır">
                                        <i className="bi bi-printer"></i> TR
                                    </button>
                                    <button onClick={() => handlePrintBarReceipt(viewingOrder)} className="btn btn-sm btn-outline-dark d-print-none d-flex align-items-center gap-1" title="طباعة بار">
                                        <i className="bi bi-cup-straw"></i> Bar
                                    </button>
                                </div>
                                    <div className="d-flex align-items-end justify-content-end w-100">
                                        <button onClick={() => { setViewingOrder(null); }} className="btn btn-danger"> <FiX /></button>
                                    </div>

                                        
                                    </div>
                            </div>
                            <div className="modal-body p-4" style={{ backgroundColor: '#FDF8F3' }}>
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3 border-bottom pb-2" style={{ color: '#6B4226' }}>الأصناف المقيدة:</h6>
                                    <div className="list-group list-group-flush rounded-3 shadow-sm" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {viewingOrder.items?.map((item, idx) => (
                                            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#fff' }}>
                                                <div>
                                                    <div className="fw-bold" style={{ color: '#4A2E1A' }}>
                                                        {item.name}
                                                        {item.nameTr && (
                                                            <div className="text-muted small fw-normal">({item.nameTr})</div>
                                                        )}
                                                    </div>
                                                    <div className="d-flex align-items-center mt-1">
                                                        <span className="badge me-2" style={{ backgroundColor: 'rgba(107,66,38,0.1)', color: '#6B4226' }}>{item.quantity} ×</span>
                                                        <small className="text-muted">{Number(item.price).toLocaleString()} ل.ت</small>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#F5EDE3', borderRight: '3px solid #CD853F' }}>
                                                            <small className="text-muted"><i className="bi bi-chat-left-text me-1"></i>{item.notes}</small>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="fw-bold" style={{ color: '#6B4226' }}>
                                                    {(item.price * item.quantity).toLocaleString()} ل.ت
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {viewingOrder.notes && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-2" style={{ color: '#6B4226' }}>ملاحظات عامة:</h6>
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#fff', border: '1px dashed #CD853F' }}>
                                            <p className="mb-0 text-muted">{viewingOrder.notes}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: 'rgba(107,66,38,0.06)', border: '1px solid rgba(107,66,38,0.12)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-dashed" style={{ fontSize: '0.85rem' }}>
                                        <span className="text-muted">المجموع الفرعي:</span>
                                        <span className="fw-semibold">{(viewingOrder.subtotal || (viewingOrder.totalAmount + (viewingOrder.discount || 0) + (viewingOrder.tax || 0))).toLocaleString()} ل.ت</span>
                                    </div>
                                    {viewingOrder.discount > 0 && (
                                        <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-dashed text-danger" style={{ fontSize: '0.85rem' }}>
                                            <span>الخصم:</span>
                                            <span>-{viewingOrder.discount.toLocaleString()} ل.ت</span>
                                        </div>
                                    )}
                                    {viewingOrder.tax > 0 && (
                                        <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-dashed text-danger" style={{ fontSize: '0.85rem' }}>
                                            <span>خصم بطاقة (5%):</span>
                                            <span>-{viewingOrder.tax.toLocaleString()} ل.ت</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <span className="fw-bold fs-5" style={{ color: '#4A2E1A' }}>الإجمالي:</span>
                                        <span className="fw-bold fs-4" style={{ color: '#6B4226' }}>
                                            {(viewingOrder.totalAmount || 0).toLocaleString()} ل.ت
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 d-print-none" style={{ backgroundColor: '#FDF8F3' }}>
                                <button onClick={() => setViewingOrder(null)} className="btn px-4 fw-bold" style={{ backgroundColor: '#4A2E1A', color: '#fff', borderRadius: '10px' }}>
                                    إغلاق النافذة
                                </button>
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
                            {viewingOrder.table?.number ? `طاولة ${viewingOrder.table.number}` : 'سفري'}
                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-2 pb-2" style={{ borderBottom: '1px solid #ddd', fontSize: '0.85rem' }}>
                        <span>{new Date(viewingOrder.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span>{new Date(viewingOrder.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
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
                                        <td className="text-end py-1">
                                            {item.name}
                                            {item.nameTr && <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.nameTr}</div>}
                                        </td>
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

                    <div className="pt-2 border-top border-dashed">
                        <div className="d-flex justify-content-between" style={{ fontSize: '0.9rem' }}>
                            <span>المجموع الفرعي:</span>
                            <span>{(viewingOrder.subtotal || (viewingOrder.totalAmount + (viewingOrder.discount || 0) + (viewingOrder.tax || 0))).toLocaleString()} ل.ت</span>
                        </div>
                        {viewingOrder.discount > 0 && (
                            <div className="d-flex justify-content-between" style={{ fontSize: '0.9rem' }}>
                                <span>الخصم:</span>
                                <span>-{viewingOrder.discount.toLocaleString()} ل.ت</span>
                            </div>
                        )}
                        {viewingOrder.tax > 0 && (
                            <div className="d-flex justify-content-between" style={{ fontSize: '0.9rem' }}>
                                <span>خصم بطاقة (5%):</span>
                                <span>-{viewingOrder.tax.toLocaleString()} ل.ت</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between fw-bold mt-1" style={{ fontSize: '1.2rem', borderTop: '1px solid #000' }}>
                            <span>الإجمالي:</span>
                            <span>{(viewingOrder.totalAmount || 0).toLocaleString()} ل.ت</span>
                        </div>
                    </div>
                    
                    <div className="text-center mt-4 pb-2" style={{ fontSize: '0.8rem' }}>
                        شكراً لزيارتكم!
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablesPage;
