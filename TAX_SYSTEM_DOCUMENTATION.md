# 🧾 Tax System Documentation

## Overview
This POS system now features a comprehensive, flexible tax management system that supports multiple tax rates, tax categories, automatic tax calculation, and detailed tax reporting.

---

## 📋 Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [How Tax Works](#how-tax-works)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Configuration Guide](#configuration-guide)

---

## ✨ Features

### ✅ What's Implemented:

1. **Multiple Tax Categories**
   - Create unlimited tax categories per store
   - Each category has its own rate (e.g., 18%, 5%, 0%)
   - Support for different tax types (INCLUSIVE/EXCLUSIVE)

2. **Product-Level Tax Assignment**
   - Each product can be assigned to a specific tax category
   - Products can be marked as tax-exempt
   - Falls back to branch default if no category assigned

3. **Automatic Tax Calculation**
   - Server-side tax calculation based on products in order
   - Groups items by tax category for accurate calculation
   - Calculates tax breakdown for reporting

4. **Tax Types**
   - **EXCLUSIVE**: Tax added on top of price (default)
   - **INCLUSIVE**: Tax already included in displayed price

5. **Tax Breakdown**
   - Detailed breakdown per tax category on each order
   - Historical tracking (stores tax rate at time of order)
   - Useful for tax reporting and compliance

6. **Branch-Level Default**
   - Each branch maintains a default tax percentage
   - Used when products don't have specific tax category

---

## 🏗️ Architecture

### New Entities:

#### 1. **TaxCategory**
```
- id: Long
- name: String (e.g., "Standard Rate", "Reduced Rate")
- description: String
- percentage: Double (e.g., 18.0 for 18%)
- taxType: TaxType (INCLUSIVE/EXCLUSIVE)
- isActive: Boolean
- store: Store (relationship)
```

#### 2. **OrderTaxBreakdown**
```
- id: Long
- order: Order (relationship)
- taxCategory: TaxCategory (relationship)
- taxableAmount: Double (amount on which tax is calculated)
- taxAmount: Double (calculated tax)
- taxPercentage: Double (historical record)
- taxCategoryName: String (historical record)
```

### Updated Entities:

#### **Product** (Enhanced)
```
+ taxCategory: TaxCategory (relationship)
+ taxExempt: Boolean (default: false)
```

#### **Order** (Enhanced)
```
+ taxBreakdowns: List<OrderTaxBreakdown>
```

---

## 🗄️ Database Schema

### New Tables:

**tax_categories**
```sql
CREATE TABLE tax_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    percentage DOUBLE NOT NULL,
    tax_type VARCHAR(20) NOT NULL, -- 'INCLUSIVE' or 'EXCLUSIVE'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    store_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id)
);
```

**order_tax_breakdown**
```sql
CREATE TABLE order_tax_breakdown (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    tax_category_id BIGINT NOT NULL,
    taxable_amount DOUBLE NOT NULL,
    tax_amount DOUBLE NOT NULL,
    tax_percentage DOUBLE NOT NULL,
    tax_category_name VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (tax_category_id) REFERENCES tax_categories(id)
);
```

### Updated Tables:

**products** (Add columns)
```sql
ALTER TABLE products 
ADD COLUMN tax_category_id BIGINT,
ADD COLUMN tax_exempt BOOLEAN DEFAULT FALSE,
ADD FOREIGN KEY (tax_category_id) REFERENCES tax_categories(id);
```

---

## ⚙️ How Tax Works

### Tax Calculation Flow:

```
1. Customer adds items to cart
2. Cashier creates order
3. Backend processes order:
   a. Group items by tax category
   b. Calculate subtotal per tax category
   c. Calculate tax for each category:
      - EXCLUSIVE: tax = subtotal × (rate/100)
      - INCLUSIVE: tax = subtotal - (subtotal / (1 + rate/100))
   d. Sum all taxes for total tax
   e. Create tax breakdown records
4. Total = Subtotal + Tax - Discount
```

