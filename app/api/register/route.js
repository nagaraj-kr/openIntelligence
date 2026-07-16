import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { meeting_id, name, email, phone, interested } = await request.json();

    if (!meeting_id || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Save to Database
    const { data: registration, error: regError } = await supabaseAdmin.from('event_registrations').insert({
      id: crypto.randomUUID(),
      meeting_id,
      name,
      email,
      phone,
      interested: interested === 'yes' || interested === true,
    }).select().single();

    if (regError) throw regError;

    // 2. Fetch Meeting Details for the Email
    const { data: meeting } = await supabaseAdmin.from('meetings').select('*').eq('id', meeting_id).single();

    // 3. Send Confirmation Email
    try {
      // Look for SMTP credentials in environment variables
      const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;

      if (SMTP_USER && SMTP_PASS) {
        // Real email sending
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST || 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        const mailOptions = {
          from: `"Madurai AI Community" <${SMTP_USER}>`,
          to: email,
          subject: `Registration Confirmed: ${meeting?.title || 'Upcoming Event'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #4f46e5;">Registration Confirmed! 🎉</h2>
              <p>Hi ${name},</p>
              <p>Thank you for registering for <strong>${meeting?.title || 'our upcoming event'}</strong>.</p>
              ${meeting ? `
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${new Date(meeting.date).toLocaleString('en-IN')}</p>
                  <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${meeting.venue}</p>
                </div>
              ` : ''}
              <p>We look forward to seeing you there!</p>
              <br/>
              <p style="color: #64748b; font-size: 0.9em;">- Madurai AI Community & PiBi Foundation</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent successfully to ${email}`);
      } else {
        // Fallback: Just log it if SMTP is not configured yet
        console.log(`\n=================================================`);
        console.log(`📧 MOCK EMAIL SENT (SMTP credentials not configured)`);
        console.log(`To: ${email}`);
        console.log(`Subject: Registration Confirmed: ${meeting?.title || 'Upcoming Event'}`);
        console.log(`=================================================\n`);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // We don't want to fail the registration if only the email fails
    }

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
