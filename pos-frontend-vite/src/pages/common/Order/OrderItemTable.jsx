import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";

const OrderItemTable = ({ selectedOrder }) => {
  // Calculate totals
  const subtotal = selectedOrder?.subtotal || 0;
  const discount = selectedOrder?.discount || 0;
  const loyaltyPointsUsed = selectedOrder?.loyaltyPointsUsed || 0;
  const totalAmount = selectedOrder?.totalAmount || 0;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedOrder.items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="">
                <div className=" w-10 h-10">
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.productName || item.product?.name || "Product"}
                      className="w-10 h-10 object-cover rounded-md "
                    />
                  ) : null}
                  {(!item.product?.image || item.product?.image === "") && (
                    <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-medium">
                        {item.productName
                          ? item.productName.charAt(0).toUpperCase()
                          : item.product?.name
                          ? item.product.name.charAt(0).toUpperCase()
                          : "P"}
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {item.product?.name.slice(0, 20) || "Product"}...
                  </span>
                  {item.product?.sku && (
                    <span className="text-xs text-gray-500">
                      SKU: {item.product.sku.slice(0, 17)+"."}...
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right">
                ${item.product?.sellingPrice?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell className="text-right">
                $
                {(item.product?.sellingPrice * item.quantity)?.toFixed(2) ||
                  "0.00"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Payment Summary Section */}
      <div className="mt-6 pt-4 border-t">
        <div className="space-y-2 max-w-md ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-2">
                  Loyalty Points Discount:
                  {loyaltyPointsUsed > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {loyaltyPointsUsed} points
                    </Badge>
                  )}
                </span>
                <span className="font-medium text-green-600">
                  -${discount.toFixed(2)}
                </span>
              </div>
              <Separator />
            </>
          )}

          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total Amount Paid:</span>
            <span className="text-primary">${totalAmount.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              You saved ${discount.toFixed(2)} with loyalty points! 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItemTable;