### Example Calculation (EXCLUSIVE Tax):

**Order Items:**
- Product A (Standard Rate 18%): $100 × 2 = $200
- Product B (Reduced Rate 5%): $50 × 1 = $50
- Product C (Tax Exempt): $30 × 1 = $30

**Tax Calculation:**
```
Standard Rate Items: $200
Tax @ 18%: $200 × 0.18 = $36.00

Reduced Rate Items: $50
Tax @ 5%: $50 × 0.05 = $2.50

Tax Exempt Items: $30
Tax: $0.00

---
Subtotal: $280.00
Total Tax: $38.50
Grand Total: $318.50
```

### Example Calculation (INCLUSIVE Tax):

**If Standard Rate (18%) is INCLUSIVE:**
- Display Price: $200
- Base Price: $200 / 1.18 = $169.49
- Tax Amount: $200 - $169.49 = $30.51

---

## 🔌 API Endpoints

### Tax Category Management

#### Create Tax Category
```http
POST /api/tax-categories
Content-Type: application/json

{
  "name": "Standard Rate",
  "description": "Standard GST rate",
  "percentage": 18.0,
  "taxType": "EXCLUSIVE",
  "isActive": true,
  "storeId": 1
}
```

#### Update Tax Category
```http
PUT /api/tax-categories/{id}
Content-Type: application/json

{
  "name": "Standard Rate",
  "percentage": 20.0,
  "taxType": "EXCLUSIVE"
}
```

#### Get Tax Categories by Store
```http
GET /api/tax-categories/store/{storeId}
```

#### Get Active Tax Categories
```http
GET /api/tax-categories/store/{storeId}/active
```

#### Initialize Default Tax Categories
```http
POST /api/tax-categories/store/{storeId}/init-defaults
```

This creates three default categories:
- **Standard Rate** (18% GST)
- **Reduced Rate** (5% GST)
- **Zero Rate** (0% - Tax Exempt)

#### Activate/Deactivate Tax Category
```http
PATCH /api/tax-categories/{id}/activate
PATCH /api/tax-categories/{id}/deactivate
```

#### Delete Tax Category
```http
DELETE /api/tax-categories/{id}
```

---

## 📝 Usage Examples

### 1. Setting Up Tax Categories for a New Store

**Step 1: Initialize Default Categories**
```bash
POST /api/tax-categories/store/1/init-defaults
```

**Step 2: Create Custom Category**
```bash
POST /api/tax-categories
{
  "name": "Luxury Tax",
  "description": "Higher tax for luxury items",
  "percentage": 28.0,
  "taxType": "EXCLUSIVE",
  "storeId": 1
}
```

### 2. Assigning Tax Category to Products

When creating/updating a product, include the tax category:

```java
Product product = Product.builder()
    .name("Premium Coffee")
    .sku("COFFEE-001")
    .sellingPrice(500.0)
    .taxCategory(standardRateTaxCategory) // Assign tax category
    .taxExempt(false)
    .build();
```

### 3. Creating Tax-Exempt Products

```java
Product product = Product.builder()
    .name("Medicine")
    .sku("MED-001")
    .sellingPrice(100.0)
    .taxExempt(true) // Mark as tax-exempt
    .build();
```

### 4. Creating an Order (Automatic Tax)

The frontend sends the order with items:

```json
POST /api/orders
{
  "items": [
    {"productId": 1, "quantity": 2},
    {"productId": 2, "quantity": 1}
  ],
  "subtotal": 280.0,
  "discount": 0.0,
  "customerId": 5,
  "paymentType": "CASH"
}
```

The backend automatically:
- Calculates tax based on product tax categories
- Creates tax breakdown records
- Returns order with tax details:

