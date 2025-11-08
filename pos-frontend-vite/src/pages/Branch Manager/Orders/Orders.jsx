import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";

import { RefreshCw } from "lucide-react";
import {
  getOrdersByBranch,
  getOrderById,
} from "@/Redux Toolkit/features/order/orderThunks";
import { findBranchEmployees } from "@/Redux Toolkit/features/employee/employeeThunks";
import { getPaymentIcon } from "../../../utils/getPaymentIcon";

import { getStatusColor } from "../../../utils/getStatusColor";
import OrdersFilters from "./OrdersFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailsDialog from "./OrderDetailsDialog";
import OrderDetails from "@/pages/cashier/order/OrderDetails/OrderDetails";
import { openPrintWindow } from "@/pages/cashier/order/utils/printHelpers";
import { useToast } from "@/components/ui/use-toast";

const Orders = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { orders, loading } = useSelector((state) => state.order);
  const { selectedOrder } = useSelector((state) => state.order);


  const [showDetails, setShowDetails] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const printContainerRef = useRef(null);

  // Fetch branch employees (cashiers)
  useEffect(() => {
    if (branchId) {
      dispatch(findBranchEmployees({ branchId, role: "ROLE_BRANCH_CASHIER" }));
    }
  }, [branchId, dispatch]);

  // Fetch orders when filters change
  useEffect(() => {
    if (branchId) {
      const data = {
        branchId,
      };
      console.log("filters data ", data);
      dispatch(getOrdersByBranch(data));
    }
  }, [branchId, dispatch]);

  const handleViewDetails = (orderId) => {
    dispatch(getOrderById(orderId));
    setShowDetails(true);
  };

  const handlePrintInvoice = async (orderId) => {
    try {
      const order = await dispatch(getOrderById(orderId)).unwrap();
      setOrderToPrint(order);
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Failed",
        description: error.message || "Unable to load order for printing.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!orderToPrint || !printContainerRef.current) {
      return;
    }

    const html = printContainerRef.current.innerHTML;

    if (!html || !html.trim()) {
      setOrderToPrint(null);
      return;
    }

    try {
      openPrintWindow({
        title: `Invoice - ${
          orderToPrint.orderNumber ?? orderToPrint.id ?? "Order"
        }`,
        content: html,
        toast,
        successDescription: `Invoice for order #${
          orderToPrint.id ?? ""
        } is ready to print`,
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Failed",
        description: error.message || "Failed to open print dialog.",
        variant: "destructive",
      });
    } finally {
      setOrderToPrint(null);
    }
  }, [orderToPrint, toast]);

  const handleRefresh = () => {
    if (branchId) {
      const data = {
        branchId,
      };
      console.log("filter data ", data);
      dispatch(getOrdersByBranch(data));
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden print container for generating invoice markup */}
      <div className="hidden" aria-hidden="true">
        <div ref={printContainerRef} className="max-w-4xl w-full">
          <div className="px-6 pt-6 pb-4 border-b bg-background">
            <h2 className="text-lg font-semibold">Order Details - Invoice</h2>
          </div>
          <div className="px-6 py-4">
            {orderToPrint && <OrderDetails selectedOrder={orderToPrint} />}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <OrdersFilters />

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        loading={loading}
        onViewDetails={handleViewDetails}
        onPrintInvoice={handlePrintInvoice}
        getStatusColor={getStatusColor}
        getPaymentIcon={getPaymentIcon}
      />

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={showDetails && !!selectedOrder}
        onOpenChange={setShowDetails}
        selectedOrder={selectedOrder}
        getStatusColor={getStatusColor}
        getPaymentIcon={getPaymentIcon}
      />
    </div>
  );
};

export default Orders;
