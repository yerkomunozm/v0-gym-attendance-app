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
   cd gym-attendance-app
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

## Testing

This project uses [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/react) for unit testing.

### Running Tests

Run all tests:
```bash
npm test
# or
pnpm test
```

Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test:watch
# or
pnpm test:watch
```

Generate coverage report:
```bash
npm run test:coverage
# or
pnpm test:coverage
```

### Test Structure

- `__tests__/lib/`: Tests for utility functions
- `__tests__/components/`: Tests for React components
- `__tests__/mocks/`: Mock data and utilities
  - `fixtures.ts`: Mock data for entities (trainers, students, etc.)
  - `supabase.ts`: Mock Supabase client for testing

### Writing Tests

When adding new tests:

1. Create test files with the `.test.ts` or `.test.tsx` extension
2. Place them in the `__tests__` directory matching the source structure
3. Use the mock fixtures from `__tests__/mocks/fixtures.ts`
4. Mock Supabase calls using `__tests__/mocks/supabase.ts`

Example test structure:
```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Deployment

This project is deployed on [AWS Amplify](https://aws.amazon.com/amplify/).


