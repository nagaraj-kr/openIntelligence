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
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Registration Confirmed! 🎉</h1>
              </div>
              
              <!-- Body -->
              <div style="padding: 30px 20px; color: #334155;">
                <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">You're all set! Thank you for registering for <strong>${meeting?.title || 'our upcoming event'}</strong>.</p>
                
                ${meeting ? `
                  <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; width: 30px; font-size: 18px; vertical-align: top;">📅</td>
                        <td style="padding: 8px 0;">
                          <strong style="color: #0f172a; display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</strong>
                          <span style="color: #475569; font-size: 15px;">${new Date(meeting.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; width: 30px; font-size: 18px; vertical-align: top;">📍</td>
                        <td style="padding: 8px 0;">
                          <strong style="color: #0f172a; display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Venue</strong>
                          <span style="color: #475569; font-size: 15px;">${meeting.venue}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                ` : ''}
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">We're excited to have you join us. Make sure to mark your calendar!</p>
                
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,</p>
                  <p style="margin: 5px 0 0; font-weight: 600; color: #475569;">Madurai AI Community & PiBi Foundation</p>
                </div>
              </div>
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
