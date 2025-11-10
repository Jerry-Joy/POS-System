import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { useSelector } from "react-redux";
import {
  resetOrder,
  selectPaymentMethod,
  selectTotal,
  selectSubtotal,
  selectTax,
  selectTaxBreakdown,
  selectDiscountAmount,
  selectCurrentOrder,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useDispatch } from "react-redux";
import { useToast } from "../../../components/ui/use-toast";
import { Separator } from "../../../components/ui/separator";

const ReceiptDialog = ({ showReceiptDialog, setShowReceiptDialog }) => {
  const paymentMethod = useSelector(selectPaymentMethod);
  const total = useSelector(selectTotal);
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const taxBreakdown = useSelector(selectTaxBreakdown);
  const discountAmount = useSelector(selectDiscountAmount);
  const currentOrder = useSelector(selectCurrentOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const finishOrder = () => {
    setShowReceiptDialog(false);
    // Reset the order
    dispatch(resetOrder());

    toast({
      title: "Order Completed",
      description: "Receipt printed and order saved successfully",
    });
  };

  return (
    <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <Receipt className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold">Payment Successful!</h3>
            <p className="text-sm text-gray-600">
              {currentOrder?.id ? `Order #${currentOrder.id}` : 'Receipt has been printed'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {/* Tax Breakdown */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {taxBreakdown.length > 0 && (
                  <div className="pl-4 space-y-1 text-xs text-muted-foreground">
                    {taxBreakdown.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>• {item.name} ({item.percentage}%):</span>
                        <span>${item.taxAmount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold text-base">
                <span>Total:</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold capitalize">
                  {paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={finishOrder} className="w-full">
            Start New Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
