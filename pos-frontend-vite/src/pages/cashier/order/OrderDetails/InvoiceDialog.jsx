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

const InvoiceDialog = ({ showInvoiceDialog, setShowInvoiceDialog }) => {
  let { selectedOrder } = useSelector((state) => state.order);
//   selectedOrder={customer:{fullName:""},items:[{}]}
//   showInvoiceDialog=true
  
  const { toast } = useToast();
  const dispatch = useDispatch();
  const handlePrintInvoice = () => {
    console.log("print invoice...");
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
        <DialogContent
          className="max-w-4xl w-[min(92vw,64rem)] p-0 overflow-hidden print:max-w-full print:w-full"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-background print:border-0">
            <DialogTitle className="text-lg sm:text-xl">
              Order Details - Invoice
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 max-h-[65vh] overflow-y-auto print:max-h-none print:overflow-visible">
            <OrderDetails selectedOrder={selectedOrder} />
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background flex flex-wrap gap-2 sm:gap-2 print:hidden">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePrintInvoice(selectedOrder)}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>

            <Button onClick={finishOrder}>Start New Order</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default InvoiceDialog;
