import cron from 'node-cron';
import connectDB from './mongodb';
import QuietHour from '../models/QuietHour';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Email notification function
async function sendNotificationEmail(userEmail, quietHour) {
  console.log(`📧 Email notification for ${userEmail}:`);
  console.log(`   Quiet Hour: ${quietHour.title}`);
  console.log(`   Starts in 10 minutes: ${quietHour.startTime.toISOString()}`);
  console.log(`   Duration: ${Math.round((quietHour.endTime - quietHour.startTime) / (1000 * 60))} minutes`);
  
  // Send actual email if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      // Verify transporter configuration
      await transporter.verify();
      
      await transporter.sendMail({
        from: `"Quiet Hours Scheduler" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `🔔 Quiet Hour Starting Soon: ${quietHour.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🔔 Your Quiet Hour is starting in 10 minutes!</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e293b;">${quietHour.title}</h3>
              <p><strong>📅 Start Time:</strong> ${quietHour.startTime.toLocaleString()}</p>
              <p><strong>⏰ End Time:</strong> ${quietHour.endTime.toLocaleString()}</p>
              <p><strong>⏱️ Duration:</strong> ${Math.round((quietHour.endTime - quietHour.startTime) / (1000 * 60))} minutes</p>
              ${quietHour.description ? `<p><strong>📝 Description:</strong> ${quietHour.description}</p>` : ''}
            </div>
            <p style="color: #64748b;">Time to focus and study! 📚</p>
            <p style="color: #64748b; font-size: 14px;">This is an automated reminder from Quiet Hours Scheduler.</p>
          </div>
        `
      });
      
      console.log(`✅ Email sent successfully to ${userEmail}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${userEmail}:`, error);
      throw error;
    }
  } else {
    console.log(`ℹ️ Email not sent - SMTP not configured (check environment variables)`);
  }
}

// CRON job that runs every minute to check for upcoming quiet hours
const startCronJob = () => {
  // Validate required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      return;
    }
  }

  // Debug: Log environment variables (without exposing the actual keys)
  console.log(`🔧 Supabase URL configured: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`🔧 Service Role Key configured: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  console.log(`🔧 Service Role Key starts with: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)}...`);

  cron.schedule('* * * * *', async () => {
    console.log(`🔍 Checking for upcoming quiet hours at ${new Date().toISOString()}`);
    
    try {
      await connectDB();
      
      // Create admin client with service role key - CRITICAL: Must use service role key for admin operations
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
      
      // Find quiet hours that start in exactly 10 minutes and haven't had email sent
      const upcomingQuietHours = await QuietHour.find({
        startTime: {
          $gte: new Date(tenMinutesFromNow.getTime() - 30000),
          $lte: new Date(tenMinutesFromNow.getTime() + 30000)
        },
        emailSent: { $ne: true },
        isActive: true
      });

      console.log(`📋 Found ${upcomingQuietHours.length} upcoming quiet hours`);

      for (const quietHour of upcomingQuietHours) {
        try {
          console.log(`🔄 Processing quiet hour: ${quietHour.title} for user: ${quietHour.userId}`);
          
          // Get user email from Supabase using admin client
          const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(quietHour.userId);
          
          if (error) {
            console.error(`❌ Error fetching user ${quietHour.userId}:`, error);
            console.error(`❌ Error details:`, {
              message: error.message,
              status: error.status,
              code: error.code
            });
            continue;
          }

          if (!user) {
            console.error(`❌ User not found: ${quietHour.userId}`);
            continue;
          }

          if (!user.email) {
            console.error(`❌ User ${quietHour.userId} has no email address`);
            continue;
          }

          console.log(`📨 Sending notification to: ${user.email}`);

          // Send notification email
          await sendNotificationEmail(user.email, quietHour);
          
          // Mark email as sent
          const updateResult = await QuietHour.findByIdAndUpdate(
            quietHour._id, 
            { 
              emailSent: true,
              emailSentAt: new Date()
            },
            { new: true }
          );
          
          if (!updateResult) {
            console.error(`❌ Failed to update quiet hour ${quietHour._id}`);
          } else {
            console.log(`✅ Notification sent for quiet hour: ${quietHour.title}`);
          }
        } catch (error) {
          console.error(`❌ Error processing quiet hour ${quietHour._id}:`, error);
          // Continue with next quiet hour instead of failing completely
        }
      }
    } catch (error) {
      console.error('❌ Error in CRON job:', error);
    }
  });
  
  console.log('🕒 CRON job started - checking for quiet hour notifications every minute');
};

export { startCronJob };