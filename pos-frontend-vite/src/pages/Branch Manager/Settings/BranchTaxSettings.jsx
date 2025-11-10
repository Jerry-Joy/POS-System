import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import api from "@/utils/api";
import { Save, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BranchTaxSettings = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branchData, setBranchData] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState("");

  useEffect(() => {
    if (user?.branch?.id) {
      loadBranchData();
    }
  }, [user]);

  const loadBranchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const response = await api.get(`/api/branches/${user.branch.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranchData(response.data);
      setTaxPercentage(response.data.taxPercentage?.toString() || "18.0");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load branch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("jwt");
      
      const dto = {
        ...branchData,
        taxPercentage: parseFloat(taxPercentage),
      };

      await api.put(`/api/branches/${user.branch.id}`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Success",
        description: "Branch tax settings updated successfully",
      });
      
      loadBranchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update tax settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch Tax Settings</CardTitle>
        <CardDescription>
          Configure the default tax rate for this branch
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tax rate will be applied to products that don't have a specific tax category assigned.
            If a product has a tax category, that category's rate will be used instead.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label htmlFor="taxPercentage" className="text-sm font-medium">
            Default Tax Percentage (%)
          </label>
          <Input
            id="taxPercentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(e.target.value)}
            placeholder="18.0"
          />
          <p className="text-xs text-gray-500">
            Enter the default tax rate for this branch (e.g., 18 for 18% GST)
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold">Example Calculation:</h4>
          <div className="text-sm space-y-1">
            <p>Product Price: ₹100</p>
            <p>Tax Rate: {taxPercentage || 0}%</p>
            <p>Tax Amount: ₹{((parseFloat(taxPercentage || 0) / 100) * 100).toFixed(2)}</p>
            <p className="font-semibold border-t pt-1">
              Total Price: ₹{(100 + (parseFloat(taxPercentage || 0) / 100) * 100).toFixed(2)}
            </p>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Note:</strong> Tax categories are managed by the Store Admin. Contact your store admin
            if you need to create specific tax categories for different product types.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving || !taxPercentage}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Tax Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchTaxSettings;
