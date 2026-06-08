import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { prisma } from "../lib/db";

async function runTest() {
  console.log("Starting database coupon test...");
  try {
    const code = "TESTCOUPON_" + Math.floor(Math.random() * 1000);
    console.log(`Attempting to create coupon with code: ${code}`);
    
    const res = await prisma.coupon.create({
      data: {
        code: "SAVE20",
        type: "PERCENT",
        value: 20,
        minOrder: 100,
        maxUses: null,
        usedCount: 0,
        expiresAt: "2026-06-15T12:00",
        assignedUserIds: [],
        isActive: true,
        description: "Get 20% off on your first order!"
      }
    });
    
    console.log("Create coupon response:", res);
    
    console.log("Attempting to read all coupons...");
    const all = await prisma.coupon.findMany();
    console.log(`Found ${all.length} coupons in database:`, all);
  } catch (err) {
    console.error("Caught error in script execution:", err);
  }
}

runTest().then(() => process.exit(0));
