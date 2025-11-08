import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";
import { useSelector } from "react-redux";
import {
  selectCartItems,
  selectNote,
  selectPaymentMethod,
  selectSelectedCustomer,
  selectSubtotal,
  selectTax,
  selectTotal,
  setCurrentOrder,
  setPaymentMethod,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useToast } from "../../../components/ui/use-toast";
import { useDispatch } from "react-redux";
import { createOrder } from "../../../Redux Toolkit/features/order/orderThunks";
import { redeemLoyaltyPoints } from "../../../Redux Toolkit/features/customer/customerThunks";
import { paymentMethods } from "./data";

const PaymentDialog = ({
  showPaymentDialog,
  setShowPaymentDialog,
  setShowReceiptDialog,
}) => {
  const paymentMethod = useSelector(selectPaymentMethod);
  const {toast} = useToast();
  const cart = useSelector(selectCartItems);
  const branch = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const selectedCustomer = useSelector(selectSelectedCustomer);
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const total = useSelector(selectTotal);
  const note = useSelector(selectNote);
  const taxPercentage = branch?.branch?.taxPercentage || 18;

  // Loyalty points redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Constants for point redemption
  const POINTS_TO_DOLLAR_RATIO = 20; // 100 points = $5 discount (or 20 points per $1)
  const maxRedeemablePoints = selectedCustomer?.loyaltyPoints || 0;
  const currentDiscount = Math.floor(pointsToRedeem / POINTS_TO_DOLLAR_RATIO * 100) / 100;
  const finalTotal = Math.max(0, total - currentDiscount);

  const handlePointsChange = (value) => {
    const points = parseInt(value) || 0;
    
    // Can't redeem more points than customer has
    if (points > maxRedeemablePoints) {
      toast({
        title: "Insufficient Points",
        description: `Customer only has ${maxRedeemablePoints} points available`,
        variant: "destructive",
      });
      return;
    }

    // Can't redeem more than order total
    const discount = points / POINTS_TO_DOLLAR_RATIO;
    if (discount > total) {
      const maxPoints = Math.floor(total * POINTS_TO_DOLLAR_RATIO);
      toast({
        title: "Exceeds Order Total",
        description: `Maximum ${maxPoints} points can be used for this order`,
        variant: "destructive",
      });
      setPointsToRedeem(maxPoints);
      return;
    }

    setPointsToRedeem(points);
  };

  const handleUseMaxPoints = () => {
    const maxPointsForOrder = Math.floor(total * POINTS_TO_DOLLAR_RATIO);
    const pointsToUse = Math.min(maxRedeemablePoints, maxPointsForOrder);
    setPointsToRedeem(pointsToUse);
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing payment",
        variant: "destructive",
      });
      return;
    }

    try {
      // Redeem loyalty points if customer is using them
      if (pointsToRedeem > 0 && selectedCustomer?.id) {
        try {
          await dispatch(redeemLoyaltyPoints({ 
            customerId: selectedCustomer.id, 
            points: pointsToRedeem 
          })).unwrap();
          
          toast({
            title: "Points Redeemed",
            description: `${pointsToRedeem} points redeemed for $${currentDiscount.toFixed(2)} discount`,
          });
        } catch (error) {
          toast({
            title: "Point Redemption Failed",
            description: error || "Failed to redeem points",
            variant: "destructive",
          });
          return; // Don't process order if point redemption fails
        }
      }

      // Calculate final total after discount
      const finalAmount = total - currentDiscount;

      // Prepare order data according to OrderDTO structure
      const orderData = {
        totalAmount: finalAmount,
        subtotal: subtotal, // Items subtotal before tax and discount
        tax: tax, // Tax amount (from branch tax settings)
        discount: currentDiscount, // Discount amount from loyalty points
        loyaltyPointsUsed: pointsToRedeem, // Number of points redeemed
        branchId: branch.id,
        cashierId: userProfile.id,
        customer: selectedCustomer || null,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.sellingPrice,
          total: item.sellingPrice * item.quantity,
        })),
        paymentType: paymentMethod,
        note: note || "",
      };

      console.log("Creating order:", orderData);

      // Create order
      const createdOrder = await dispatch(createOrder(orderData)).unwrap();
      dispatch(setCurrentOrder(createdOrder));

      setShowPaymentDialog(false);
      setShowReceiptDialog(true);

      toast({
        title: "Order Created Successfully",
        description: `Order #${createdOrder.id} created and payment processed`,
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: "Order Creation Failed",
        description: error || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethod = (method) => dispatch(setPaymentMethod(method));

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          {/* Order Total */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Order Total</p>
            <div className="text-3xl font-bold">
              ${total.toFixed(2)}
            </div>
          </div>

          {/* Loyalty Points Section - Only show if customer is selected */}
          {selectedCustomer && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Loyalty Points</span>
                </div>
                <Badge variant="secondary">
                  {maxRedeemablePoints} available
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Redeem Points (20 points = $1)</Label>
                <div className="flex gap-2">
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    max={maxRedeemablePoints}
                    value={pointsToRedeem}
                    onChange={(e) => handlePointsChange(e.target.value)}
                    placeholder="Enter points"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleUseMaxPoints}
                    disabled={maxRedeemablePoints === 0}
                  >
                    Use Max
                  </Button>
                </div>
                {pointsToRedeem > 0 && (
                  <p className="text-sm text-green-600">
                    Discount: -${currentDiscount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Final Amount to Pay */}
          {currentDiscount > 0 && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Amount to Pay</p>
              <div className="text-3xl font-bold text-green-600">
                ${finalTotal.toFixed(2)}
              </div>
              <p className="text-xs text-green-600 mt-1">
                Saved ${currentDiscount.toFixed(2)} with points
              </p>
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <Label className="mb-2 block">Payment Method</Label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.key}
                  variant={paymentMethod === method.key ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handlePaymentMethod(method.key)}
                >
                  {method.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex-shrink-0">
          <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
            Cancel
          </Button>
          <Button onClick={processPayment}>
            Complete Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
