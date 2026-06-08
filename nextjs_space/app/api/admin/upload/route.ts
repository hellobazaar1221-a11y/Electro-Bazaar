import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-check";

export const dynamic = "force-dynamic";

// Cloudinary credentials — works on Netlify serverless (no filesystem needed)
const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME || "ddtdwao8r";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.CLOUDINARY_UPLOAD_PRESET || "electro_bazaar_uploads";
const CLOUDINARY_API_KEY =
  process.env.CLOUDINARY_API_KEY || "158197268248366";
const CLOUDINARY_API_SECRET =
  process.env.CLOUDINARY_API_SECRET || "7ml-7Xl0KxIMIxuMKeMQxAlJNAE";

async function uploadToCloudinary(
  fileBytes: ArrayBuffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  // Detect if this is a PDF
  const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

  // Use 'auto' resource type — Cloudinary will detect image vs raw automatically
  const resourceType = "auto";

  // Build multipart form data for Cloudinary REST API
  const form = new FormData();
  const blob = new Blob([fileBytes], { type: mimeType });
  form.append("file", blob, fileName);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  form.append("api_key", CLOUDINARY_API_KEY);

  // Signed upload: add timestamp and signature
  const timestamp = Math.floor(Date.now() / 1000);
  form.append("timestamp", String(timestamp));

  const crypto = require("crypto");
  const signatureStr = `timestamp=${timestamp}&upload_preset=${CLOUDINARY_UPLOAD_PRESET}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");
  form.append("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const data = await response.json();

  // For PDFs: insert fl_attachment so browser forces a download instead of failing to render
  // Cloudinary URL: https://res.cloudinary.com/{cloud}/{type}/upload/{public_id}
  // With flag:     https://res.cloudinary.com/{cloud}/{type}/upload/fl_attachment/{public_id}
  let url: string = data.secure_url;
  if (isPdf && url && url.includes("/upload/")) {
    url = url.replace("/upload/", "/upload/fl_attachment/");
  }

  return url;
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!file || !file.name) continue;

      const bytes = await file.arrayBuffer();
      const mimeType = file.type || "image/png";

      try {
        const url = await uploadToCloudinary(bytes, file.name, mimeType);
        urls.push(url);
        console.log("☁️ File uploaded to Cloudinary:", url);
      } catch (cloudErr: any) {
        console.error("Cloudinary upload error:", cloudErr.message || cloudErr);
        throw cloudErr;
      }
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload files" },
      { status: 500 }
    );
  }
}
