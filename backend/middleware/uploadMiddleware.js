import multer from "multer";
import path from "path";

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
];

// Dangerous extensions to strictly reject
const BLOCKED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".php",
  ".js",
  ".vbs",
  ".scr",
  ".jar",
  ".py",
];

// Custom Multer file filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(
        `File type ${ext} is strictly prohibited due to security policies.`
      ),
      false
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed types include JPEG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX, CSV, and TXT.`
      ),
      false
    );
  }

  cb(null, true);
};

// Memory storage keeps file buffers ready for Firebase Storage uploads
const storage = multer.memoryStorage();

// Max file size: 10MB
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
