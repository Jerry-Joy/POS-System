import React from "react";
import { Separator } from "../../../components/ui/separator";
import { useSelector } from "react-redux";
import {
  selectDiscountAmount,
  selectSubtotal,
  selectTax,
  selectTotal,
  selectTaxBreakdown,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

const CartSummary = () => {
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const discountAmount = useSelector(selectDiscountAmount);
  const total = useSelector(selectTotal);
  const taxBreakdown = useSelector(selectTaxBreakdown);

  return (
    <div className="border-t bg-muted p-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {/* Tax Breakdown */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span>Tax:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold mb-1">Tax Breakdown:</p>
                      {taxBreakdown.map((item, index) => (
                        <div key={index} className="flex justify-between gap-4">
                          <span className="text-left">
                            {item.name} ({item.percentage}%):
                          </span>
                          <span className="font-mono">
                            ${item.taxAmount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span>${tax.toFixed(2)}</span>
          </div>
          
          {/* Show breakdown if multiple tax rates */}
          {taxBreakdown.length > 1 && (
            <div className="pl-4 space-y-0.5 text-xs text-muted-foreground">
              {taxBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>• {item.name} ({item.percentage}%):</span>
                  <span>${item.taxAmount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <span>Discount:</span>
          <span className="text-red-600">- ${discountAmount.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span className="text-green-600">${total?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
