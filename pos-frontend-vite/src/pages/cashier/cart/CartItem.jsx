import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";

const CartItem = ({item,updateCartItemQuantity,removeFromCart}) => {
  const branch = useSelector((state) => state.branch?.branch);
  const defaultTaxPercentage = branch?.taxPercentage || 18;
  
  // Determine tax display for this item
  const getTaxInfo = () => {
    if (item.taxExempt) {
      return { label: "Tax Exempt", color: "bg-blue-100 text-blue-800", percentage: "0%" };
    } else if (item.taxCategory) {
      return { 
        label: item.taxCategory.name, 
        color: "bg-purple-100 text-purple-800",
        percentage: `${item.taxCategory.percentage}%`
      };
    } else {
      return { 
        label: "Standard Tax", 
        color: "bg-gray-100 text-gray-800",
        percentage: `${defaultTaxPercentage}%`
      };
    }
  };

  const taxInfo = getTaxInfo();

  return (
      <Card key={item.id} className="border-l-4 border-l-green-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.taxExempt && (
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{item.sku}</p>
                        <Badge variant="outline" className={`text-xs ${taxInfo.color}`}>
                          {taxInfo.percentage}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.sellingPrice}</p>
                        <p className="text-sm font-bold text-green-600">
                          ${(item.sellingPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
  )
}

export default CartItem