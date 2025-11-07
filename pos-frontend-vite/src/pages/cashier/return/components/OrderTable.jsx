import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchIcon } from "lucide-react";
import { formatDate } from "../../order/data";
import { useSelector } from "react-redux";

const OrderTable = ({ handleSelectOrder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    orders,
    loading,
    error
  } = useSelector((state) => state.order);

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id?.toString().includes(searchLower) ||
      order.customer?.fullName?.toLowerCase().includes(searchLower) ||
      order.customer?.phone?.includes(searchTerm)
    );
  });

  return (
    <div className="w-full p-4 flex flex-col">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by order ID, customer name, or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <span>Loading orders...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-destructive">
            <span>{error}</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.customer?.fullName || 'Walk-in Customer'}</TableCell>
                  <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>{order.paymentType}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleSelectOrder(order)}>
                      Select to Refund
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <SearchIcon size={48} strokeWidth={1} />
            <p className="mt-4">
              {searchTerm ? 'No orders match your search' : 'No orders found'}
            </p>
            <p className="text-sm">
              {searchTerm 
                ? 'Try adjusting your search term' 
                : 'Orders will appear here when available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTable;