```json
{
  "id": 123,
  "subtotal": 280.0,
  "tax": 38.50,
  "discount": 0.0,
  "totalAmount": 318.50,
  "taxBreakdowns": [
    {
      "taxCategoryName": "Standard Rate",
      "taxPercentage": 18.0,
      "taxableAmount": 200.0,
      "taxAmount": 36.0
    },
    {
      "taxCategoryName": "Reduced Rate",
      "taxPercentage": 5.0,
      "taxableAmount": 50.0,
      "taxAmount": 2.5
    }
  ]
}
```

### 5. Backward Compatibility

If the frontend calculates and sends tax amount:

```json
POST /api/orders
{
  "items": [...],
  "subtotal": 280.0,
  "tax": 35.0,  // Frontend-provided tax
  "discount": 0.0
}
```

The backend will use the provided tax amount instead of auto-calculation.

---

## 🛠️ Configuration Guide

### For Store Administrators:

#### 1. **Initial Setup**
1. Create your store
2. Initialize default tax categories: `POST /api/tax-categories/store/{storeId}/init-defaults`
3. Customize categories as needed

#### 2. **Assign Tax Categories to Products**
- When adding products, select appropriate tax category
- Mark essential items (medicine, fresh produce) as tax-exempt
- Products without category use branch default rate

#### 3. **Branch Configuration**
- Each branch has a `taxPercentage` field (default: 18%)
- This is used when products don't have specific tax category
- Update via Branch API: `PUT /api/branches/{id}`

#### 4. **Regional Tax Setup**
If you have stores in different regions with different tax rates:

**Store in Region A (18% GST):**
```bash
POST /api/tax-categories
{"name": "Standard Rate", "percentage": 18.0, "storeId": 1}
```

**Store in Region B (20% VAT):**
```bash
POST /api/tax-categories
{"name": "Standard VAT", "percentage": 20.0, "storeId": 2}
```

#### 5. **Tax Type Selection**
- **Use EXCLUSIVE** if tax is added at checkout (most common)
- **Use INCLUSIVE** if prices already include tax

---

## 📊 Tax Reporting

### Get Tax Breakdown for an Order
```java
OrderDTO order = orderService.getOrderById(orderId);
List<OrderTaxBreakdownDTO> breakdowns = order.getTaxBreakdowns();

for (OrderTaxBreakdownDTO breakdown : breakdowns) {
    System.out.println(breakdown.getTaxCategoryName() + ": " + 
                       breakdown.getTaxAmount());
}
```

### Calculate Total Tax Collected (Custom Query)
You can extend the repository to add custom queries:

```java
@Query("SELECT SUM(otb.taxAmount) FROM OrderTaxBreakdown otb " +
       "WHERE otb.order.branch.id = :branchId " +
       "AND otb.order.createdAt BETWEEN :start AND :end")
Double getTotalTaxCollected(Long branchId, LocalDateTime start, LocalDateTime end);
```

---

## 🚀 Next Steps / Future Enhancements

1. **Multi-Component Taxes**: Support for state + city + district taxes
2. **Tax Holidays**: Schedule tax-free periods
3. **Customer Tax Exemptions**: Wholesale/reseller tax exemption
4. **Tax Reports**: Generate tax collection reports for compliance
5. **Location-Based Tax**: Auto-select tax based on delivery address
6. **Compound Taxes**: Tax on tax scenarios

---

## 🔍 Testing

### Test Tax Calculation
1. Create tax categories
2. Assign products to categories
3. Create an order with mixed products
4. Verify tax calculation is correct
5. Check tax breakdown in order response

### Test Tax-Exempt Products
1. Mark a product as tax-exempt
2. Add to order
3. Verify no tax is calculated for that product

---

## 📞 Support

For questions or issues with the tax system:
- Check this documentation
- Review the code in `com.zosh.service.impl.TaxServiceImpl`
- Examine tax calculation logic in `TaxCategory.calculateTax()`

---

## 📜 License & Credits

Tax System Enhancement for POS System
Developed: 2025
