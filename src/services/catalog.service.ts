import { CatalogRepository } from "@/repositories/catalog.repository";
import { z } from "zod";

const catalogRepository = new CatalogRepository();

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  isActive: z.union([z.boolean(), z.number()]).optional(),
});

export const productSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().positive(), // in ₹ (decimal)
  sku: z.string().min(1),
  stockQty: z.number().int().nonnegative().optional(),
  unit: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.union([z.boolean(), z.number()]).optional(),
});

export class CatalogService {
  // --- Category Actions ---
  async getCategories() {
    return catalogRepository.findCategories();
  }

  async getCategory(id: string) {
    const category = await catalogRepository.findCategoryById(id);
    if (!category) throw new Error("Category not found");
    return category;
  }

  async createCategory(data: any) {
    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }
    const slugExists = await catalogRepository.findCategoryBySlug(parsed.data.slug);
    if (slugExists) throw new Error("Category slug already exists");

    const categoryInput = {
      ...parsed.data,
      id: crypto.randomUUID(),
      isActive: parsed.data.isActive === false ? 0 : 1,
    };
    return catalogRepository.createCategory(categoryInput);
  }

  async updateCategory(id: string, data: any) {
    const parsed = categorySchema.partial().safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const exists = await catalogRepository.findCategoryById(id);
    if (!exists) throw new Error("Category not found");

    if (parsed.data.slug) {
      const slugExists = await catalogRepository.findCategoryBySlug(parsed.data.slug);
      if (slugExists && slugExists.id !== id) throw new Error("Category slug already exists");
    }

    const updateInput = {
      ...parsed.data,
      isActive: parsed.data.isActive === false ? 0 : parsed.data.isActive === true ? 1 : undefined,
    };
    return catalogRepository.updateCategory(id, updateInput);
  }

  async deleteCategory(id: string) {
    const exists = await catalogRepository.findCategoryById(id);
    if (!exists) throw new Error("Category not found");
    await catalogRepository.deleteCategory(id);
  }

  // --- Product Actions ---
  async getProducts(filters: { categoryId?: string; search?: string } = {}) {
    return catalogRepository.findProducts(filters);
  }

  async getProduct(id: string) {
    const product = await catalogRepository.findProductById(id);
    if (!product) throw new Error("Product not found");
    return product;
  }

  async createProduct(data: any) {
    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const slugExists = await catalogRepository.findProductBySlug(parsed.data.slug);
    if (slugExists) throw new Error("Product slug already exists");

    if (parsed.data.categoryId) {
      const categoryExists = await catalogRepository.findCategoryById(parsed.data.categoryId);
      if (!categoryExists) throw new Error("Category does not exist");
    }

    const productInput = {
      ...parsed.data,
      id: crypto.randomUUID(),
      isActive: parsed.data.isActive === false ? 0 : 1,
    };
    return catalogRepository.createProduct(productInput);
  }

  async updateProduct(id: string, data: any) {
    const parsed = productSchema.partial().safeParse(data);
    if (!parsed.success) {
      throw new Error(JSON.stringify(parsed.error.format()));
    }

    const exists = await catalogRepository.findProductById(id);
    if (!exists) throw new Error("Product not found");

    if (parsed.data.slug) {
      const slugExists = await catalogRepository.findProductBySlug(parsed.data.slug);
      if (slugExists && slugExists.id !== id) throw new Error("Product slug already exists");
    }

    if (parsed.data.categoryId) {
      const categoryExists = await catalogRepository.findCategoryById(parsed.data.categoryId);
      if (!categoryExists) throw new Error("Category does not exist");
    }

    const updateInput = {
      ...parsed.data,
      isActive: parsed.data.isActive === false ? 0 : parsed.data.isActive === true ? 1 : undefined,
    };
    return catalogRepository.updateProduct(id, updateInput);
  }

  async deleteProduct(id: string) {
    const exists = await catalogRepository.findProductById(id);
    if (!exists) throw new Error("Product not found");
    await catalogRepository.deleteProduct(id);
  }
}
