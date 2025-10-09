// lib/firebase/storage.ts
// Firebase Storage operations for file uploads

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./config";

/**
 * Upload user logo/image
 */
export const uploadUserLogo = async (
  userId: string,
  file: File
): Promise<string> => {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `logo_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `users/${userId}/logo/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading logo:", error);
    throw new Error(error.message || "Failed to upload logo");
  }
};

/**
 * Upload file with progress tracking
 */
export const uploadFileWithProgress = (
  userId: string,
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `users/${userId}/${folder}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Upload error:", error);
        reject(new Error(error.message || "Failed to upload file"));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error: any) {
          reject(new Error(error.message || "Failed to get download URL"));
        }
      }
    );
  });
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error: any) {
    console.error("Error deleting file:", error);
    throw new Error(error.message || "Failed to delete file");
  }
};

/**
 * Upload digital signature
 */
export const uploadSignature = async (
  userId: string,
  signatureBlob: Blob
): Promise<string> => {
  try {
    const fileName = `signature_${Date.now()}.png`;
    const storageRef = ref(storage, `users/${userId}/signatures/${fileName}`);

    await uploadBytes(storageRef, signatureBlob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading signature:", error);
    throw new Error(error.message || "Failed to upload signature");
  }
};
