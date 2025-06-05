import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../../config/apiService';
import { useAuth } from '../../context/AuthContext';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'staff'
    });
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.users.getAll();
            setUsers(response.data);
        } catch (error) {
            handleApiError(error, 'جلب المستخدمين');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.email || !newUser.password) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setIsLoading(true);
            await apiService.users.create(newUser);
            setNewUser({ username: '', email: '', password: '', role: 'staff' });
            setShowCreateForm(false);
            await fetchUsers();
            toast.success('تم إنشاء المستخدم بنجاح');
        } catch (error) {
            handleApiError(error, 'إنشاء مستخدم');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser.username || !editingUser.email) {
            toast.error('اسم المستخدم والإيميل مطلوبان');
            return;
        }

        try {
            setIsLoading(true);
            await apiService.users.update(editingUser._id, {
                username: editingUser.username,
                email: editingUser.email,
                role: editingUser.role,
                isActive: editingUser.isActive
            });
            setEditingUser(null);
            await fetchUsers();
            toast.success('تم تحديث المستخدم بنجاح');
        } catch (error) {
            handleApiError(error, 'تحديث مستخدم');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) return;

        try {
            setIsLoading(true);
            await apiService.users.delete(userId);
            await fetchUsers();
            toast.success('تم حذف المستخدم بنجاح');
        } catch (error) {
            handleApiError(error, 'حذف مستخدم');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-danger';
            case 'manager': return 'bg-primary';
            case 'staff': return 'bg-success';
            default: return 'bg-secondary';
        }
    };

    const getRoleArabic = (role) => {
        switch (role) {
            case 'admin': return 'مدير';
            case 'manager': return 'مشرف';
            case 'staff': return 'موظف';
            default: return role;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="display-6 fw-bold text-dark mb-1">
                                <i className="bi bi-people text-primary me-3"></i>
                                إدارة المستخدمين
                            </h1>
                            <p className="text-muted fs-5">إدارة حسابات المستخدمين والصلاحيات</p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            <i className="bi bi-person-plus me-2"></i>
                            إضافة مستخدم جديد
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="row mb-4 g-3">
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-primary text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-people fs-1 mb-2"></i>
                            <h3 className="fw-bold">{users.length}</h3>
                            <p className="mb-0">إجمالي المستخدمين</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-success text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-person-check fs-1 mb-2"></i>
                            <h3 className="fw-bold">{users.filter(u => u.isActive).length}</h3>
                            <p className="mb-0">المستخدمين النشطين</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-danger text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-shield-check fs-1 mb-2"></i>
                            <h3 className="fw-bold">{users.filter(u => u.role === 'admin').length}</h3>
                            <p className="mb-0">المديرين</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-info text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-people-fill fs-1 mb-2"></i>
                            <h3 className="fw-bold">{users.filter(u => u.role === 'staff').length}</h3>
                            <p className="mb-0">الموظفين</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light border-0">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-list-ul me-2"></i>
                                قائمة المستخدمين ({users.length})
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="fw-semibold">المستخدم</th>
                                            <th className="fw-semibold">الدور</th>
                                            <th className="fw-semibold">الحالة</th>
                                            <th className="fw-semibold">آخر دخول</th>
                                            <th className="fw-semibold">تاريخ الإنشاء</th>
                                            <th className="fw-semibold text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id}>
                                                <td>
                                                    <div>
                                                        <div className="fw-semibold">
                                                            {user.username}
                                                            {user._id === currentUser.id && (
                                                                <span className="badge bg-info ms-2">أنت</span>
                                                            )}
                                                        </div>
                                                        <div className="text-muted small">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                                                        {getRoleArabic(user.role)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                        {user.isActive ? 'نشط' : 'غير نشط'}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">
                                                    {user.lastLogin ? formatDate(user.lastLogin) : 'لم يدخل بعد'}
                                                </td>
                                                <td className="text-muted small">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="text-center">
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="btn btn-sm btn-outline-primary"
                                                            disabled={isLoading}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        {user._id !== currentUser.id && (
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id, user.username)}
                                                                className="btn btn-sm btn-outline-danger"
                                                                disabled={isLoading}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && !isLoading && (
                                    <div className="text-center py-5">
                                        <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                        <p className="text-muted mt-3">لا يوجد مستخدمين</p>
                                    </div>
                                )}
                                {isLoading && users.length === 0 && (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary mb-3"></div>
                                        <p className="text-muted">جاري تحميل المستخدمين...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateForm && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-person-plus me-2"></i>
                                    إضافة مستخدم جديد
                                </h5>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="btn-close"
                                ></button>
                            </div>
                            <form onSubmit={handleCreateUser}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">اسم المستخدم</label>
                                            <input
                                                type="text"
                                                value={newUser.username}
                                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                className="form-control"
                                                placeholder="أدخل اسم المستخدم"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                className="form-control"
                                                placeholder="أدخل البريد الإلكتروني"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">كلمة المرور</label>
                                            <input
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="form-control"
                                                placeholder="أدخل كلمة المرور"
                                                required
                                                disabled={isLoading}
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">الدور</label>
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                className="form-select"
                                                disabled={isLoading}
                                            >
                                                <option value="staff">موظف</option>
                                                <option value="manager">مشرف</option>
                                                <option value="admin">مدير</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewUser({ username: '', email: '', password: '', role: 'staff' });
                                        }}
                                        className="btn btn-secondary"
                                        disabled={isLoading}
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                جاري الإنشاء...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                إنشاء المستخدم
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-pencil me-2"></i>
                                    تعديل المستخدم
                                </h5>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="btn-close"
                                ></button>
                            </div>
                            <form onSubmit={handleUpdateUser}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">اسم المستخدم</label>
                                            <input
                                                type="text"
                                                value={editingUser.username}
                                                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                                className="form-control"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                value={editingUser.email}
                                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                                className="form-control"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">الدور</label>
                                            <select
                                                value={editingUser.role}
                                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                                className="form-select"
                                                disabled={isLoading}
                                            >
                                                <option value="staff">موظف</option>
                                                <option value="manager">مشرف</option>
                                                <option value="admin">مدير</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-check mt-4">
                                                <input
                                                    type="checkbox"
                                                    checked={editingUser.isActive}
                                                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                                                    className="form-check-input"
                                                    disabled={isLoading}
                                                />
                                                <label className="form-check-label fw-semibold">
                                                    مستخدم نشط
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="btn btn-secondary"
                                        disabled={isLoading}
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                جاري التحديث...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                تحديث المستخدم
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage; 