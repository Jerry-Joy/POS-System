import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Search, Filter, Calendar, Download, Plus, Edit, Trash2, CreditCard, DollarSign, User, Store, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  getStoreOverview, 
  getDailySales, 
  getSalesByPaymentMethod,
  getRecentSales
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";

export default function Sales() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useSelector((state) => state.user);
  const { 
    storeOverview, 
    dailySales, 
    salesByPaymentMethod,
    recentSales,
    loading 
  } = useSelector((state) => state.storeAnalytics);

  const [dateRange, setDateRange] = useState("7days");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const fetchSalesData = async () => {
    try {
      await Promise.all([
        dispatch(getStoreOverview(userProfile.id)).unwrap(),
        dispatch(getDailySales(userProfile.id)).unwrap(),
        dispatch(getSalesByPaymentMethod(userProfile.id)).unwrap(),
        dispatch(getRecentSales({ storeAdminId: userProfile.id, limit: 10 })).unwrap(),
      ]);
    } catch (err) {
      toast({
        title: "Error",
        description: err || "Failed to fetch sales data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchSalesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format percentage change
  const formatChange = (current, previous) => {
    if (!previous || previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  // Prepare chart data
  const dailySalesData = dailySales?.map(item => ({
    date: new Date(item.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: item.totalAmount
  })) || [];

  const paymentMethodData = salesByPaymentMethod?.map(item => ({
    name: item.paymentMethod,
    value: item.totalAmount
  })) || [];

  const salesConfig = {
    sales: {
      label: "Sales",
      color: "#10b981",
    },
  };

  const paymentConfig = {
    value: {
      label: "Amount",
      color: "#10b981",
    },
  };

  // Format payment method label
  const getPaymentLabel = (method) => {
    const labels = {
      CASH: "Cash",
      CARD: "Card",
      MOBILE_MONEY: "Mobile Money",
      BANK_TRANSFER: "Bank Transfer",
      UPI: "UPI",
      WALLET: "Wallet"
    };
    return labels[method] || method;
  };

  // Get payment status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { label: "Completed", variant: "default", className: "bg-green-100 text-green-800" },
      PENDING: { label: "Pending", variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
      CANCELLED: { label: "Cancelled", variant: "destructive", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.COMPLETED;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Filter recent sales
  const filteredSales = recentSales?.filter(sale =>
    sale.orderId?.toString().includes(searchTerm) ||
    sale.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  console.log("sales daily", dailySales)
  console.log("recent sales", recentSales)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
          <p className="text-muted-foreground mt-1">Monitor your store's sales performance and analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(storeOverview?.totalSales || 0)
                  )}
                </h3>
                <p className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales)
                  )} from last week
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Orders Today</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    storeOverview?.todayOrders || 0
                  )}
                </h3>
                <p className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.todayOrders, storeOverview?.yesterdayOrders)
                  )} from yesterday
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Cashiers</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    storeOverview?.activeCashiers || 0
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    "Same as yesterday"
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(storeOverview?.averageOrderValue || 0)
                  )}
                </h3>
                <p className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.averageOrderValue, storeOverview?.previousPeriodAverageOrderValue)
                  )} from last week
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : dailySalesData.length > 0 ? (
              <ChartContainer config={salesConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dailySalesData}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), "Sales"]}
                        />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="stroke-emerald-500"
                      activeDot={{ r: 8, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : paymentMethodData.length > 0 ? (
              <ChartContainer config={paymentConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={paymentMethodData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), "Amount"]}
                        />
                      )}
                    />
                    <Bar
                      dataKey="value"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-emerald-500"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No payment data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading orders...</p>
              </div>
            </div>
          ) : filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.orderId}>
                      <TableCell className="font-medium">
                        #{sale.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(sale.createdAt).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Walk-in Customer</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span>{sale.branchName || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {getPaymentLabel(sale.paymentType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(sale.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge('COMPLETED')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchTerm 
                  ? "No orders match your search criteria. Try adjusting your search."
                  : "There are no recent orders to display. Orders will appear here once sales are made."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    
    </div>
  );
}