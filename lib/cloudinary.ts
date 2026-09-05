import { isCloudinaryConfigured } from "./config";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function upload(
  file: Blob | File | string,
  folder: string,
  resource: "image" | "raw" | "auto" = "auto",
) {
  if (!isCloudinaryConfigured() || !CLOUD || !PRESET) {
    throw new Error("Cloudinary is not configured.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/${resource}/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || "Cloudinary upload failed");
  }

  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
  };
}

export async function uploadImageToCloudinary(file: File, folder = "agreemind/logos") {
  return upload(file, folder, "image");
}

export async function uploadPdfToCloudinary(
  blob: Blob,
  filename: string,
  folder = "agreemind/invoices",
) {
  const file = new File([blob], filename, { type: "application/pdf" });
  return upload(file, folder, "raw");
}
