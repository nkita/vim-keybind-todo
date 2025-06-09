# CLAUDE.md - AI Assistant Guide

## Project Overview

vim-keybind-todo is a keyboard-only Todo web application built with Next.js. It implements vim-style keybindings for complete keyboard navigation and follows the Todo.txt format for data standardization.

## Tech Stack

- **Framework**: Next.js 14.2.13 (React 18)
- **Authentication**: Auth0 (@auth0/nextjs-auth0)
- **UI Components**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS with animations
- **State Management**: SWR for data fetching
- **Keyboard Handling**: react-hotkeys-hook
- **Type Safety**: TypeScript 5 with strict mode
- **Date Handling**: date-fns, dayjs
- **Form Validation**: react-hook-form + zod

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
/src
├── app/          # Next.js app directory with pages
├── components/   # Reusable React components
├── hook/         # Custom React hooks
├── lib/          # Utility functions and helpers
├── provider/     # Context providers (auth, todo)
├── types/        # TypeScript type definitions
└── utils/        # Additional utilities
```

## Key Architecture Points

1. **Keyboard-First Design**: All operations are keyboard accessible using vim-style keybindings defined in `src/components/config.ts`

2. **Todo.txt Format**: Each todo follows this structure:
   ```
   [Completion mark] [Priority mark] [Completion date] [Creation Date] [Todo text] [Project tag] [Label tag] [Due date] [Todo detail text]
   ```

3. **Three Operation Modes**:
   - **Normal Mode**: Navigation, task operations (default)
   - **Edit Mode**: Modify task content and properties
   - **Command Mode**: Special operations

4. **Authentication**: Uses Auth0 for user authentication with hooks in `src/hook/`

5. **Component Organization**:
   - UI components in `src/components/ui/` (shadcn/ui based)
   - Todo-specific components in `src/components/todo-list/`
   - Modal components for various operations

## Important Configuration

- **Keybindings**: Defined in `src/components/config.ts` as a comprehensive keymap object
- **Path Aliases**: `@/*` maps to `./src/*` (configured in tsconfig.json)
- **Image Hosting**: Configured for S3 via environment variable `NEXT_PUBLIC_S3_DOMAIN`

## Development Practices

1. **Type Safety**: Strict TypeScript mode is enabled
2. **Component Structure**: Uses functional components with hooks
3. **State Management**: 
   - Local state with React hooks
   - Global state via Context providers
   - Server state with SWR
4. **Styling**: Tailwind CSS utility classes with component variants

## Key Features

- Complete keyboard navigation (vim-style)
- Task management with priorities (A-Z)
- Project and label organization
- Gantt chart view for timeline visualization
- Task history tracking
- Multi-language support (Japanese dictionary available)
- Responsive design with mobile support

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_S3_DOMAIN`: S3 domain for image storage
- Auth0 configuration variables (see Auth0 documentation)

## Testing & Quality

- ESLint for code linting
- TypeScript for type checking
- No test framework currently configured

## Notes for AI Assistants

1. When modifying keybindings, update the `keymap` object in `src/components/config.ts`
2. Follow the existing component pattern using shadcn/ui components
3. Maintain TypeScript strict mode compliance
4. Use absolute imports with the `@/` prefix
5. Keep the vim-style keyboard navigation philosophy intact
6. Respect the Todo.txt format for data consistency