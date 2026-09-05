import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { defLeads } from '@/lib/db/schema';
import { Resend } from 'resend';

const schema = z.object({
  propertyType: z.string().min(1),
  propertyCity: z.string().min(1),
  propertyRegion: z.string().min(1),
  services: z.array(z.string()).min(1),
  securityNeeds: z.array(z.string()).default([]),
  notes: z.string().max(2000).default(''),
  timeline: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).default(''),
  email: z.string().email(),
  phone: z.string().max(30).default(''),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Validation failed' }, { status: 422 });
  }

  const d = result.data;

  // Save to database — non-fatal
  if (db) {
    try {
      await db.insert(defLeads).values({
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        propertyType: d.propertyType,
        propertyCity: d.propertyCity,
        propertyRegion: d.propertyRegion,
        services: d.services,
        securityNeeds: d.securityNeeds,
        notes: d.notes,
        timeline: d.timeline,
        source: 'website',
      });
    } catch {
      // DB failure is non-fatal — still send notification
    }
  }

  // Email notification — non-fatal
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.DEF_NOTIFY_EMAIL;
  if (resendKey && notifyEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'DEF Property Maintenance <noreply@defpropertymaintenance.ca>',
        to: notifyEmail,
        subject: `New Consultation Request — ${d.firstName} ${d.lastName} (${d.propertyType} in ${d.propertyCity})`,
        text: [
          `Name: ${d.firstName} ${d.lastName}`,
          `Email: ${d.email}`,
          `Phone: ${d.phone || 'Not provided'}`,
          `Property Type: ${d.propertyType}`,
          `Location: ${d.propertyCity}, ${d.propertyRegion}`,
          `Services: ${d.services.join(', ')}`,
          `Security/Needs: ${d.securityNeeds.join(', ') || 'None selected'}`,
          `Timeline: ${d.timeline}`,
          `Notes: ${d.notes || 'None'}`,
          '',
          'Submitted via DEF Property Maintenance website consultation form.',
        ].join('\n'),
      });
    } catch {
      // Email failure is non-fatal
    }
  }

  return NextResponse.json({ success: true });
}
