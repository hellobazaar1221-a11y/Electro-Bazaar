import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { action, ids, data } = body ?? {};

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    if (action === "edit_fields") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No product IDs selected" }, { status: 400 });
      }

      const {
        priceChangeType,
        priceChangeValue,
        stockChangeType,
        stockChangeValue,
        categoryId,
        featured,
        brand,
        description,
        originalPriceChangeType,
        originalPriceChangeValue,
      } = data ?? {};

      let count = 0;
      for (const id of ids) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) continue;

        const updateData: any = {};

        // Price adjustment
        if (priceChangeType && priceChangeValue !== undefined) {
          const currentPrice = Number(product.price || 0);
          const value = Number(priceChangeValue);
          let newPrice = currentPrice;

          if (priceChangeType === "set") {
            newPrice = value;
          } else if (priceChangeType === "add") {
            newPrice = currentPrice + value;
          } else if (priceChangeType === "percent_add") {
            newPrice = currentPrice * (1 + value / 100);
          } else if (priceChangeType === "percent_sub") {
            newPrice = currentPrice * (1 - value / 100);
          }
          updateData.price = Math.max(0, Math.round(newPrice * 100) / 100);
        }

        // Stock adjustment
        if (stockChangeType && stockChangeValue !== undefined) {
          const currentStock = Number(product.stock || 0);
          const value = Number(stockChangeValue);
          let newStock = currentStock;

          if (stockChangeType === "set") {
            newStock = value;
          } else if (stockChangeType === "add") {
            newStock = currentStock + value;
          }
          updateData.stock = Math.max(0, Math.round(newStock));
        }

        // Category change
        if (categoryId) {
          updateData.categoryId = categoryId;
        }

        // Featured toggle
        if (featured !== undefined) {
          updateData.featured = !!featured;
        }

        // Brand change
        if (brand !== undefined && brand !== "") {
          updateData.brand = brand.trim();
        }

        // Description change
        if (description !== undefined && description !== "") {
          updateData.description = description.trim();
        }

        // Original price adjustment
        if (originalPriceChangeType) {
          if (originalPriceChangeType === "remove") {
            updateData.originalPrice = null;
          } else if (originalPriceChangeType === "set" && originalPriceChangeValue !== undefined) {
            updateData.originalPrice = Number(originalPriceChangeValue);
          }
        }

        // Always recalculate discount percentage based on final price vs final original price
        const finalPrice = updateData.price !== undefined ? updateData.price : Number(product.price || 0);
        const finalOriginalPrice = updateData.originalPrice !== undefined
          ? updateData.originalPrice
          : (originalPriceChangeType === "remove" ? null : product.originalPrice);

        if (finalOriginalPrice && finalOriginalPrice > finalPrice) {
          updateData.discount = Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100);
        } else {
          updateData.discount = 0;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.product.update({
            where: { id },
            data: updateData,
          });
          count++;
        }
      }

      return NextResponse.json({ success: true, count });
    }

    if (action === "update_stock") {
      const stockMap = data?.stockMap ?? data ?? {};
      const priceMap = data?.priceMap ?? {};
      const nameMap = data?.nameMap ?? {};
      let count = 0;

      const allIds = new Set([
        ...Object.keys(stockMap),
        ...Object.keys(priceMap),
        ...Object.keys(nameMap)
      ]);

      for (const id of allIds) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) continue;

        const updateData: any = {};
        
        if (stockMap[id] !== undefined) {
          const newStock = Number(stockMap[id]);
          if (!isNaN(newStock)) {
            updateData.stock = Math.max(0, Math.round(newStock));
          }
        }

        if (priceMap[id] !== undefined) {
          const newPrice = Number(priceMap[id]);
          if (!isNaN(newPrice)) {
            updateData.price = Math.max(0, newPrice);
          }
        }

        if (nameMap[id] !== undefined) {
          const newName = String(nameMap[id]).trim();
          if (newName && newName !== product.name) {
            updateData.name = newName;
            
            // Slugify name
            let newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const exists = await prisma.product.findFirst({
              where: {
                slug: newSlug,
                id: { not: id }
              }
            });
            if (exists) {
              newSlug = newSlug + "-" + Date.now().toString(36);
            }
            updateData.slug = newSlug;
          }
        }

        // Auto discount recalculation
        if (updateData.price !== undefined) {
          const finalPrice = updateData.price;
          const finalOriginalPrice = product.originalPrice;
          if (finalOriginalPrice && finalOriginalPrice > finalPrice) {
            updateData.discount = Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100);
          } else {
            updateData.discount = 0;
          }
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.product.update({
            where: { id },
            data: updateData,
          });
          count++;
        }
      }

      return NextResponse.json({ success: true, count });
    }

    if (action === "delete") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No product IDs selected" }, { status: 400 });
      }

      let count = 0;
      for (const id of ids) {
        await prisma.product.delete({ where: { id } });
        count++;
      }

      return NextResponse.json({ success: true, count });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("Bulk update error:", e);
    return NextResponse.json({ error: "Failed to perform bulk operation: " + e.message }, { status: 500 });
  }
}
