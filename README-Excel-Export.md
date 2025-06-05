# Excel Export Functionality

This document describes the Excel export functionality added to the dashboard category pages.

## Overview

Excel export functionality has been added to all category management pages:
- **DrinksPage** - المشروبات
- **FoodsPage** - الأطعمة  
- **DessertsPage** - الحلويات
- **HookahPage** - الأراكيل/الأراكيل

## Features

Each page now includes three export buttons in the header:

### 1. Export Products (تصدير المنتجات)
- Exports all filtered products to Excel
- Includes: Name, Category, Price, Description, Created Date, Updated Date
- File naming: `{category}-{date}.xlsx`

### 2. Export Images (تصدير الصور)
- Exports all filtered images to Excel
- Includes: Image Name, Category, File Path, Size, Upload Date, Updated Date
- File naming: `{category}-images-{date}.xlsx`

### 3. Export Categories (تصدير الفئات)
- Exports all categories to Excel
- Includes: Category Name, Type, Display Order, Status, Created Date, Updated Date
- File naming: `{category}-categories-{date}.xlsx`

## Implementation Details

### Files Added/Modified:

1. **`src/utils/excelExport.js`** - New utility file containing:
   - `exportToExcel()` - Main products export function
   - `exportImagesToExcel()` - Images export function  
   - `exportCategoriesToExcel()` - Categories export function
   - Helper functions for data formatting

2. **Category Pages Updated:**
   - `src/Components/Pages/DrinksPage.jsx`
   - `src/Components/Pages/FoodsPage.jsx`
   - `src/Components/Pages/DessertsPage.jsx`
   - `src/Components/Pages/HookahPage.jsx`

### Dependencies:
- **xlsx** library installed for Excel file generation

## Usage

1. Navigate to any category page (Drinks, Foods, Desserts, Hookah)
2. Use filters to narrow down data if needed
3. Click the appropriate export button:
   - Excel file will be automatically downloaded
   - Success/error toast notifications will appear
   - Files include Arabic headers and proper formatting

## Features:

- ✅ **Responsive Design** - Export buttons integrate seamlessly with existing UI
- ✅ **Arabic Support** - All headers and content in Arabic
- ✅ **Date Formatting** - Proper Arabic date formatting
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Filter Integration** - Exports respect current page filters
- ✅ **Toast Notifications** - Success/failure feedback
- ✅ **Consistent Styling** - Matches dashboard design language

## Technical Notes:

- All exports respect the current page filters (category selection, search terms)
- Files are named with timestamps to avoid conflicts
- Column widths are optimized for Arabic content
- Error handling includes try-catch blocks with user feedback
- Modular design allows easy maintenance and updates 