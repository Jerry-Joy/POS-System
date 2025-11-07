
import OrderInformation from "./OrderInformation";
import CustomerInformation from "./CustomerInformation";
import OrderItemTable from "../../../common/Order/OrderItemTable";
import { Card, CardContent } from "../../../../components/ui/card";

const OrderDetails = ({ selectedOrder }) => {
  return (
    <div className="print:bg-white space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OrderInformation selectedOrder={selectedOrder} />
        <CustomerInformation selectedOrder={selectedOrder} />
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Order Items</h3>
          <OrderItemTable selectedOrder={selectedOrder} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
