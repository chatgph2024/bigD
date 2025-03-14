import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app
let auth
let db
let storage

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    console.log("Initializing Firebase")
    app = initializeApp(firebaseConfig)
  } else {
    console.log("Firebase already initialized")
    app = getApp()
  }

  auth = getAuth(app)
  db = getDatabase(app)
  storage = getStorage(app)

  console.log("Firebase services initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase:", error)
}

export { app, auth, db, storage }

