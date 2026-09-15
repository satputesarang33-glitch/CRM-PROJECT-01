import { bucket } from "../config/firebase.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage Service
 * Handles uploading files to Firebase Storage bucket and returning download URLs.
 * Includes local filesystem fallback for development when Firebase Storage credentials are unset.
 */

/**
 * Upload file buffer to Firebase Storage or local uploads directory
 * @param {Express.Multer.File} file - Multer file object
 * @param {string} destinationFolder - Folder path in bucket (e.g. 'profiles', 'attachments')
 * @returns {Promise<{ fileName: string, storagePath: string, downloadUrl: string, size: number, contentType: string }>}
 */
export const uploadFile = async (file, destinationFolder = "general") => {
  const timestamp = Date.now();
  const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${sanitizedOriginalName}`;
  const storagePath = `${destinationFolder}/${fileName}`;

  try {
    // Attempt upload to Firebase Storage bucket
    const fileRef = bucket.file(storagePath);
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    // Make public or generate signed URL
    let downloadUrl;
    try {
      await fileRef.makePublic();
      downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    } catch (permErr) {
      // If bucket has uniform bucket-level access or restrictive IAM, create signed URL (valid 1 year)
      const [signedUrl] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
      });
      downloadUrl = signedUrl;
    }

    return {
      fileName: file.originalname,
      storagePath,
      downloadUrl,
      size: file.size,
      contentType: file.mimetype,
    };
  } catch (error) {
    console.warn(
      `⚠️ Firebase Storage upload failed (${error.message}). Falling back to local disk storage.`
    );

    // Fallback: save to local uploads/ directory
    const localUploadsDir = path.resolve(__dirname, "..", "uploads", destinationFolder);
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }

    const localFilePath = path.join(localUploadsDir, fileName);
    fs.writeFileSync(localFilePath, file.buffer);

    return {
      fileName: file.originalname,
      storagePath: `uploads/${destinationFolder}/${fileName}`,
      downloadUrl: `/uploads/${destinationFolder}/${fileName}`,
      size: file.size,
      contentType: file.mimetype,
    };
  }
};
