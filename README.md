# Quick.ai — AI SaaS Platform

A full-stack AI SaaS application offering a suite of content creation and image editing tools, built with the PERN stack and deployed on Vercel.

🔗 **Live Demo:** [your-vercel-link-here]

---

## Features

| Feature | Plan |
|---|---|
| AI Article Writer | Free |
| Blog Title Generator | Free |
| AI Image Generation | Premium |
| Background Removal | Premium |
| Object Removal | Premium |
| Resume Reviewer | Premium |
| Cover Letter Generator | Premium |
| Community Feed | Free |

---

## Tech Stack

**Frontend**
- React.js, React Router, Tailwind CSS
- Clerk (authentication)
- Axios

**Backend**
- Node.js, Express.js
- PostgreSQL (via `postgres` npm package)
- Clerk Express SDK (auth middleware)
- Stripe (subscription payments)
- Cloudinary (image storage & transformations)
- Multer (file uploads)
- Google Gemini API (via OpenAI-compatible bridge)
- ClipDrop API (image generation)

**Deployment**
- Vercel (frontend + backend)
- Cloudinary (media)
- Neon / Supabase (PostgreSQL)

---

## Architecture

```
client/                   # React frontend
├── src/
│   ├── pages/            # Route-level components
│   ├── components/       # Shared UI components
│   └── App.jsx           # Routes

server/                   # Express backend
├── controllers/
│   └── aiController.js   # All AI feature logic
├── routes/
│   └── aiRoutes.js       # API routes
├── middlewares/
│   └── auth.js           # Clerk + plan verification
└── configs/              # DB, Cloudinary, Multer setup
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account
- Gemini API key
- ClipDrop API key
- Cloudinary account
- Stripe account

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/quickai.git
cd quickai
```

**2. Install dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

**3. Set up environment variables**

Create `.env` in the `server/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
CLIPDROP_API_KEY=your_clipdrop_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
DATABASE_URL=your_postgresql_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
```

Create `.env` in the `client/` directory:
```env
VITE_BASE_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**4. Run the app**
```bash
# Backend (from server/)
npm run server

# Frontend (from client/)
npm run dev
```

---

## Key Implementation Details

**Plan-based access control** — Every premium route passes through an `auth` middleware that extracts the user's plan from Clerk's public metadata and attaches it to `req.plan`. Controllers check this before hitting any external API.

**Gemini API integration** — Used via OpenAI-compatible bridge (`generativelanguage.googleapis.com/v1beta/openai/`), allowing standard OpenAI SDK usage with Gemini models.

**Cover Letter Generator** — Accepts job description, user skills, and tone preference. System prompt engineered to produce tailored, ATS-aware letters between 250–350 words. Premium only.

**Image processing** — Background and object removal handled via Cloudinary's generative AI transformations, avoiding the need for a separate ML service.

---

## Subscription Plans

| | Free | Premium ($16/mo) |
|---|---|---|
| Article Generation | 10/month | Unlimited |
| Blog Title Generation | 10/month | Unlimited |
| Image Generation | ❌ | ✅ |
| Background Removal | ❌ | ✅ |
| Object Removal | ❌ | ✅ |
| Resume Reviewer | ❌ | ✅ |
| Cover Letter Generator | ❌ | ✅ |

---

## Screenshots



<img width="1897" height="946" alt="Screenshot 2026-02-22 193515" src="https://github.com/user-attachments/assets/17bb4e26-a035-4dfd-b769-87d5ce3a9e27" />

<img width="1903" height="949" alt="Screenshot 2026-02-22 193523" src="https://github.com/user-attachments/assets/eb41ef03-494f-4f35-b37e-4cd9ca0f677b" />
<img width="1901" height="944" alt="Screenshot 2026-02-22 193536" src="https://github.com/user-attachments/assets/c1d495b5-70e8-4760-adc6-2952a0aa1734" />
<img width="1913" height="948" alt="Screenshot 2026-02-22 194147" src="https://github.com/user-attachments/assets/8000504b-895a-4509-adbf-78759eaaaf01" />
<img width="1904" height="942" alt="Screenshot 2026-02-22 194224" src="https://github.com/user-attachments/assets/a76045bf-7065-4bcc-883d-f20ea7bd202d" />
<img width="1910" height="955" alt="Screenshot 2026-02-22 194303" src="https://github.com/user-attachments/assets/57b682c6-f9c4-4210-9bc5-ce7eda235220" />
<img width="1901" height="954" alt="Screenshot 2026-02-22 194349" src="https://github.com/user-attachments/assets/6c09d15d-f1b6-4be1-abd7-55b149475fb2" />

## License


MIT
