# NutriScan — AI-Powered Food Label Analyzer

A production-ready full-stack web application that scans real food products using a camera or uploaded images and provides detailed nutritional and ingredient analysis. Built similar in concept to apps like Yuka, Open Food Facts, and MyFitnessPal, but with its own AI-powered analysis engine.

## Features

### Core Features
- **User Authentication** — Register, Login, Profile, Forgot Password (email/password via Supabase Auth)
- **Barcode Scanning** — Scan product barcodes with your camera and instantly look up product data from the Open Food Facts database (millions of products)
- **OCR Label Reading** — Upload a photo of a nutrition label and the app reads calories, protein, fat, sugar, sodium, fiber, and ingredients using Tesseract.js
- **AI Ingredient Analysis** — Every ingredient is classified as Safe, Consume in Moderation, or Harmful, with a plain-language explanation of why
- **Health Score (0–100)** — Computed from sugar, sodium, fiber, protein, calories, additives, artificial colors, and preservatives
- **Food Grade (A+ to F)** — A letter grade based on the health score
- **Allergy Detection** — Detects milk, egg, soy, gluten, peanut, tree nuts, shellfish, fish, sesame, and more
- **Personalized Recommendations** — Users set health goals (diabetic, weight loss, gym, kid, pregnant, heart patient, high blood pressure) and get tailored advice
- **Product Comparison** — Compare two scanned products side-by-side with the healthier option highlighted
- **Daily Food Tracker** — Tracks today's calories, sugar, protein, fat, and fiber with weekly charts
- **Water Intake Tracker** — Log daily water consumption with a progress bar toward your goal
- **Search Products** — Search by product name, brand, or category via Open Food Facts, or enter a barcode directly
- **Scan History** — Every scan is saved. Search, filter (all/favorites/healthy/unhealthy), favorite, delete, and download PDF reports
- **PDF Report** — Generate a downloadable report with product image, nutrition facts, ingredient analysis, health score, food grade, AI recommendations, and warnings
- **Admin Panel** — Platform analytics, grade distribution, top scanned brands, and a feed of all scanned products
- **Dashboard** — Total scans, healthy vs. unhealthy counts, average health score, weekly activity chart, grade distribution pie chart, and recent scans
- **AI Nutrition Chatbot** — Ask questions about the scanned product's nutrition and ingredients

### UI/UX
- Modern health-themed interface with green gradients and glassmorphism
- Dark and Light mode toggle (saved to localStorage)
- Animated cards and page transitions (Framer Motion)
- Fully responsive — works on mobile, tablet, and desktop
- Professional charts (Recharts) for nutrition trends and analytics
- Mobile bottom navigation bar and desktop sidebar

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Routing | React Router DOM |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Barcode Scanner | html5-qrcode |
| OCR | Tesseract.js |
| Barcode Database | Open Food Facts API |
| PDF Generation | jsPDF |
| Charts | Recharts |
| Icons | Lucide React |

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (free at supabase.com)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the database migrations (applied automatically via the Supabase MCP tools or Supabase Dashboard SQL editor). The migration files create three tables: `profiles`, `scans`, and `water_intake`, with row-level security enabled on all.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`).

### Admin Access
The first user to sign up automatically becomes the admin. Subsequent users are regular users. The admin panel is only visible to admin users.

## How It Works

### Barcode Scan Flow
1. User opens the camera scanner or types a barcode number
2. The app queries the Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`)
3. Product data (name, brand, nutrition, ingredients, allergens, image) is returned
4. The analysis engine classifies each ingredient, computes a health score and food grade, detects allergens, and generates personalized recommendations
5. Results are displayed on the analysis page

### OCR Scan Flow
1. User uploads a photo of a nutrition label
2. Tesseract.js extracts text from the image
3. The app parses nutrition facts (calories, protein, fat, sugar, sodium, fiber) and ingredients from the OCR text
4. The same analysis engine processes the data and displays results

### Health Score Calculation
The score starts at 100 and is adjusted based on:
- **Additives & Preservatives** (up to -25): harmful ingredients cost -7 each, moderate ones -3 each
- **Sodium** (-10 to +5): >800mg is very high, <120mg is good
- **Sugar** (-12 to +5): >20g is high, <5g is good
- **Added Sugar** (-10 to +5): >15g is high, 0g is ideal
- **Saturated Fat** (-8 to +4): >5g is high, <1g is good
- **Trans Fat** (-8): any amount is penalized
- **Fiber** (-3 to +8): >5g is excellent, <1g is penalized
- **Protein** (-2 to +6): >10g is great
- **Calories** (-5 to +3): >500 per serving is high

The final score is clamped to 0–100 and mapped to a grade:
- 95+: A+ (Excellent)
- 85–94: A (Excellent)
- 75–84: B (Good)
- 60–74: C (Average)
- 40–59: D (Poor)
- <40: F (Avoid)

## API Documentation

### Open Food Facts API (external, no key required)
- **Product lookup**: `GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- **Search**: `GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1`

### Supabase Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Links to auth.users |
| full_name | text | User's display name |
| health_goals | text[] | Selected health goals |
| allergies | text[] | Selected allergies |
| is_admin | boolean | Admin flag (server-controlled) |
| daily_calorie_goal | int | Calorie goal (default 2000) |

#### `scans`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Scan ID |
| user_id | uuid | Owner |
| barcode | text | Product barcode (nullable) |
| product_name | text | Product name |
| brand | text | Brand |
| nutrition | jsonb | Nutrition facts |
| ingredients | text[] | Ingredient list |
| allergens | text[] | Detected allergens |
| health_score | int | 0–100 |
| food_grade | text | A+ through F |
| ingredient_analysis | jsonb | Per-ingredient classification |
| recommendations | jsonb | Per-goal suitability |
| is_favorite | boolean | Favorited by user |
| scanned_at | timestamptz | Scan timestamp |

#### `water_intake`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Entry ID |
| user_id | uuid | Owner |
| amount_ml | int | Milliliters consumed |
| logged_at | timestamptz | When logged |

## Security
- Row-level security (RLS) enabled on all tables — users can only access their own data
- Authenticated-only access (no anon reads/writes on user data)
- Admin bootstrap via SECURITY DEFINER function (only grants admin if none exists)
- Password hashing handled by Supabase Auth
- JWT-based authentication with automatic session refresh

## Available Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run typecheck` — Run TypeScript type checking
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build

## License
This project is intended as a final-year major project.
