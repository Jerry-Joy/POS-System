import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentSales } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";

const RecentSales = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { recentSales, recentSalesLoading } = useSelector((state) => state.storeAnalytics);
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    const loadRecentSales = async () => {
      try {
        await dispatch(getRecentSales({ storeAdminId: userProfile.id, limit: 4 })).unwrap();
      } catch (err) {
        toast({
          title: "Error",
          description: err || "Failed to fetch recent sales",
          variant: "destructive",
        });
      }
    };

    if (userProfile?.id) {
      loadRecentSales();
    }
  }, [dispatch, toast, userProfile?.id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatPaymentType = (paymentType) => {
    if (!paymentType) return null;
    return paymentType
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (!recentSales?.length) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
          <p className="text-sm">No recent sales yet.</p>
          <p className="text-xs">Sales will appear here as soon as orders are processed.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentSales.map((sale) => (
          <div
            key={sale.orderId ?? sale.createdAt}
            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="space-y-1">
              <p className="font-medium">{sale.branchName || "Unknown Branch"}</p>
              <p className="text-sm text-muted-foreground">{formatDateTime(sale.createdAt)}</p>
              {sale.paymentType && (
                <Badge variant="outline" className="text-xs capitalize">
                  {formatPaymentType(sale.paymentType)}
                </Badge>
              )}
            </div>
            <div className="text-right space-y-1">
              <p className="font-semibold">{formatCurrency(sale.totalAmount)}</p>
              {sale.orderId && (
                <p className="text-xs text-muted-foreground">Order #{sale.orderId}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {recentSalesLoading ? renderSkeleton() : renderContent()}
      </CardContent>
    </Card>
  );
};

export default RecentSales;