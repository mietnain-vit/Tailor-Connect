# TailorConnect - Premium Digital Tailoring Platform

A fully-featured, production-ready web application for connecting customers with skilled tailors for custom clothing orders. Built with React, TypeScript, Vite, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Authentication**: Firebase Auth integration with email/password
- **User Management**: Customer, Tailor, and Admin roles
- **Order Management**: Complete order lifecycle tracking
- **Real-time Chat**: Direct communication between customers and tailors
- **Dashboard Analytics**: Visual charts and statistics with Recharts
- **Profile Management**: Editable profiles with photo uploads
- **Tailor Directory**: Advanced search and filtering
- **Order Tracking**: Visual timeline for order status

### UI/UX Features
- **Dark/Light Mode**: Theme switching with persistence
- **Responsive Design**: Mobile-first, works on all devices
- **Animations**: Smooth transitions with Framer Motion
- **Form Validation**: React Hook Form + Yup schemas
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Skeleton screens and spinners
- **Toast Notifications**: React Hot Toast for user feedback

### Advanced Components
- Radix UI components (Dialogs, Dropdowns, Tooltips, etc.)
- Shadcn UI component library
- Image gallery with lazy loading
- Advanced filters and search
- Data tables and charts
- Infinite scroll support

## 📦 Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router DOM** - Routing

### Styling
- **Tailwind CSS** - Utility-first CSS
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Forms & Validation
- **React Hook Form** - Form handling
- **Yup** - Schema validation

### State Management
- **React Context API** - Global state
- **Zustand** - Additional state management
- **TanStack Query** - Server state

### Backend Services
- **Firebase Auth** - Authentication
- **Axios** - HTTP client

### UI Libraries
- **Radix UI** - Headless UI components
- **Recharts** - Chart library
- **React Dropzone** - File uploads
- **React Hot Toast** - Notifications

### Utilities
- **date-fns** - Date manipulation
- **lodash** - Utility functions
- **zod** - Schema validation
- **clsx & tailwind-merge** - Class utilities

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd tailorconnect
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```

3. Create `.env` file
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Run development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/        # Reusable components
│   ├── ui/           # Shadcn UI components
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── LazyImage.tsx
│   ├── ImageGallery.tsx
│   ├── SEO.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── context/          # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── LanguageContext.tsx
├── hooks/           # Custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useIntersectionObserver.ts
│   ├── useClipboard.ts
│   ├── useWindowSize.ts
│   └── useAxios.ts
├── pages/           # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── Dashboard.tsx
│   ├── OrdersPage.tsx
│   ├── NewOrderPage.tsx
│   ├── OrderTrackingPage.tsx
│   ├── TailorDirectoryPage.tsx
│   ├── ChatPage.tsx
│   ├── ProfilePage.tsx
│   ├── SettingsPage.tsx
│   ├── AdminPanelPage.tsx
│   ├── AboutPage.tsx
│   ├── ContactPage.tsx
│   ├── FAQPage.tsx
│   └── NotFoundPage.tsx
├── utils/           # Utility functions
│   ├── firebaseConfig.ts
│   ├── api.ts
│   ├── mockData.ts
│   ├── validators.ts
│   ├── format.ts
│   ├── helpers.ts
│   └── storage.ts
├── lib/             # Library configurations
│   ├── utils.ts
│   └── constants.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🔐 Authentication

The app uses Firebase Authentication. Users can:
- Sign up as Customer or Tailor
- Login with email/password
- Access protected routes based on role
- Manage profile and settings

## 🎨 Theming

- Dark and light themes
- Persistent theme selection
- Smooth theme transitions
- Custom gold gradient accents

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: mobile, tablet, desktop
- Touch-friendly interactions
- Optimized images and lazy loading

## 🚀 Deployment

Recommended: deploy with Vercel (fast, zero-config for Vite) by either connecting the GitHub repo in the Vercel dashboard or using the included GitHub Actions workflow.

Option A — Connect the repo on Vercel (recommended)
1. Push your code to GitHub (for example to the `main` branch):

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to https://vercel.com/new and import your repository.
	- When prompted set the Framework Preset to "Vite" (if detected automatically it will already be correct).
	- Build Command: `npm run build`
	- Output Directory: `dist`
	- Add any required Environment Variables (see `.env` variables above) in the Vercel Project Settings.

3. Vercel will automatically build and deploy on every push to the connected branches.

Option B — Deploy from GitHub Actions (CI)

This repo includes a workflow at `.github/workflows/vercel-deploy.yml` that will run on pushes to `main`/`master` and deploy using the Vercel CLI.

Prerequisites:
- Create a Vercel token: go to https://vercel.com/account/tokens and create a "GitHub Action" token.
- (Optional) Find `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in your Vercel project settings if you want to pin the deploy target.
- Add the token (and optional IDs) to your GitHub repository secrets as `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.

The workflow will run `npm ci`, `npm run build` and then `npx vercel --prod --token $VERCEL_TOKEN --confirm` (or include the org/project if provided).

Notes:
- If you prefer to deploy manually from your machine you can also run:

```bash
npm run build
npx vercel --prod
```

- I cannot access your Vercel or GitHub accounts from here. If you want me to finish the deployment I can provide the exact minimal steps or the exact repository secrets names to add, but you'll need to paste the Vercel token and (optionally) org/project ids into your GitHub repo secrets.


## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## 🎯 Key Features Implemented

✅ Firebase Authentication  
✅ Protected Routes  
✅ Role-based Access Control  
✅ Dashboard with Analytics  
✅ Order Management  
✅ Real-time Chat  
✅ Profile Management  
✅ Advanced Search & Filters  
✅ Image Uploads  
✅ Form Validation  
✅ Error Boundaries  
✅ Loading States  
✅ SEO Optimization  
✅ Dark/Light Mode  
✅ Responsive Design  
✅ Animations  
✅ Toast Notifications  

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Shadcn UI for component inspiration
- Radix UI for accessible primitives
- Firebase for authentication
- All open-source contributors
