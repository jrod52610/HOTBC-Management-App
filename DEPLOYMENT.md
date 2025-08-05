# HOTBC Management App Deployment Guide

This guide explains how to deploy the HOTBC Management App using Vercel for hosting and Twilio for SMS functionality.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A Twilio account with:
   - Account SID
   - Auth Token
   - A Twilio phone number for sending SMS

## Setup Steps

### 1. Twilio Setup

1. Sign up for a Twilio account at https://www.twilio.com if you don't have one
2. Purchase a phone number from Twilio that supports SMS
3. Note down your:
   - Account SID
   - Auth Token
   - Twilio Phone Number

### 2. Vercel Environment Variables

When deploying to Vercel, you'll need to add the following environment variables:

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number (in E.164 format, e.g. +15551234567)

### 3. Deployment Process

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click "Import Project" or "Add New Project"
4. Select your repository
5. Configure the project:
   - Set the Framework Preset to "Vite"
   - Add the environment variables mentioned above
6. Click "Deploy"
7. After deployment, your app will be accessible at the provided Vercel URL

### 4. Testing the Deployment

1. Navigate to the deployed URL
2. Log in with the admin credentials
3. Try inviting a user via SMS to verify the Twilio integration is working

### 5. Domain Setup (Optional)

1. In your Vercel dashboard, go to your project settings
2. Navigate to the "Domains" section
3. Add your custom domain and follow the instructions to set up DNS

## Troubleshooting

If SMS messages are not being sent:

1. Check that your Twilio environment variables are correctly set in Vercel
2. Ensure your Twilio account is active and has sufficient funds
3. Verify the phone numbers are formatted correctly with country codes
4. Check the Vercel function logs for any error messages

## Local Development with Twilio

For local development:

1. Copy `.env.local.example` to `.env.local`
2. Add your Twilio credentials to `.env.local`
3. Run the development server with `pnpm dev`

Note: For testing SMS functionality locally, you'll need to expose your local server using a tool like ngrok, or mock the SMS sending functionality.