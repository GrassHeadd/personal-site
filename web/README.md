# Grasshut

My personal portfolio site. Built with Next.js, Three.js, and GSAP.

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **3D**: React Three Fiber + Drei
- **Animations**: GSAP + ScrollTrigger
- **Styling**: Tailwind CSS 4
- **Contact**: EmailJS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components + 3D models
├── sections/      # Page sections (Hero, Experience, etc.)
├── constants/     # Static data
└── types/         # TypeScript types
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

## Scripts

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```
