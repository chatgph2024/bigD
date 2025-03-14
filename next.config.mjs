let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDtNedkJo6ikNneZZdrheiWbE3Dn2B8kwQ",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "ces-project-f8b4e.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://ces-project-f8b4e-default-rtdb.asia-southeast1.firebasedatabase.app",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "ces-project-f8b4e",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "ces-project-f8b4e.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "580767851656",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:580767851656:web:bdf8ae673ba6fb4acdeb3d",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-HBRZPQPWN7"
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
