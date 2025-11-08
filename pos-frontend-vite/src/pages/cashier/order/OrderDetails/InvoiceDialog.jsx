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
import { buildReceiptMarkup, openPrintWindow } from "../utils/printHelpers";

const InvoiceDialog = ({ showInvoiceDialog, setShowInvoiceDialog }) => {
  let { selectedOrder } = useSelector((state) => state.order);
//   selectedOrder={customer:{fullName:""},items:[{}]}
//   showInvoiceDialog=true
  
  const { toast } = useToast();
  const dispatch = useDispatch();
  const invoiceContentRef = React.useRef(null);

  const handlePrint = (mode) => {
    try {
      if (!selectedOrder) {
        throw new Error("No order selected for printing");
      }

      if (mode === "receipt") {
        const receiptMarkup = buildReceiptMarkup(selectedOrder);
        openPrintWindow({
          title: `Receipt - ${selectedOrder.orderNumber ?? "Order"}`,
          content: receiptMarkup,
          minimal: true,
          toast,
        });
        return;
      }

      if (!invoiceContentRef.current) {
        throw new Error("Invoice content is not ready yet");
      }

      openPrintWindow({
        title: `Invoice - ${selectedOrder?.orderNumber || "Receipt"}`,
        content: invoiceContentRef.current.innerHTML,
        toast,
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

          <DialogFooter className="px-6 py-4 border-t bg-background print:hidden flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              className="h-10 px-3 text-sm"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              className="h-10 px-3 text-sm"
              onClick={() => handlePrint("invoice")}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            <Button
              variant="outline"
              className="h-10 px-3 text-sm"
              onClick={() => handlePrint("receipt")}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Receipt (80mm)
            </Button>
            <Button className="h-10 px-4 text-sm" onClick={finishOrder}>
              Start New Order
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default InvoiceDialog;
