# 🎨 Frontend Integration Guide - Tax System

## Overview
The backend now automatically calculates taxes. Here's how to integrate it with your frontend.

---

## 🔄 Key Changes

### Before (Old Way):
```javascript
// Frontend calculated tax
const subtotal = 280;
const taxRate = 0.18;
const tax = subtotal * taxRate; // Manual calculation
const total = subtotal + tax;

// Send to backend
const order = {
  items: [...],
  subtotal: subtotal,
  tax: tax,  // Frontend calculated
  totalAmount: total
};
```

### After (New Way):
```javascript
// Frontend just sends items and subtotal
const order = {
  items: [...],
  subtotal: 280,
  discount: 0
  // No tax field needed!
};

// Backend calculates tax automatically
// Response includes calculated tax and breakdown
```

---

## 🚀 Quick Start

### 1. Initialize Tax Categories (One-time Setup)

When setting up a new store, initialize default tax categories:

```javascript
async function initializeTaxCategories(storeId) {
  const response = await fetch(
    `${API_BASE}/api/tax-categories/store/${storeId}/init-defaults`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (response.ok) {
    console.log('Default tax categories created');
  }
}
```

This creates:
- Standard Rate (18% GST)
- Reduced Rate (5% GST)
- Zero Rate (0% - Tax Exempt)

---

## 📋 API Endpoints Reference

### Get Tax Categories

```javascript
// Get all tax categories for a store
async function getTaxCategories(storeId) {
  const response = await fetch(
    `${API_BASE}/api/tax-categories/store/${storeId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return await response.json();
}

// Example response:
[
  {
    "id": 1,
    "name": "Standard Rate",
    "description": "Standard GST rate",
    "percentage": 18.0,
    "taxType": "EXCLUSIVE",
    "isActive": true,
    "storeId": 1
  },
  {
    "id": 2,
    "name": "Reduced Rate",
    "percentage": 5.0,
    "taxType": "EXCLUSIVE",
    "isActive": true,
    "storeId": 1
  }
]
```

### Create Tax Category

```javascript
async function createTaxCategory(taxCategory) {
  const response = await fetch(`${API_BASE}/api/tax-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Luxury Tax",
      description: "Higher rate for luxury items",
      percentage: 28.0,
      taxType: "EXCLUSIVE",
      isActive: true,
      storeId: 1
    })
  });
  
  return await response.json();
}
```

### Update Tax Category

```javascript
async function updateTaxCategory(id, updates) {
  const response = await fetch(`${API_BASE}/api/tax-categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  return await response.json();
}
```

---

## 🛒 Creating Orders

### Simplified Order Creation

```javascript
async function createOrder(orderData) {
  const response = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ],
      subtotal: 280.0,
      discount: 0.0,
      loyaltyPointsUsed: 0,
      customerId: 5,
      paymentType: "CASH"
      // No tax field - backend calculates it!
    })
  });
  
  const order = await response.json();
  
  // Response now includes tax breakdown
  console.log('Total Tax:', order.tax);
  console.log('Tax Breakdown:', order.taxBreakdowns);
  
  return order;
}
```

### Order Response Structure

```javascript
{
  "id": 123,
  "subtotal": 280.0,
  "tax": 38.50,           // ← Auto-calculated by backend
  "discount": 0.0,
  "totalAmount": 318.50,
  "items": [...],
  "taxBreakdowns": [      // ← New: Detailed breakdown
    {
      "id": 1,
      "taxCategoryName": "Standard Rate",
      "taxPercentage": 18.0,
      "taxableAmount": 200.0,
      "taxAmount": 36.0
    },
    {
      "id": 2,
      "taxCategoryName": "Reduced Rate",
      "taxPercentage": 5.0,
      "taxableAmount": 50.0,
      "taxAmount": 2.5
    }
  ],
  "createdAt": "2025-01-15T10:30:00",
  "paymentType": "CASH"
}
```

---

## 🎨 UI Components

### Tax Category Selector (Product Form)

```jsx
import { useState, useEffect } from 'react';

