import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  selectedCustomer: null,
  note: "",
  discount: { type: "percentage", value: 0 },
  paymentMethod: "cash",
  heldOrders: [],
  currentOrder: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        const productWithPrice = {
          ...product,
          quantity: 1,
        };
        state.items.push(productWithPrice);
      }
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          item.quantity = quantity;
        }
      }
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },

    clearCart: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "cash";
      state.currentOrder = null;
    },

    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },

    setNote: (state, action) => {
      state.note = action.payload;
    },

    setDiscount: (state, action) => {
      state.discount = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    holdOrder: (state) => {
      if (state.items.length > 0) {
        const heldOrder = {
          id: Date.now(),
          items: [...state.items],
          customer: state.selectedCustomer,
          note: state.note,
          discount: state.discount,
          timestamp: new Date(),
        };

        state.heldOrders.push(heldOrder);

        // Reset current order
        state.items = [];
        state.selectedCustomer = null;
        state.note = "";
        state.discount = { type: "percentage", value: 0 };
      }
    },

    resumeOrder: (state, action) => {
      const order = action.payload;
      state.items = order.items;
      state.selectedCustomer = order.customer;
      state.note = order.note;
      state.discount = order.discount;

      // Remove from held orders
      state.heldOrders = state.heldOrders.filter((o) => o.id !== order.id);
    },

    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },

    resetOrder: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "cash";
      state.currentOrder = null;
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.items.length;
export const selectSelectedCustomer = (state) => state.cart.selectedCustomer;
export const selectNote = (state) => state.cart.note;
export const selectDiscount = (state) => state.cart.discount;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;
export const selectHeldOrders = (state) => state.cart.heldOrders;
export const selectCurrentOrder = (state) => state.cart.currentOrder;

// Calculation selectors
export const selectSubtotal = (state) => {
  return state.cart.items.reduce(
    (total, item) => total + item.sellingPrice * item.quantity,
    0
  );
};

export const selectTax = (state) => {
  const taxBreakdown = selectTaxBreakdown(state);
  return taxBreakdown.reduce((total, item) => total + item.taxAmount, 0);
};

// New selector for detailed tax breakdown by category
export const selectTaxBreakdown = (state) => {
  const items = state.cart.items;
  const branch = state.branch?.branch;
  const defaultTaxPercentage = branch?.taxPercentage || 18;

  // Group items by tax category
  const taxGroups = {};

  items.forEach((item) => {
    let taxKey, taxName, taxPercentage, taxType;

    // Determine tax rate for this item
    if (item.taxExempt) {
      taxKey = 'exempt';
      taxName = 'Tax Exempt';
      taxPercentage = 0;
      taxType = 'EXCLUSIVE';
    } else if (item.taxCategory) {
      taxKey = `category_${item.taxCategory.id}`;
      taxName = item.taxCategory.name;
      taxPercentage = item.taxCategory.percentage;
      taxType = item.taxCategory.taxType;
    } else {
      taxKey = 'default';
      taxName = 'Standard Tax';
      taxPercentage = defaultTaxPercentage;
      taxType = 'EXCLUSIVE';
    }

    if (!taxGroups[taxKey]) {
      taxGroups[taxKey] = {
        name: taxName,
        percentage: taxPercentage,
        taxType: taxType,
        subtotal: 0,
        taxAmount: 0,
      };
    }

    const itemSubtotal = item.sellingPrice * item.quantity;
    taxGroups[taxKey].subtotal += itemSubtotal;

    // Calculate tax based on type
    if (taxType === 'INCLUSIVE') {
      // Tax is already included in price: taxAmount = price - (price / (1 + rate))
      const taxAmount = itemSubtotal - (itemSubtotal / (1 + taxPercentage / 100));
      taxGroups[taxKey].taxAmount += taxAmount;
    } else {
      // EXCLUSIVE: tax is added to price
      taxGroups[taxKey].taxAmount += itemSubtotal * (taxPercentage / 100);
    }
  });

  return Object.values(taxGroups);
};

export const selectDiscountAmount = (state) => {
  const subtotal = selectSubtotal(state);
  const discount = state.cart.discount;

  if (discount.type === "percentage") {
    return subtotal * (discount.value / 100);
  } else {
    return discount.value;
  }
};

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  const tax = selectTax(state);
  const discountAmount = selectDiscountAmount(state);
  return subtotal + tax - discountAmount;
};

export const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setSelectedCustomer,
  setNote,
  setDiscount,
  setPaymentMethod,
  holdOrder,
  resumeOrder,
  setCurrentOrder,
  resetOrder,
} = cartSlice.actions;

export default cartSlice.reducer;
