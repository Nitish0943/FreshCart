import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, and, like, or, sql } from "drizzle-orm";

export class CatalogRepository {
  // --- Category Methods ---
  async findCategories() {
    return db.select().from(categories).where(sql`deleted_at IS NULL`);
  }

  async findCategoryById(id: string) {
    const results = await db.select().from(categories).where(and(eq(categories.id, id), sql`deleted_at IS NULL`)).limit(1);
    return results[0] || null;
  }

  async findCategoryBySlug(slug: string) {
    const results = await db.select().from(categories).where(and(eq(categories.slug, slug), sql`deleted_at IS NULL`)).limit(1);
    return results[0] || null;
  }

  async createCategory(category: any) {
    const results = await db.insert(categories).values(category).returning();
    return results[0];
  }

  async updateCategory(id: string, category: any) {
    const results = await db
      .update(categories)
      .set({ ...category, updatedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(categories.id, id))
      .returning();
    return results[0];
  }

  async deleteCategory(id: string) {
    await db
      .update(categories)
      .set({ deletedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(categories.id, id));
  }

  // --- Product Methods ---
  async findProducts(filters: { categoryId?: string; search?: string } = {}) {
    let query = db.select().from(products).where(sql`deleted_at IS NULL`);

    if (filters.categoryId) {
      query = db
        .select()
        .from(products)
        .where(
          and(
            eq(products.categoryId, filters.categoryId),
            sql`deleted_at IS NULL`
          )
        ) as any;
    }

    if (filters.search) {
      query = db
        .select()
        .from(products)
        .where(
          and(
            or(
              like(products.name, `%${filters.search}%`),
              like(products.description, `%${filters.search}%`)
            ),
            sql`deleted_at IS NULL`
          )
        ) as any;
    }

    return query;
  }

  async findProductById(id: string) {
    const results = await db.select().from(products).where(and(eq(products.id, id), sql`deleted_at IS NULL`)).limit(1);
    return results[0] || null;
  }

  async findProductBySlug(slug: string) {
    const results = await db.select().from(products).where(and(eq(products.slug, slug), sql`deleted_at IS NULL`)).limit(1);
    return results[0] || null;
  }

  async createProduct(product: any) {
    const results = await db.insert(products).values(product).returning();
    return results[0];
  }

  async updateProduct(id: string, product: any) {
    const results = await db
      .update(products)
      .set({ ...product, updatedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(products.id, id))
      .returning();
    return results[0];
  }

  async deleteProduct(id: string) {
    await db
      .update(products)
      .set({ deletedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(products.id, id));
  }

  async updateStock(productId: string, quantityChange: number, tx: any = db) {
    return tx
      .update(products)
      .set({
        stockQty: sql`${products.stockQty} + ${quantityChange}`,
        updatedAt: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(products.id, productId))
      .returning();
  }
}
