import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../../config/apiService';
import { exportToExcel, exportImagesToExcel, exportCategoriesToExcel } from '../../utils/excelExport';
import DraggableCategories from '../DraggableCategories';

const DrinksPage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [images, setImages] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        description: ''
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showImageForm, setShowImageForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        fetchImages();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiService.categories.getDrinkCategories();
            setCategories(response.data);
        } catch (error) {
            handleApiError(error, 'جلب فئات المشروبات');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await apiService.drinks.getAll();
            setProducts(response.data);
        } catch (error) {
            handleApiError(error, 'جلب المشروبات');
        }
    };

    const fetchImages = async () => {
        try {
            const response = await apiService.images.drink.getAll();
            setImages(response.data);
        } catch (error) {
            handleApiError(error, 'جلب صور المشروبات');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            setIsLoading(true);
            await apiService.categories.add({
                name: newCategory,
                type: 'drinks'
            });
            setNewCategory('');
            setShowCategoryForm(false);
            await fetchCategories();
            toast.success('تم إضافة الفئة بنجاح');
        } catch (error) {
            handleApiError(error, 'إضافة فئة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price || !newProduct.category) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setIsLoading(true);
            await apiService.drinks.add(newProduct);
            setNewProduct({
                name: '',
                price: '',
                category: '',
                description: ''
            });
            setShowAddForm(false);
            await fetchProducts();
            toast.success('تم إضافة المشروب بنجاح');
        } catch (error) {
            handleApiError(error, 'إضافة مشروب');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!editingProduct.name || !editingProduct.price || !editingProduct.category) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setIsLoading(true);
            await apiService.drinks.update(editingProduct._id, editingProduct);
            setEditingProduct(null);
            await fetchProducts();
            toast.success('تم تحديث المشروب بنجاح');
        } catch (error) {
            handleApiError(error, 'تحديث مشروب');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!imageFile || !selectedCategory) {
            toast.error('يرجى اختيار ملف وفئة');
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('category', selectedCategory);
            formData.append('name', imageFile.name.split('.')[0] || `صورة-${Date.now()}`);

            await apiService.images.drink.add(formData);
            setImageFile(null);
            setSelectedCategory('');
            setShowImageForm(false);
            await fetchImages();
            toast.success('تم رفع الصورة بنجاح');
        } catch (error) {
            handleApiError(error, 'رفع صورة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (window.confirm(`هل أنت متأكد من حذف فئة "${categoryName}"؟`)) {
            try {
                setIsLoading(true);
                await apiService.categories.delete(categoryId);
                await fetchCategories();
                toast.success('تم حذف الفئة بنجاح');
            } catch (error) {
                handleApiError(error, 'حذف الفئة');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdateCategoryOrder = async (categoryId, order) => {
        try {
            setIsLoading(true);
            await apiService.categories.updateOrder(categoryId, order);
            await fetchCategories();
            toast.success('تم تحديث ترتيب الفئة بنجاح');
        } catch (error) {
            handleApiError(error, 'تحديث ترتيب الفئة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReorderCategories = async (sourceIndex, destinationIndex) => {
        try {
            setIsLoading(true);

            // Create a new array with reordered items
            const reorderedCategories = Array.from(categories);
            const [removed] = reorderedCategories.splice(sourceIndex, 1);
            reorderedCategories.splice(destinationIndex, 0, removed);

            // Update the order values based on new positions
            const updates = reorderedCategories.map((category, index) => ({
                id: category._id,
                order: index + 1
            }));

            // Update the backend first, then refresh
            await apiService.categories.batchUpdateOrder(updates);
            await fetchCategories();
            toast.success('تم إعادة ترتيب الفئات بنجاح');
        } catch (error) {
            handleApiError(error, 'إعادة ترتيب الفئات');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (!window.confirm(`هل أنت متأكد من حذف "${productName}"؟`)) return;

        try {
            setIsLoading(true);
            await apiService.drinks.delete(productId);
            await fetchProducts();
            toast.success('تم حذف المشروب بنجاح');
        } catch (error) {
            handleApiError(error, 'حذف مشروب');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

        try {
            setIsLoading(true);
            await apiService.images.drink.delete(imageId);
            await fetchImages();
            toast.success('تم حذف الصورة بنجاح');
        } catch (error) {
            handleApiError(error, 'حذف صورة');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        // Compare using category ObjectId (handle both string and object)
        const productCategoryId = typeof product.category === 'object' ? product.category : product.category._id;
        const matchesCategory = selectedCategory ? productCategoryId === selectedCategory : true;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const filteredImages = selectedCategory
        // Compare using category ObjectId (handle both string and object)
        ? images.filter(image => {
            const imageCategoryId = typeof image.category === 'object' ? image.category._id : image.category;
            return imageCategoryId === selectedCategory;
        })
        : images;

    const getCategoryName = (categoryId) => {
        // Handle both ObjectId string and populated category object
        if (typeof categoryId === 'object' && categoryId !== null) {
            return categoryId.name; // Already populated category object
        }
        // Find category by ObjectId string
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : categoryId;
    };

    // Excel Export Functions
    const handleExportProducts = () => {
        try {
            const success = exportToExcel(filteredProducts, 'drinks', 'المشروبات');
            if (success) {
                toast.success('تم تصدير المشروبات بنجاح');
            } else {
                toast.error('فشل في تصدير المشروبات');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء التصدير');
        }
    };

    const handleExportImages = () => {
        try {
            const success = exportImagesToExcel(filteredImages, 'drink-images', 'المشروبات');
            if (success) {
                toast.success('تم تصدير الصور بنجاح');
            } else {
                toast.error('فشل في تصدير الصور');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تصدير الصور');
        }
    };

    const handleExportCategories = () => {
        try {
            const success = exportCategoriesToExcel(categories, 'drink-categories');
            if (success) {
                toast.success('تم تصدير الفئات بنجاح');
            } else {
                toast.error('فشل في تصدير الفئات');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تصدير الفئات');
        }
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="display-6 fw-bold text-dark mb-1">
                                <i className="bi bi-cup-straw text-info me-3"></i>
                                إدارة المشروبات
                            </h1>
                            <p className="text-muted fs-5">إدارة قائمة المشروبات والفئات والصور</p>
                        </div>
                        <div className="d-flex gap-2">
                            <div className="btn-group" role="group">
                                <button
                                    onClick={handleExportProducts}
                                    className="btn btn-outline-primary"
                                    disabled={isLoading}
                                    title="تصدير المشروبات إلى Excel"
                                >
                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                    تصدير المشروبات
                                </button>
                                <button
                                    onClick={handleExportImages}
                                    className="btn btn-outline-secondary"
                                    disabled={isLoading}
                                    title="تصدير الصور إلى Excel"
                                >
                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                    تصدير الصور
                                </button>
                                <button
                                    onClick={handleExportCategories}
                                    className="btn btn-outline-dark"
                                    disabled={isLoading}
                                    title="تصدير الفئات إلى Excel"
                                >
                                    <i className="bi bi-file-earmark-excel me-2"></i>
                                    تصدير الفئات
                                </button>
                            </div>
                            <button
                                onClick={() => setShowCategoryForm(true)}
                                className="btn btn-outline-success"
                                disabled={isLoading}
                            >
                                <i className="bi bi-folder-plus me-2"></i>
                                إضافة فئة
                            </button>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="btn btn-info"
                                disabled={isLoading}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                إضافة مشروب
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="row mb-4 g-3">
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-info text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-cup-straw fs-1 mb-2"></i>
                            <h3 className="fw-bold">{products.length}</h3>
                            <p className="mb-0">إجمالي المشروبات</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-success text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-grid-3x3-gap fs-1 mb-2"></i>
                            <h3 className="fw-bold">{categories.length}</h3>
                            <p className="mb-0">الفئات</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-primary text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-images fs-1 mb-2"></i>
                            <h3 className="fw-bold">{images.length}</h3>
                            <p className="mb-0">الصور</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-warning text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-funnel fs-1 mb-2"></i>
                            <h3 className="fw-bold">{filteredProducts.length}</h3>
                            <p className="mb-0">المطابقة للفلتر</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-search me-2"></i>
                                        البحث
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="ابحث في المشروبات..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-funnel me-2"></i>
                                        فلترة حسب الفئة
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">كل الفئات</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <button
                                        onClick={() => setShowImageForm(true)}
                                        className="btn btn-outline-info w-100"
                                        disabled={isLoading}
                                    >
                                        <i className="bi bi-cloud-upload me-2"></i>
                                        رفع صورة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light border-0">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-list-ul me-2"></i>
                                قائمة المشروبات ({filteredProducts.length})
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="fw-semibold">الاسم</th>
                                            <th className="fw-semibold">الفئة</th>
                                            <th className="fw-semibold">السعر</th>
                                            <th className="fw-semibold text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((product) => (
                                            <tr key={product._id}>
                                                <td className="fw-semibold">{product.name}</td>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {getCategoryName(product.category)}
                                                    </span>
                                                </td>
                                                <td className="fw-bold text-success">{product.price} ل.ت</td>
                                                <td className="text-center">
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            onClick={() => setEditingProduct(product)}
                                                            className="btn btn-sm btn-outline-primary"
                                                            disabled={isLoading}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product._id, product.name)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            disabled={isLoading}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-5">
                                        <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                        <p className="text-muted mt-3">لا توجد مشروبات متطابقة مع البحث</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories and Images Row */}
            <div className="row g-4">
                {/* Categories */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light border-0">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-grid-3x3-gap me-2"></i>
                                الفئات ({categories.length})
                            </h5>
                        </div>
                        <div className="card-body">
                            {categories.length > 0 ? (
                                <DraggableCategories
                                    categories={categories}
                                    onReorder={handleReorderCategories}
                                    onDelete={handleDeleteCategory}
                                    isLoading={isLoading}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-folder-x text-muted" style={{ fontSize: '2rem' }}></i>
                                    <p className="text-muted mt-2">لا توجد فئات</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light border-0">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-images me-2"></i>
                                الصور ({filteredImages.length})
                            </h5>
                        </div>
                        <div className="card-body">
                            {filteredImages.length > 0 ? (
                                <div className="row g-3">
                                    {filteredImages.map((image) => (
                                        <div key={image._id} className="col-6">
                                            <div className="position-relative">
                                                <img
                                                    src={`https://kale-cafe.com/uploads/${image.imagePath}`}
                                                    alt="Drink"
                                                    className="img-fluid rounded shadow-sm"
                                                    style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                                                />
                                                <button
                                                    onClick={() => handleDeleteImage(image._id)}
                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                    disabled={isLoading}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }}></i>
                                    <p className="text-muted mt-2">لا توجد صور</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCategoryForm && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-folder-plus me-2"></i>
                                    إضافة فئة جديدة
                                </h5>
                                <button onClick={() => setShowCategoryForm(false)} className="btn-close"></button>
                            </div>
                            <form onSubmit={handleAddCategory}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">اسم الفئة</label>
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            className="form-control"
                                            placeholder="مثال: مشروبات ساخنة، عصائر طبيعية..."
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowCategoryForm(false)} className="btn btn-secondary" disabled={isLoading}>إلغاء</button>
                                    <button type="submit" className="btn btn-success" disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري الإضافة...</> : <><i className="bi bi-check-circle me-2"></i>إضافة</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showAddForm && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    إضافة مشروب جديد
                                </h5>
                                <button onClick={() => setShowAddForm(false)} className="btn-close"></button>
                            </div>
                            <form onSubmit={handleAddProduct}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">اسم المشروب</label>
                                            <input
                                                type="text"
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                className="form-control"
                                                placeholder="مثال: قهوة تركية، عصير برتقال..."
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">السعر (ليرة)</label>
                                            <input
                                                type="number"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                className="form-control"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">الفئة</label>
                                            <select
                                                value={newProduct.category}
                                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                className="form-select"
                                                required
                                                disabled={isLoading}
                                            >
                                                <option value="">اختر الفئة</option>
                                                {categories.map(category => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" disabled={isLoading}>إلغاء</button>
                                    <button type="submit" className="btn btn-info" disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري الإضافة...</> : <><i className="bi bi-check-circle me-2"></i>إضافة</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {editingProduct && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-pencil me-2"></i>
                                    تعديل مشروب
                                </h5>
                                <button onClick={() => setEditingProduct(null)} className="btn-close"></button>
                            </div>
                            <form onSubmit={handleUpdateProduct}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">اسم المشروب</label>
                                            <input
                                                type="text"
                                                value={editingProduct.name}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                className="form-control"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">السعر (ليرة)</label>
                                            <input
                                                type="number"
                                                value={editingProduct.price}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                className="form-control"
                                                min="0"
                                                step="0.01"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">الفئة</label>
                                            <select
                                                value={editingProduct.category}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                                className="form-select"
                                                required
                                                disabled={isLoading}
                                            >
                                                <option value="">اختر الفئة</option>
                                                {categories.map(category => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-secondary" disabled={isLoading}>إلغاء</button>
                                    <button type="submit" className="btn btn-success" disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري التحديث...</> : <><i className="bi bi-check-circle me-2"></i>تحديث</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showImageForm && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-cloud-upload me-2"></i>
                                    رفع صورة
                                </h5>
                                <button onClick={() => setShowImageForm(false)} className="btn-close"></button>
                            </div>
                            <form onSubmit={handleAddImage}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">الفئة</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="form-select"
                                            required
                                            disabled={isLoading}
                                        >
                                            <option value="">اختر الفئة</option>
                                            {categories.map(category => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">الصورة</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                            className="form-control"
                                            accept="image/*"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowImageForm(false)} className="btn btn-secondary" disabled={isLoading}>إلغاء</button>
                                    <button type="submit" className="btn btn-info" disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري الرفع...</> : <><i className="bi bi-cloud-upload me-2"></i>رفع</>}
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

export default DrinksPage; 