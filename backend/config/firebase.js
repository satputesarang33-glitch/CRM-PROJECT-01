import dotenv from "dotenv";
dotenv.config();

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve Firebase Admin Service Account credentials from:
 * 1. FIREBASE_SERVICE_ACCOUNT environment variable (JSON string or Base64)
 * 2. Individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 3. Render Secret Files or local serviceAccountKey.json files
 */
function getServiceAccount() {
  // Option 1: Full JSON string in FIREBASE_SERVICE_ACCOUNT env var
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      if (raw.startsWith("{")) {
        return JSON.parse(raw);
      }
      // Decode Base64 if encoded
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (err) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err.message);
    }
  }

  // Option 2: Individual environment variables
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    let cleanKey = process.env.FIREBASE_PRIVATE_KEY.trim();
    if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
      cleanKey = cleanKey.slice(1, -1);
    }
    cleanKey = cleanKey.replace(/,$/, "").replace(/\\n/g, "\n");

    return {
      projectId: process.env.FIREBASE_PROJECT_ID.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim().replace(/,$/, ""),
      privateKey: cleanKey,
    };
  }

  // Option 3: Check secret file paths or local serviceAccountKey.json
  const candidatePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    "/etc/secrets/serviceAccountKey.json", // Render Secret File standard location
    "/etc/secrets/backend/serviceAccountKey.json",
    path.join(__dirname, "../serviceAccountKey.json"), // backend/serviceAccountKey.json
    path.join(__dirname, "../../serviceAccountKey.json"),
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "backend/serviceAccountKey.json"),
  ].filter(Boolean);

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      try {
        const content = fs.readFileSync(candidatePath, "utf-8");
        return JSON.parse(content);
      } catch (err) {
        console.error(`❌ Found service account at ${candidatePath}, but failed to read/parse:`, err.message);
      }
    }
  }

  return null;
}

const serviceAccount = getServiceAccount();

if (!serviceAccount) {
  console.error(
    "⚠️ Firebase Admin credentials not found! Set FIREBASE_SERVICE_ACCOUNT in Render environment variables or provide serviceAccountKey.json."
  );
}

const projectId =
  serviceAccount?.project_id ||
  serviceAccount?.projectId ||
  process.env.FIREBASE_PROJECT_ID ||
  "";

const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.firebasestorage.app` : undefined);

// Step 1: Initialize Firebase Admin App
let app;
if (getApps().length > 0) {
  app = getApps()[0];
} else if (serviceAccount) {
  app = initializeApp({
    credential: cert(serviceAccount),
    ...(storageBucket ? { storageBucket } : {}),
  });
} else {
  // Try default credentials (e.g. GCP environments)
  app = initializeApp();
}

// Step 2: Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const bucket = storageBucket ? storage.bucket(storageBucket) : storage.bucket();

console.log("✅ Firebase initialized successfully");

// Step 3: Export services for routes and controllers to use
export { app, db, auth, storage, bucket, FieldValue };
export default db;

