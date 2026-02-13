# Technology Stack Selection

## 1. Overview
User: Tutor at a Cram School
Platform: Web Browser (PC/Tablet)
Data Requirement: Local storage with JSON export/import (Privacy focused)

## 2. Frontend Framework
- **Core**: React 18+
- **Build Tool**: Vite (Fast, modern)
- **Language**: TypeScript (Type safety for complex data models)

## 3. UI/UX
- **Styling**: TailwindCSS (Utility-first, rapid development)
- **Component Lib**: shadcn/ui (Radix UI based, accessible, customizable)
- **Icons**: Lucide React
- **Animations**: Framer Motion (Smooth transitions for "premium" feel)

## 4. State Management
- **Global State**: Zustand (Lightweight, easy to use)
- **Form Handling**: React Hook Form + Zod (Validation scheme)

## 5. Data Persistence
- **Local Database**: Dexie.js (Wrapper for IndexedDB)
- **File Handling**: Native File System Access API (where supported) or standard Input/Anchor download.

## 6. Utilities
- **Date Handling**: date-fns
- **Charts**: Recharts (for progress visualization)
- **PDF Generation**: @react-pdf/renderer (for reports)

## 7. AI Integration
- **Processing**: Client-side logic for "General Data" matching.
- **Future**: API calls to LLM for complex text generation (optional/stubbed for now).
