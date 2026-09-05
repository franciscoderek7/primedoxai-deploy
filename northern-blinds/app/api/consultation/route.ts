import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, leads } from '@/lib/db';

const ConsultationSchema = z.object({
  projectType: z.enum(['new', 'replace', 'reno', 'commercial', '']),
  propertyType: z.enum(['house', 'condo', 'cottage', 'commercial', 'new_build', '']),
  products: z.array(z.enum(['blinds', 'windows', 'doors', 'motorized'])).max(4),
  roomsCount: z.string().max(100).optional().default(''),
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional().default(''),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional().default(''),
  city: z.string().min(1).max(100),
  timeline: z.enum(['asap', '1_month', '3_months', 'flexible', '']).optional().default(''),
  notes: z.string().max(1000).optional().default(''),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ConsultationSchema.safeParse(body);

    if (!data.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: data.error.flatten() },
        { status: 400 }
      );
    }

    const lead = data.data;

    // Write to database (non-fatal if DATABASE_URL not configured)
    if (process.env.DATABASE_URL) {
      try {
        await db.insert(leads).values({
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          projectType: lead.projectType,
          propertyType: lead.propertyType,
          products: lead.products,
          roomsCount: lead.roomsCount,
          timeline: lead.timeline,
          notes: lead.notes,
          status: 'new',
          source: 'website',
        });
      } catch {
        console.error('[Northern Blinds] Failed to write lead to database');
      }
    }

    // Send notification email via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.NOTIFY_EMAIL_TO;
    const notifyFrom = process.env.NOTIFY_EMAIL_FROM;

    if (resendKey && notifyTo && notifyFrom) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: notifyFrom,
          to: notifyTo,
          subject: `New Consultation Request — ${lead.firstName} ${lead.lastName} (${lead.city})`,
          html: `
<h2>New Northern Blinds Consultation Request</h2>
<table>
  <tr><td><strong>Name</strong></td><td>${lead.firstName} ${lead.lastName}</td></tr>
  <tr><td><strong>Email</strong></td><td>${lead.email}</td></tr>
  <tr><td><strong>Phone</strong></td><td>${lead.phone || '—'}</td></tr>
  <tr><td><strong>City</strong></td><td>${lead.city}</td></tr>
  <tr><td><strong>Project Type</strong></td><td>${lead.projectType}</td></tr>
  <tr><td><strong>Property Type</strong></td><td>${lead.propertyType}</td></tr>
  <tr><td><strong>Products</strong></td><td>${lead.products.join(', ') || '—'}</td></tr>
  <tr><td><strong>Rooms/Count</strong></td><td>${lead.roomsCount || '—'}</td></tr>
  <tr><td><strong>Timeline</strong></td><td>${lead.timeline || '—'}</td></tr>
  <tr><td><strong>Notes</strong></td><td>${lead.notes || '—'}</td></tr>
</table>
          `.trim(),
        });
      } catch {
        // Email failure is non-fatal — log on server, don't fail the request
        console.error('[Northern Blinds] Failed to send lead notification email');
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Submission failed. Please try again.' },
      { status: 500 }
    );
  }
}
