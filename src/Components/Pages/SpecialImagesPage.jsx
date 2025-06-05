import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiService, handleApiError } from '../../config/apiService';

const SpecialImagesPage = () => {
    const [images, setImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.images.special.getAll();
            setImages(response.data);
        } catch (error) {
            handleApiError(error, 'جلب الصور الخاصة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('يرجى اختيار صورة واحدة على الأقل');
            return;
        }

        try {
            setIsLoading(true);
            setUploadProgress(0);

            // Upload files one by one
            for (let i = 0; i < selectedFiles.length; i++) {
                const formData = new FormData();
                formData.append('file', selectedFiles[i]);

                await apiService.images.special.add(formData);
                setUploadProgress(((i + 1) / selectedFiles.length) * 100);
            }

            setSelectedFiles([]);
            await fetchImages();
            toast.success(`تم رفع ${selectedFiles.length} صورة بنجاح`);

            // Reset file input
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            handleApiError(error, 'رفع الصور الخاصة');
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

        try {
            setIsLoading(true);
            await apiService.images.special.delete(imageId);
            await fetchImages();
            toast.success('تم حذف الصورة بنجاح');
        } catch (error) {
            handleApiError(error, 'حذف الصورة الخاصة');
        } finally {
            setIsLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 بايت';
        const k = 1024;
        const sizes = ['بايت', 'كيلو بايت', 'ميجا بايت', 'جيجا بايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="display-6 fw-bold text-dark mb-1">
                                <i className="bi bi-images text-info me-3"></i>
                                إدارة الصور الخاصة
                            </h1>
                            <p className="text-muted fs-5">إدارة الصور الترويجية والعروض الخاصة</p>
                        </div>
                        <button
                            onClick={() => document.getElementById('file-input').click()}
                            className="btn btn-info"
                            disabled={isLoading}
                        >
                            <i className="bi bi-cloud-upload me-2"></i>
                            رفع صور جديدة
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="row mb-4 g-3">
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-info text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-images fs-1 mb-2"></i>
                            <h3 className="fw-bold">{images.length}</h3>
                            <p className="mb-0">إجمالي الصور</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-success text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-file-earmark-image fs-1 mb-2"></i>
                            <h3 className="fw-bold">{selectedFiles.length}</h3>
                            <p className="mb-0">الصور المحددة</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-warning text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-star-fill fs-1 mb-2"></i>
                            <h3 className="fw-bold">{Math.round(uploadProgress)}</h3>
                            <p className="mb-0">تقدم الرفع %</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm bg-primary text-white">
                        <div className="card-body text-center">
                            <i className="bi bi-upload fs-1 mb-2"></i>
                            <h3 className="fw-bold">{isLoading ? 'جاري' : 'مكتمل'}</h3>
                            <p className="mb-0">حالة الرفع</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light border-0">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-cloud-upload me-2"></i>
                                رفع الصور الخاصة
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label fw-semibold">اختر الصور</label>
                                    <input
                                        id="file-input"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="form-control"
                                        disabled={isLoading}
                                        style={{ display: 'none' }}
                                    />
                                    <div
                                        className="border border-dashed border-info rounded p-4 text-center"
                                        onClick={() => document.getElementById('file-input').click()}
                                        style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                                    >
                                        <i className="bi bi-cloud-upload text-info" style={{ fontSize: '3rem' }}></i>
                                        <p className="text-muted mt-3 mb-2">اضغط هنا لاختيار الصور أو اسحبها إلى هنا</p>
                                        <small className="text-muted">
                                            يمكنك اختيار عدة صور مرة واحدة. الصيغ المدعومة: JPG, PNG, GIF, WebP
                                        </small>
                                    </div>
                                </div>

                                {/* Selected Files Preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="col-12">
                                        <div className="card bg-light">
                                            <div className="card-body">
                                                <h6 className="card-title">
                                                    <i className="bi bi-files me-2"></i>
                                                    الملفات المحددة ({selectedFiles.length})
                                                </h6>
                                                <div className="row g-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {selectedFiles.map((file, index) => (
                                                        <div key={index} className="col-12">
                                                            <div className="d-flex justify-content-between align-items-center p-2 bg-white rounded">
                                                                <span className="text-truncate">{file.name}</span>
                                                                <span className="badge bg-secondary ms-2">{formatFileSize(file.size)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Progress */}
                                {isLoading && uploadProgress > 0 && (
                                    <div className="col-12">
                                        <div className="card bg-primary text-white">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>جاري الرفع...</span>
                                                    <span>{Math.round(uploadProgress)}%</span>
                                                </div>
                                                <div className="progress" style={{ height: '8px' }}>
                                                    <div
                                                        className="progress-bar bg-light"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="col-12">
                                    <button
                                        onClick={handleUpload}
                                        disabled={isLoading || selectedFiles.length === 0}
                                        className="btn btn-info w-100 btn-lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                جاري الرفع...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-cloud-upload me-2"></i>
                                                رفع {selectedFiles.length} صورة
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Images Gallery */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-grid-3x3-gap me-2"></i>
                                    معرض الصور الخاصة ({images.length})
                                </h5>
                                <button
                                    onClick={fetchImages}
                                    className="btn btn-outline-secondary"
                                    disabled={isLoading}
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    تحديث
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {isLoading && images.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-info mb-3"></div>
                                    <p className="text-muted">جاري تحميل الصور...</p>
                                </div>
                            ) : images.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="bi bi-image text-muted" style={{ fontSize: '4rem' }}></i>
                                    <h3 className="text-muted mt-3 mb-2">لا توجد صور بعد</h3>
                                    <p className="text-muted">ارفع بعض الصور الخاصة للبدء</p>
                                </div>
                            ) : (
                                <div className="row g-4">
                                    {images.map((image) => (
                                        <div key={image._id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                                            <div className="card border-0 shadow-sm h-100">
                                                <div className="position-relative">
                                                    <img
                                                        src={`https://kale-cafe.com/uploads/${image.image}`}
                                                        alt="صورة خاصة"
                                                        className="card-img-top"
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                    />
                                                    <div className="position-absolute top-0 end-0 m-2">
                                                        <div className="btn-group-vertical">
                                                            <button
                                                                onClick={() => window.open(`https://kale-cafe.com/uploads/${image.image}`, '_blank')}
                                                                className="btn btn-sm btn-info mb-1"
                                                                title="عرض"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteImage(image._id)}
                                                                className="btn btn-sm btn-danger"
                                                                disabled={isLoading}
                                                                title="حذف"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-body p-2">
                                                    <p className="card-text small text-muted text-truncate mb-1">
                                                        {image.image}
                                                    </p>
                                                    {image.createdAt && (
                                                        <small className="text-muted">
                                                            <i className="bi bi-calendar me-1"></i>
                                                            {formatDate(image.createdAt)}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Instructions */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 bg-info bg-opacity-10">
                        <div className="card-body">
                            <h5 className="text-info mb-3">
                                <i className="bi bi-info-circle me-2"></i>
                                تعليمات الاستخدام
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <ul className="list-unstyled text-muted">
                                        <li><i className="bi bi-check2 text-success me-2"></i>الصور الخاصة تُستخدم للمحتوى الترويجي والعروض المميزة</li>
                                        <li><i className="bi bi-check2 text-success me-2"></i>يتم تحسين الصور تلقائياً للعرض على الويب</li>
                                        <li><i className="bi bi-check2 text-success me-2"></i>حجم الصورة المُوصى به: 800x600 بكسل على الأقل</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <ul className="list-unstyled text-muted">
                                        <li><i className="bi bi-check2 text-success me-2"></i>الحد الأقصى لحجم الملف: 5 ميجا بايت</li>
                                        <li><i className="bi bi-check2 text-success me-2"></i>ستظهر هذه الصور في الأقسام الخاصة بالكافيه</li>
                                        <li><i className="bi bi-check2 text-success me-2"></i>يمكن رفع عدة صور في نفس الوقت</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialImagesPage; 