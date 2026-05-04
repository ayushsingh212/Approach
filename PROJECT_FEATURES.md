# Project Approach: B2B Lead Gen & Outreach Platform

## 🌟 Overview
**Approach** is a high-performance lead generation and bulk email platform designed to automate the transition from discovering a company on LinkedIn to sending a professional cold outreach email. It consists of two primary parts: a **Next.js 14 Dashboard** and a **Custom Chrome Extension**.

---
git add 
## 🛠 Feature Breakdown & Tech Stack

### 1. Autonomous Lead Discovery (Chrome Extension)
*   **Feature:** A background "Lead Gen Agent" that automates the entire scouting process. It runs every 12 hours or on-demand.
*   **The Pipeline:** 
    1.  **LinkedIn Scraper:** Automatically searches LinkedIn Jobs for specific queries (e.g., "Full Stack Developer Intern") and extracts company names.
    2.  **Google Intelligence:** Navigates to Google to find official company websites based on extracted names.
    3.  **Strict Web Crawler:** Visits the company website and performs a regex-based deep crawl to find valid contact/HR emails.
*   **Tech Used:** TypeScript, Manifest V3, Chrome Scripting API, Chrome Alarms, Fetch API (CORS-enabled).

### 2. Scalable Bulk Mailer with "Attachment Links"
*   **Feature:** A professional outreach tool that allows users to send emails to hundreds of companies simultaneously.
*   **Innovation:** Instead of attaching heavy files (which triggers spam filters), the system uploads PDFs to **Supabase Storage** and generates secure, signed download links that are embedded into a premium HTML email template.
*   **Tech Used:** Nodemailer (Gmail SMTP), Supabase Storage, React-Quill (Rich Text Editor).

### 3. AI-Powered Data Importer
*   **Feature:** Allows admins to paste raw, unstructured text (like a list of companies from a blog or LinkedIn post) and have it converted into structured database records automatically.
*   **Tech Used:** OpenRouter API (Gemini/GPT models), Zod (Schema Validation).

### 4. Admin & Security Infrastructure
*   **Feature:** A protected dashboard with tiered access (Admin vs User), rate limiting to prevent abuse, and sensitive credential encryption.
*   **Tech Used:** NextAuth.js (JWT Strategy), Mongoose (MongoDB), AES-256-CBC Encryption (for Google App Passwords), Custom Next.js Middleware.

---

## 💡 Resume-Ready Technical Points (Copy/Paste these)

*   **Engineered a multi-stage autonomous lead generation pipeline** using a Chrome Extension (Manifest V3) that reduced lead discovery time by 90% by automating LinkedIn scraping and website contact extraction.
*   **Implemented a high-deliverability bulk email system** utilizing Nodemailer and Supabase Object Storage, bypassing traditional attachment limits via dynamic signed-URL generation.
*   **Developed a robust full-stack dashboard** with Next.js 14 and MongoDB, featuring secure JWT-based authentication and custom middleware for role-based access control (RBAC).
*   **Integrated LLM-based data processing** via OpenRouter to automate the transformation of unstructured lead data into validated JSON company schemas.
*   **Optimized serverless performance** on Vercel by leveraging `serverExternalPackages` and custom Webpack configurations to handle heavy Node.js modules like Mongoose and Nodemailer.
