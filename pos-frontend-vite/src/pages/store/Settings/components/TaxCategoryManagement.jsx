import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import api from "@/utils/api";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TaxCategoryManagement = () => {
  const { store } = useSelector((state) => state.store);
  const [taxCategories, setTaxCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: "",
    taxType: "EXCLUSIVE",
    isActive: true,
  });

  useEffect(() => {
    if (store?.id) {
      loadTaxCategories();
    }
  }, [store]);

  const loadTaxCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const response = await api.get(`/api/tax-categories/store/${store.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaxCategories(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tax categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      await api.post(
        `/api/tax-categories/store/${store.id}/init-defaults`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Success",
        description: "Default tax categories created successfully",
      });
      loadTaxCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to initialize defaults",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const dto = {
        ...formData,
        percentage: parseFloat(formData.percentage),
        storeId: store.id,
      };

      if (isEditing && formData.id) {
        await api.put(`/api/tax-categories/${formData.id}`, dto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: "Success",
          description: "Tax category updated successfully",
        });
      } else {
        await api.post("/api/tax-categories", dto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: "Success",
          description: "Tax category created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadTaxCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save tax category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || "",
      percentage: category.percentage.toString(),
      taxType: category.taxType,
      isActive: category.isActive,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      await api.delete(`/api/tax-categories/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Success",
        description: "Tax category deleted successfully",
      });
      loadTaxCategories();
      setDeleteId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tax category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const endpoint = currentStatus ? "deactivate" : "activate";
      await api.patch(`/api/tax-categories/${id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Success",
        description: `Tax category ${currentStatus ? "deactivated" : "activated"} successfully`,
      });
      loadTaxCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tax category status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      percentage: "",
      taxType: "EXCLUSIVE",
      isActive: true,
    });
    setIsEditing(false);
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tax Categories</h2>
          <p className="text-sm text-gray-500">
            Manage tax rates for your products
          </p>
        </div>
        <div className="flex gap-2">
          {taxCategories.length === 0 && (
            <Button
              onClick={initializeDefaults}
              disabled={loading}
              variant="outline"
            >
              Initialize Defaults
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Tax Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Tax Category" : "Add Tax Category"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Standard Rate, Reduced Rate"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Description of this tax category"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tax Percentage (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, percentage: e.target.value })
                      }
                      placeholder="18.0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tax Type</label>
                    <Select
                      value={formData.taxType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, taxType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXCLUSIVE">
                          Exclusive (Added to price)
                        </SelectItem>
                        <SelectItem value="INCLUSIVE">
                          Inclusive (Included in price)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? "Saving..." : isEditing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && taxCategories.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
      ) : taxCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No tax categories found</p>
          <Button onClick={initializeDefaults} variant="outline">
            Initialize Default Categories
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {category.percentage}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.taxType === "EXCLUSIVE" ? "Exclusive" : "Inclusive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleActive(category.id, category.isActive)}
                      >
                        {category.isActive ? (
                          <PowerOff className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Power className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this tax category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaxCategoryManagement;
