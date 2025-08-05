# HOTBC Management App

## Technology Stack

This project is built with:

- Next.js
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Twilio API for SMS functionality

All shadcn/ui components have been downloaded under `@/components/ui`.

## Key Features

- User management with permission-based access control
- SMS invitation system with temporary passwords
- Event scheduling and management
- Maintenance and cleaning task tracking
- Mobile-first responsive design

## File Structure

- `src/components/ui/` - shadcn-ui components
- `src/components/layout/` - Layout components
- `src/context/` - Application state and context providers
- `src/lib/` - Utility functions and services
- `src/pages/` - Application routes and API endpoints
- `src/types/` - TypeScript type definitions

## Development

**Install Dependencies**

```shell
pnpm i
```

**Start Development Server**

```shell
pnpm run dev
```

**Build for Production**

```shell
pnpm run build
```

## Twilio SMS Integration

This application uses Twilio for sending SMS invitations. To set up Twilio:

1. Create a Twilio account at https://www.twilio.com
2. Obtain your Account SID, Auth Token, and a Twilio phone number
3. Copy the `.env.local.example` file to `.env.local` and fill in your Twilio credentials
4. Make sure the environment variables are also set in your Vercel deployment

## Deploying to Vercel

### Preparation

1. Create a Vercel account at https://vercel.com
2. Install the Vercel CLI: `npm i -g vercel`
3. Make sure you have set up the Twilio environment variables

### Deploy Command

```shell
vercel
```

### Environment Variables

Set the following environment variables in your Vercel project settings:

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number in E.164 format (e.g., +1234567890)

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to the "Domains" section
3. Add your custom domain and follow the DNS configuration instructions
