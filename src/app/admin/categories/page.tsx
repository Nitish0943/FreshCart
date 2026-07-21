"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from "@/hooks/use-catalog-queries";

export default function AdminCategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { data: categories = [], isLoading: loading } = useCategoriesQuery();

  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const handleOpenAdd = () => {
    setEditCategory(null);
    setName("");
    setSlug("");
    setShowModal(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { name, slug };

    if (editCategory) {
      updateCategoryMutation.mutate(
        { id: editCategory.id, payload },
        {
          onSuccess: () => {
            setShowModal(false);
          },
        }
      );
    } else {
      createCategoryMutation.mutate(payload, {
        onSuccess: () => {
          setShowModal(false);
        },
      });
    }
  };

  const handleDelete = (catId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    deleteCategoryMutation.mutate(catId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Categories</h1>
          <p className="text-muted-foreground">Manage inventory category types, slugs, and filtering options.</p>
        </div>

        <Button onClick={handleOpenAdd} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/10">
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      ) : categories.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-emerald-100 p-8 text-muted-foreground">
          No categories listed yet. Add some to get started.
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-50 bg-card shadow-sm overflow-hidden max-w-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-emerald-50 bg-emerald-50/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {categories.map((c: any) => (
                  <tr key={c.id} className="hover:bg-emerald-50/10">
                    <td className="px-6 py-4 font-extrabold text-foreground">{c.name}</td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground font-mono">{c.slug}</td>
                    <td className="px-6 py-4 space-x-2">
                      <button onClick={() => handleOpenEdit(c)} className="text-xs font-bold text-emerald-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs font-bold text-destructive hover:underline">
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
          <div className="w-full max-w-md bg-card rounded-3xl border border-emerald-50 p-6 shadow-xl space-y-6">
            <div className="border-b border-emerald-50 pb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editCategory ? "Edit Category" : "Add Category"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dairy & Eggs" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="dairy-eggs" required />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-emerald-50">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="rounded-xl border-emerald-100 hover:bg-emerald-50">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                  {editCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
