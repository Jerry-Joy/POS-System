import { getPaymentModeLabel } from "../data";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatCurrency = (value) => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return currencyFormatter.format(amount);
};

export const buildReceiptMarkup = (order) => {
  if (!order) {
    return "";
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "";

  const itemsMarkup = (order.items ?? [])
    .map((item) => {
      const name = item.product?.name || item.productName || "Item";
      const quantity = item.quantity ?? 1;
      const price = item.product?.sellingPrice ?? item.price ?? 0;
      const total = quantity * price;

      return `
        <tr>
          <td class="item">${name}</td>
          <td class="qty">${quantity}</td>
          <td class="price">${formatCurrency(price)}</td>
          <td class="total">${formatCurrency(total)}</td>
        </tr>
      `;
    })
    .join("");

  const paymentLabel = getPaymentModeLabel(order.paymentType);

  // Build tax breakdown markup
  const taxBreakdown = order.taxBreakdown || [];
  const taxBreakdownMarkup = taxBreakdown.length > 0
    ? taxBreakdown.map(item => `
        <div class="row" style="font-size: 11px; padding-left: 12px;">
          <span>• ${item.categoryName || 'Default'} (${item.taxPercentage}%)</span>
          <span>${formatCurrency(item.taxAmount)}</span>
        </div>
      `).join('')
    : '';

  return `
    <style>
      @page { size: 80mm auto; margin: 5mm; }
      * { font-family: 'Inter', system-ui, -apple-system, sans-serif; box-sizing: border-box; }
      body { width: 80mm; margin: 0 auto; background: #ffffff; color: #111827; }
      .receipt-root { width: 100%; }
      .receipt-header { text-align: center; padding-bottom: 12px; border-bottom: 1px dashed #d1d5db; }
      .receipt-header h1 { font-size: 20px; margin: 4px 0; }
      .receipt-meta { font-size: 11px; line-height: 1.5; margin-top: 8px; }
      .section { padding: 12px 0; border-bottom: 1px dashed #d1d5db; }
      .section:last-child { border-bottom: none; }
      .section-title { font-weight: 600; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.08em; }
      .info-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      thead th { text-align: left; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
      td { padding: 4px 0; }
      td.item { width: 45%; }
      td.qty { width: 15%; text-align: center; }
      td.price, td.total { width: 20%; text-align: right; }
      .totals { margin-top: 12px; font-size: 12px; }
      .totals .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
      .grand-total { font-size: 14px; font-weight: 700; margin-top: 8px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
      .footer { text-align: center; font-size: 11px; margin-top: 14px; }
    </style>
    <div class="receipt-root">
      <div class="receipt-header">
        <h1>Elira POS</h1>
        <div class="receipt-meta">
          <div>${orderDate}</div>
          <div>Order #${order.orderNumber ?? order.id ?? "N/A"}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Customer</div>
        <div class="info-row">
          <span>Name:</span>
          <span>${order.customer?.fullName ?? "Walk-in Customer"}</span>
        </div>
        <div class="info-row">
          <span>Phone:</span>
          <span>${order.customer?.phone ?? "N/A"}</span>
        </div>
        <div class="info-row">
          <span>Email:</span>
          <span>${order.customer?.email ?? "N/A"}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsMarkup}
          </tbody>
        </table>

        <div class="totals">
          <div class="row">
            <span>Subtotal</span>
            <span>${formatCurrency(order.subtotal)}</span>
          </div>
          <div class="row">
            <span>Tax</span>
            <span>${formatCurrency(order.tax)}</span>
          </div>
          ${taxBreakdownMarkup}
          ${order.discount > 0 ? `<div class="row"><span>Discount</span><span>-${formatCurrency(order.discount)}</span></div>` : ""}
          <div class="grand-total">
            <span>Total Paid</span>
            <span>${formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="info-row">
          <span>Payment Method</span>
          <span>${paymentLabel ?? ""}</span>
        </div>
        <div class="info-row">
          <span>Loyalty Points Used</span>
          <span>${order.loyaltyPointsUsed ?? 0}</span>
        </div>
      </div>

      <div class="footer">
        <div>Thank you for shopping with us!</div>
        <div>Powered by Elira POS</div>
      </div>
    </div>
  `;
};

export const openPrintWindow = ({
  title = "Invoice",
  content,
  minimal = false,
  toast,
  successDescription = "Review the preview and confirm printing",
}) => {
  if (!content) {
    throw new Error("Nothing to print");
  }

  const printWindow = window.open("", "_blank", "width=900,height=650");

  if (!printWindow) {
    throw new Error("Please allow pop-ups to print the invoice");
  }

  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  )
    .map((node) => node.outerHTML)
    .join("\n");

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${styles}
      </head>
      <body class="${minimal ? "print-receipt" : "print-invoice"}">
        ${minimal ? content : `<main class="max-w-3xl mx-auto py-6 px-6">${content}</main>`}
      </body>
    </html>
  `);

  printWindow.document.close();

  const triggerPrint = () => {
    try {
      printWindow.focus();
      if (toast) {
        toast({
          title: "Print Dialog Opened",
          description: successDescription,
        });
      }
      printWindow.print();
    } finally {
      printWindow.onafterprint = () => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      };
    }
  };

  if (printWindow.document.readyState === "complete") {
    triggerPrint();
  } else {
    printWindow.onload = triggerPrint;
  }
};