function ProductForm() {
  const [taxCategories, setTaxCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    taxCategoryId: null,
    taxExempt: false
  });

  useEffect(() => {
    // Load tax categories
    fetch(`/api/tax-categories/store/${storeId}/active`)
      .then(res => res.json())
      .then(data => setTaxCategories(data));
  }, []);

  return (
    <form>
      <input 
        type="text" 
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => setProduct({...product, name: e.target.value})}
      />
      
      <select 
        value={product.taxCategoryId}
        onChange={(e) => setProduct({...product, taxCategoryId: e.target.value})}
      >
        <option value="">Select Tax Category</option>
        {taxCategories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name} ({cat.percentage}%)
          </option>
        ))}
      </select>
      
      <label>
        <input 
          type="checkbox"
          checked={product.taxExempt}
          onChange={(e) => setProduct({...product, taxExempt: e.target.checked})}
        />
        Tax Exempt
      </label>
    </form>
  );
}
```

### Invoice Display with Tax Breakdown

```jsx
function InvoiceDisplay({ order }) {
  return (
    <div className="invoice">
      <h2>Invoice #{order.id}</h2>
      
      {/* Items */}
      <div className="items">
        {order.items.map(item => (
          <div key={item.id}>
            {item.productName} × {item.quantity} = ${item.price}
          </div>
        ))}
      </div>
      
      {/* Totals */}
      <div className="totals">
        <div>Subtotal: ${order.subtotal.toFixed(2)}</div>
        
        {/* Tax Breakdown */}
        {order.taxBreakdowns && order.taxBreakdowns.length > 0 && (
          <div className="tax-breakdown">
            <div className="label">Tax Breakdown:</div>
            {order.taxBreakdowns.map((breakdown, idx) => (
              <div key={idx} className="tax-item">
                {breakdown.taxCategoryName} ({breakdown.taxPercentage}%): 
                ${breakdown.taxAmount.toFixed(2)}
              </div>
            ))}
          </div>
        )}
        
        <div>Total Tax: ${order.tax.toFixed(2)}</div>
        
        {order.discount > 0 && (
          <div>Discount: -${order.discount.toFixed(2)}</div>
        )}
        
        <div className="grand-total">
          <strong>Grand Total: ${order.totalAmount.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
```

### Tax Category Management Page

```jsx
function TaxCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const loadCategories = async () => {
    const res = await fetch(`/api/tax-categories/store/${storeId}`);
    const data = await res.json();
    setCategories(data);
  };
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const toggleActive = async (id, isActive) => {
    const endpoint = isActive ? 'deactivate' : 'activate';
    await fetch(`/api/tax-categories/${id}/${endpoint}`, {
      method: 'PATCH'
    });
    loadCategories();
  };
  
  return (
    <div>
      <h1>Tax Categories</h1>
      <button onClick={() => setIsCreating(true)}>
        Add Tax Category
      </button>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rate</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.percentage}%</td>
              <td>{cat.taxType}</td>
              <td>
                <span className={cat.isActive ? 'active' : 'inactive'}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button onClick={() => toggleActive(cat.id, cat.isActive)}>
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📊 Real-time Tax Preview (Optional)

If you want to show tax preview before order submission:

```javascript
async function calculateTaxPreview(items) {
  // This is approximation for preview
  // Actual calculation happens on backend
  
  const products = await Promise.all(
    items.map(item => fetch(`/api/products/${item.productId}`).then(r => r.json()))
  );
  
  let estimatedTax = 0;
  
  for (let i = 0; i < items.length; i++) {
    const product = products[i];
    const item = items[i];
    const itemTotal = product.sellingPrice * item.quantity;
    
    if (!product.taxExempt) {
      // Use product's tax category rate or branch default
      const taxRate = product.taxCategory 
        ? product.taxCategory.percentage / 100 
        : 0.18; // Default 18%
      
      estimatedTax += itemTotal * taxRate;
    }
  }
  
  return estimatedTax;
}

// Usage in cart:
const [estimatedTax, setEstimatedTax] = useState(0);

useEffect(() => {
  if (cartItems.length > 0) {
    calculateTaxPreview(cartItems).then(setEstimatedTax);
  }
}, [cartItems]);
```

---

## ⚠️ Migration Notes

### Backward Compatibility

The system is backward compatible. If your frontend still sends `tax` in the order:

```javascript
{
  items: [...],
  subtotal: 280,
  tax: 35.0,  // ← Frontend calculated
  discount: 0
}
```

The backend will use your provided tax value. But it's recommended to remove tax calculation from frontend and let backend handle it.

### Gradual Migration Path

1. **Phase 1**: Initialize tax categories
2. **Phase 2**: Assign tax categories to products
3. **Phase 3**: Update frontend to remove tax calculation
4. **Phase 4**: Add tax breakdown display

---

## 🐛 Common Issues

### Issue: Tax is 0 on all orders
**Solution**: Ensure products have tax categories assigned OR branch has default tax percentage set.

### Issue: Wrong tax amount
**Solution**: Check product's tax category percentage and tax type (INCLUSIVE vs EXCLUSIVE).

### Issue: Can't create order
**Solution**: Verify all product IDs are valid and have sufficient inventory.

---

## 📞 API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tax-categories` | POST | Create tax category |
| `/api/tax-categories/{id}` | PUT | Update tax category |
| `/api/tax-categories/{id}` | GET | Get tax category |
| `/api/tax-categories/store/{storeId}` | GET | Get all categories |
| `/api/tax-categories/store/{storeId}/active` | GET | Get active only |
| `/api/tax-categories/{id}/activate` | PATCH | Activate category |
| `/api/tax-categories/{id}/deactivate` | PATCH | Deactivate category |
| `/api/tax-categories/{id}` | DELETE | Delete category |
| `/api/tax-categories/store/{storeId}/init-defaults` | POST | Initialize defaults |

---

## ✅ Testing Checklist

- [ ] Tax categories are loaded correctly
- [ ] Can create/update/delete tax categories
- [ ] Products show correct tax category
- [ ] Can mark products as tax-exempt
- [ ] Orders show correct total tax
- [ ] Tax breakdown displays on invoice
- [ ] Receipt shows itemized tax
- [ ] Reports include tax information

---

## 🎯 Benefits for Frontend

1. **Simpler Code**: No need to calculate tax manually
2. **Accuracy**: Backend ensures correct calculation
3. **Flexibility**: Support multiple tax rates easily
4. **Rich Data**: Get detailed tax breakdown for display
5. **Future-Proof**: Backend can add complex tax rules without frontend changes

---

Happy coding! 🚀
