"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductsQuery, useCategoriesQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from "@/hooks/use-catalog-queries";

export default function AdminProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProducts, setActiveProducts] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState(""); // cents
  const [sku, setSku] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [description, setDescription] = useState("");

  const { data: initialProducts = [], isLoading: productsLoading } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();

  useEffect(() => {
    if (initialProducts) {
      setActiveProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (!searchQuery) {
      setActiveProducts(initialProducts);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/products/search?q=${searchQuery}`);
        const data = await res.json();
        if (data.success) {
          setActiveProducts(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, initialProducts]);

  const handleOpenAdd = () => {
    setEditProduct(null);
    setName("");
    setSlug("");
    setCategoryId("");
    setPrice("");
    setSku("");
    setStockQty("");
    setUnit("pcs");
    setDescription("");
    setShowModal(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setCategoryId(prod.categoryId || "");
    setPrice(prod.price.toString());
    setSku(prod.sku);
    setStockQty(prod.stockQty.toString());
    setUnit(prod.unit);
    setDescription(prod.description || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      slug,
      categoryId: categoryId || null,
      price: parseFloat(price),
      sku,
      stockQty: parseInt(stockQty) || 0,
      unit,
      description: description || null,
    };

    if (editProduct) {
      updateProductMutation.mutate(
        { id: editProduct.id, payload },
        {
          onSuccess: () => {
            setShowModal(false);
          },
        }
      );
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: () => {
          setShowModal(false);
        },
      });
    }
  };

  const handleDelete = (prodId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    deleteProductMutation.mutate(prodId);
  };

  const loading = productsLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Products</h1>
          <p className="text-muted-foreground">Manage product catalogs, prices, SKUs, and stock quantities.</p>
        </div>

        <Button onClick={handleOpenAdd} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/10">
          Add Product
        </Button>
      </div>

      {/* Search Input bar */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search products by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl border-emerald-100 bg-card"
        />
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      ) : activeProducts.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-emerald-100 p-8 text-muted-foreground">
          No products listed yet. Add some to get started.
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-50 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-emerald-50 bg-emerald-50/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product details</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {activeProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground truncate">
                          {p.unit}
                        </div>
                        <div>
                          <span className="font-extrabold text-foreground block">{p.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground font-mono">{p.sku}</td>
                    <td className="px-6 py-4 font-bold text-foreground">₹{p.price.toFixed(2)}</td>
                    <td className={`px-6 py-4 font-extrabold ${p.stockQty <= 5 ? "text-destructive" : "text-foreground"}`}>
                      {p.stockQty} {p.unit}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="text-xs font-bold text-emerald-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs font-bold text-destructive hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal dialog overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-card rounded-3xl border border-emerald-50 p-6 shadow-xl space-y-6">
            <div className="border-b border-emerald-50 pb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editProduct ? "Edit Product" : "Add Product"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Apples" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Slug</label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="apples" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">No Category</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">SKU</label>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="FRT-APP-01" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Price (₹)</label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="199.50" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Stock</label>
                  <Input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="100" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Unit</label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description notes..."
                  className="w-full rounded-xl border border-emerald-100 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-emerald-50">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="rounded-xl border-emerald-100 hover:bg-emerald-50">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                  {editProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
