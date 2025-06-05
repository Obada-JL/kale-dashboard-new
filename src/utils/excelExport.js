import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename, categoryName) => {
  try {
    // Prepare data for export
    const exportData = data.map((item, index) => ({
      '#': index + 1,
      'الاسم': item.name || '',
      'الفئة': getCategoryName(item.category) || '',
      'السعر': item.price ? `${item.price} ل.ت` : '',
      'الوصف': item.description || 'لا يوجد وصف',
      'تاريخ الإنشاء': item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SA') : '',
      'آخر تحديث': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ar-SA') : ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 5 },  // #
      { wch: 25 }, // الاسم
      { wch: 20 }, // الفئة
      { wch: 15 }, // السعر
      { wch: 30 }, // الوصف
      { wch: 15 }, // تاريخ الإنشاء
      { wch: 15 }  // آخر تحديث
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, categoryName);

    // Generate file with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filename}-${timestamp}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const exportImagesToExcel = (data, filename, categoryName) => {
  try {
    // Prepare image data for export
    const exportData = data.map((item, index) => ({
      '#': index + 1,
      'اسم الصورة': item.name || item.image || item.imagePath || '',
      'الفئة': getCategoryName(item.category) || '',
      'مسار الملف': item.image || item.imagePath || '',
      'الحجم (بايت)': item.size || '',
      'تاريخ الرفع': item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SA') : '',
      'آخر تحديث': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ar-SA') : ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 5 },  // #
      { wch: 25 }, // اسم الصورة
      { wch: 20 }, // الفئة
      { wch: 30 }, // مسار الملف
      { wch: 15 }, // الحجم
      { wch: 15 }, // تاريخ الرفع
      { wch: 15 }  // آخر تحديث
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `صور ${categoryName}`);

    // Generate file with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filename}-images-${timestamp}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting images to Excel:', error);
    return false;
  }
};

export const exportCategoriesToExcel = (data, filename) => {
  try {
    // Prepare categories data for export
    const exportData = data.map((item, index) => ({
      '#': index + 1,
      'اسم الفئة': item.name || '',
      'النوع': getTypeInArabic(item.type) || '',
      'ترتيب العرض': item.order || '',
      'الحالة': item.isActive ? 'نشط' : 'غير نشط',
      'تاريخ الإنشاء': item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SA') : '',
      'آخر تحديث': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ar-SA') : ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 5 },  // #
      { wch: 25 }, // اسم الفئة
      { wch: 15 }, // النوع
      { wch: 12 }, // ترتيب العرض
      { wch: 12 }, // الحالة
      { wch: 15 }, // تاريخ الإنشاء
      { wch: 15 }  // آخر تحديث
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الفئات');

    // Generate file with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filename}-${timestamp}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting categories to Excel:', error);
    return false;
  }
};

// Helper function to get category name
const getCategoryName = (category) => {
  if (typeof category === 'object' && category !== null) {
    return category.name; // Already populated category object
  }
  return category || 'غير محدد'; // Return category string or default
};

// Helper function to translate type to Arabic
const getTypeInArabic = (type) => {
  const typeMap = {
    'drinks': 'مشروبات',
    'foods': 'مأكولات',
    'desserts': 'حلويات',
    'hookahs': 'أراكيل'
  };
  return typeMap[type] || type;
}; 