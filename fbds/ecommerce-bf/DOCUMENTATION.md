# 🛒 E-Commerce Burkina Faso Platform Documentation

## 📌 Overview

A modern e-commerce platform enabling users in Burkina Faso to browse, request, and order products sourced from China. Features include email authentication, manual payment tracking (WhatsApp/WeChat/COD), admin dashboard, and real-time order notifications.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT, Email Verification (Nodemailer)
- **Notifications:** WhatsApp Business API / CallMeBot (configurable)
- **State Management:** React Context

## 🚀 Setup & Run

### 1. Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Gmail App Password (for email)
- WhatsApp Business API Token (or use free webhook for testing)

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```
