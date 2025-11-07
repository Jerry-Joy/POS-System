 export const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'mobile_money':
      case 'mobile money':
        return 'Mobile Money';
      default:
        return method;
    }
  };