import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

const env: any = (import.meta as any).env || {}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
}

// Initialize Firebase only if no apps exist
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Auth
export const auth: Auth = getAuth(app)

// Whether we're running in demo mode (no real Firebase API key provided)
export const isDemo = !env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey === 'demo-api-key' || String(firebaseConfig.apiKey).toLowerCase().includes('demo')

export default app
