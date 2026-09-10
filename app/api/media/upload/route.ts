import { NextResponse } from "next/server";
import { validateMediaFile } from "@/lib/services/fileStorage/validation";

// ─────────────────────────────────────────────
// Cloudinary Free-Tier Server Upload Route (/api/media/upload)
// Handles signed server-side uploads without exposing secrets client-side.
// If CLOUDINARY credentials are missing, returns STORAGE_NOT_CONFIGURED.
// ─────────────────────────────────────────────

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "STORAGE_NOT_CONFIGURED",
        error: "Cloud media upload is not configured on this deployment.",
        messageTa: "இந்த சேவையகத்தில் கிளவுட் ஊடக பதிவேற்றம் கட்டமைக்கப்படவில்லை.",
      },
      { status: 200 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let folder = (formData.get("folder") as string) || "agroguide/public";
    // Restrict folders strictly to safe public namespaces
    if (!folder.startsWith("agroguide/public") && !folder.startsWith("agroguide/users/") && !folder.startsWith("agroguide/audio") && !folder.startsWith("agroguide/test")) {
      folder = "agroguide/public";
    }
    const mediaType = (formData.get("mediaType") as "image" | "audio") || "image";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in upload request." },
        { status: 400 }
      );
    }

    const validation = validateMediaFile(file.name, file.type, file.size, mediaType);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errorCode: validation.errorCode, error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to Buffer / base64 for Cloudinary REST upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const timestamp = Math.round(Date.now() / 1000);
    const crypto = await import("crypto");

    // Generate SHA-1 signature for Cloudinary upload
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    const uploadFormData = new FormData();
    uploadFormData.append("file", base64Data);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp.toString());
    uploadFormData.append("signature", signature);
    uploadFormData.append("folder", folder);

    const resourceType = mediaType === "audio" ? "video" : "image"; // Cloudinary uses resource_type 'video' for audio
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    const cloudData = await cloudRes.json();
    if (!cloudRes.ok || cloudData.error) {
      console.warn("Cloudinary upload error:", cloudData.error?.message);
      return NextResponse.json(
        {
          success: false,
          errorCode: "UPLOAD_FAILED",
          error: cloudData.error?.message || "Failed to upload to Cloudinary.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: cloudData.secure_url || cloudData.url,
      publicId: cloudData.public_id,
      provider: "cloudinary",
      bytes: cloudData.bytes,
      format: cloudData.format,
    });
  } catch (err: any) {
    console.error("Media upload route error:", err);
    return NextResponse.json(
      { success: false, errorCode: "UPLOAD_FAILED", error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ success: false, error: "STORAGE_NOT_CONFIGURED" }, { status: 200 });
  }

  try {
    const { publicId } = await request.json();
    if (!publicId || typeof publicId !== "string" || !publicId.startsWith("agroguide/")) {
      return NextResponse.json({ success: false, error: "Invalid publicId namespace. Deletion restricted to agroguide/ assets." }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const crypto = await import("crypto");
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json({ success: data.result === "ok" || data.result === "not found" });
  } catch (err: any) {
    console.warn("REMOTE_MEDIA_DELETE_FAILED:", err?.message);
    return NextResponse.json({ success: false, error: "REMOTE_MEDIA_DELETE_FAILED" }, { status: 200 });
  }
}
