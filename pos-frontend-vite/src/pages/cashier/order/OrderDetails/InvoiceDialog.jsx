import React from "react";
import { handleDownloadOrderPDF } from "../pdf/pdfUtils";
import { useToast } from "../../../../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PrinterIcon } from "lucide-react";
import { useSelector } from "react-redux";
import OrderDetails from "./OrderDetails";
import { useDispatch } from "react-redux";
import { resetOrder } from "../../../../Redux Toolkit/features/cart/cartSlice";
import { getPaymentModeLabel } from "../data";

const InvoiceDialog = ({ showInvoiceDialog, setShowInvoiceDialog }) => {
  let { selectedOrder } = useSelector((state) => state.order);
//   selectedOrder={customer:{fullName:""},items:[{}]}
//   showInvoiceDialog=true
  
  const { toast } = useToast();
  const dispatch = useDispatch();
  const invoiceContentRef = React.useRef(null);

  const formatCurrency = React.useCallback((value) => {
    const amount = Number(value ?? 0);
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }, []);

  const buildReceiptMarkup = React.useCallback(
    (order) => {
      if (!order) {
        return "";
      }

      const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : "";

      const itemsMarkup = (order.items ?? [])
        .map((item) => {
          const name =
            item.product?.name || item.productName || "Item";
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
              <div>Order #${order.orderNumber ?? "N/A"}</div>
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
    },
    [formatCurrency]
  );
  
  const openPrintWindow = React.useCallback(
    (content, options = {}) => {
      const { title = "Invoice", minimal = false } = options;
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
            ${
              minimal
                ? content
                : `<main class="max-w-3xl mx-auto py-6 px-6">${content}</main>`
            }
          </body>
        </html>
      `);

      printWindow.document.close();

      const triggerPrint = () => {
        try {
          printWindow.focus();
          toast({
            title: "Print Dialog Opened",
            description: "Review the preview and confirm printing",
          });
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
    },
    [toast]
  );

  const handlePrint = (mode) => {
    try {
      if (!selectedOrder) {
        throw new Error("No order selected for printing");
      }

      if (mode === "receipt") {
        const receiptMarkup = buildReceiptMarkup(selectedOrder);
        openPrintWindow(receiptMarkup, {
          title: `Receipt - ${selectedOrder.orderNumber ?? "Order"}`,
          minimal: true,
        });
        return;
      }

      if (!invoiceContentRef.current) {
        throw new Error("Invoice content is not ready yet");
      }

      openPrintWindow(invoiceContentRef.current.innerHTML, {
        title: `Invoice - ${selectedOrder?.orderNumber || "Receipt"}`,
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Failed",
        description: error.message || "Failed to open print dialog. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadPDF = async () => {
    await handleDownloadOrderPDF(selectedOrder, toast);
  };

  const finishOrder = () => {
    setShowInvoiceDialog(false);
    // Reset the order
    dispatch(resetOrder());

    toast({
      title: "Order Completed",
      description: "Receipt printed and order saved successfully",
    });
  };

  return (
    <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
      {selectedOrder && (
        <DialogContent className="max-w-4xl w-[min(92vw,64rem)] p-0 overflow-hidden print:w-full print:max-w-none print:overflow-visible print:p-0">
          <div ref={invoiceContentRef} className="print:w-full print:max-w-none">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-background print:px-0 print:pt-0 print:pb-4 print:border-none print:bg-white">
              <DialogTitle className="text-lg sm:text-xl">
                Order Details - Invoice
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 py-4 max-h-[65vh] overflow-y-auto print:max-h-none print:overflow-visible print:px-8 print:py-6">
              <OrderDetails selectedOrder={selectedOrder} />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background flex flex-wrap gap-2 sm:gap-2 print:hidden">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePrint("invoice")}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePrint("receipt")}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Receipt (80mm)
            </Button>

            <Button onClick={finishOrder}>Start New Order</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default InvoiceDialog;
