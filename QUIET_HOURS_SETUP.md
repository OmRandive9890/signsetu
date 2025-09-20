# Quiet Hours Scheduler - Setup Guide

A modern study session scheduler with Supabase authentication and MongoDB storage that sends email reminders 10 minutes before each session.

## Features

✅ **Supabase Authentication** - Secure user login/signup  
✅ **MongoDB Storage** - Persistent data storage for quiet hours  
✅ **Overlap Prevention** - No scheduling conflicts for users  
✅ **Email Notifications** - 10-minute advance reminders  
✅ **Modern UI** - Clean, minimal interface  
✅ **CRON System** - Automated email scheduling  

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quiet-hours
# For production, use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiet-hours

# Email Configuration (optional - for actual email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/quiet-hours` in your `.env.local`

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI`

### 3. Supabase Setup

1. Create a project at [Supabase](https://supabase.com)
2. Go to Settings > API to get your URL and keys
3. Update your `.env.local` with the Supabase credentials

### 4. Start the Application

```bash
npm install
npm run dev
```

### 5. Initialize CRON Job

The CRON job needs to be started to send email notifications. You can:

#### Option A: Auto-start (Development)
The CRON job will start automatically when you visit the dashboard.

#### Option B: Manual Start
Make a POST request to `/api/cron/init` to start the CRON job.

#### Option C: Production Setup
For production, consider using:
- **Vercel**: Use Vercel Cron Jobs
- **AWS**: Use EventBridge with Lambda
- **Railway/Render**: Use their cron job features

## How It Works

1. **User Authentication**: Supabase handles secure login/signup
2. **Quiet Hour Creation**: Users schedule study sessions with start/end times
3. **Overlap Prevention**: System checks for conflicts before saving
4. **Email Notifications**: CRON job runs every minute checking for sessions starting in 10 minutes
5. **Data Storage**: All data persisted in MongoDB with proper indexing

## API Endpoints

- `GET /api/quiet-hours` - Fetch user's quiet hours
- `POST /api/quiet-hours` - Create new quiet hour
- `PUT /api/quiet-hours/[id]` - Update quiet hour
- `DELETE /api/quiet-hours/[id]` - Delete quiet hour
- `POST /api/cron/init` - Initialize CRON job

## Database Schema

```javascript
{
  userId: String,        // Supabase user ID
  title: String,         // Session title
  startTime: Date,       // When session starts
  endTime: Date,         // When session ends
  description: String,   // Optional description
  isActive: Boolean,     // Whether session is active
  emailSent: Boolean,    // Whether reminder was sent
  createdAt: Date,       // When created
  updatedAt: Date        // When last updated
}
```

## Email Notifications

Currently, email notifications are logged to the console. To enable actual email sending:

1. Configure SMTP settings in `.env.local`
2. Uncomment the nodemailer code in `lib/cron.js`
3. Set up your email service (Gmail, SendGrid, etc.)

## Production Considerations

1. **CRON Jobs**: Use a proper cron service instead of node-cron
2. **Email Service**: Use a dedicated email service like SendGrid or AWS SES
3. **Database**: Use MongoDB Atlas for production
4. **Authentication**: Supabase handles this securely
5. **Environment**: Use proper environment variable management

## Troubleshooting

- **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
- **Supabase Auth**: Verify your Supabase keys and URL
- **CRON Not Working**: Check if the CRON job is initialized at `/api/cron/init`
- **Email Issues**: Check console logs for email notification attempts

## Next Steps

- Add email templates for better notifications
- Implement session analytics
- Add calendar view
- Create mobile app
- Add team/shared quiet hours

