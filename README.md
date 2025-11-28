# Gym Attendance App

A modern web application for tracking gym attendance, built with Next.js and Supabase.

## Features

- **Attendance Tracking**: Efficiently track member check-ins and check-outs.
- **QR Code Generation**: Generate QR codes for easy member identification and check-in.
- **Dashboard & Analytics**: Visualize attendance data with interactive charts using Recharts.
- **Modern UI**: Clean and responsive user interface built with Tailwind CSS and Radix UI primitives.
- **Form Handling**: Robust form validation using React Hook Form and Zod.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd v0-gym-attendance-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Copy the example environment file and configure your Supabase credentials.
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Next.js app router pages and layouts.
- `/components`: Reusable UI components.
- `/lib`: Utility functions and shared logic.
- `/public`: Static assets.
- `/styles`: Global styles.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

---

*Built with [v0](https://v0.dev)*
