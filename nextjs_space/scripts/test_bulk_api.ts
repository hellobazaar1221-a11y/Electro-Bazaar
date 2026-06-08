import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { prisma } from "../lib/db";

async function runTest() {
  console.log("Starting bulk API test...");
  try {
    // 1. Get first 2 products
    const products = await prisma.product.findMany({ take: 2 });
    if (products.length === 0) {
      console.log("No products found in DB. Seed first.");
      return;
    }
    const ids = products.map((p: any) => p.id);
    console.log("Selected product IDs for bulk test:", ids);

    // 2. Perform bulk update data mock
    const data = {
      priceChangeType: "add",
      priceChangeValue: 10, // Increase price by ₹10
      brand: "BulkTestBrand",
      description: "BulkTestDescription",
      originalPriceChangeType: "set",
      originalPriceChangeValue: 9999
    };

    console.log("Simulating bulk edit patch logic...");
    let count = 0;
    for (const id of ids) {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) continue;

      const updateData: any = {};

      // Price adjustment
      if (data.priceChangeType && data.priceChangeValue !== undefined) {
        const currentPrice = Number(product.price || 0);
        const value = Number(data.priceChangeValue);
        let newPrice = currentPrice;

        if (data.priceChangeType === "set") {
          newPrice = value;
        } else if (data.priceChangeType === "add") {
          newPrice = currentPrice + value;
        }
        updateData.price = Math.max(0, Math.round(newPrice * 100) / 100);
      }

      // Brand change
      if (data.brand !== undefined && data.brand !== "") {
        updateData.brand = data.brand.trim();
      }

      // Description change
      if (data.description !== undefined && data.description !== "") {
        updateData.description = data.description.trim();
      }

      // Original price adjustment
      if (data.originalPriceChangeType) {
        if (data.originalPriceChangeType === "remove") {
          updateData.originalPrice = null;
          updateData.discount = 0;
        } else if (data.originalPriceChangeType === "set" && data.originalPriceChangeValue !== undefined) {
          const val = Number(data.originalPriceChangeValue);
          updateData.originalPrice = val;
          const finalPrice = updateData.price !== undefined ? updateData.price : Number(product.price || 0);
          if (val > finalPrice) {
            updateData.discount = Math.round(((val - finalPrice) / val) * 100);
          } else {
            updateData.discount = 0;
          }
        }
      }

      console.log(`Updating product ${id} with:`, updateData);
      const res = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      console.log(`Updated product ${id} success! Result:`, res);
      count++;
    }

    console.log(`\nSuccessfully updated ${count} products.`);
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

runTest().then(() => process.exit(0));
