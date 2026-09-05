import { pgTable, text, uuid, timestamp, jsonb, index, boolean } from 'drizzle-orm/pg-core';

export const defLeads = pgTable('def_leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

  // Customer
  firstName: text('first_name').notNull(),
  lastName: text('last_name').default('').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default('').notNull(),

  // Property
  propertyType: text('property_type').notNull(),
  propertyCity: text('property_city').notNull(),
  propertyRegion: text('property_region').default('').notNull(),

  // Services
  services: jsonb('services').$type<string[]>().default([]).notNull(),
  securityNeeds: jsonb('security_needs').$type<string[]>().default([]).notNull(),
  notes: text('notes').default('').notNull(),

  // Timeline
  timeline: text('timeline').default('').notNull(),

  // Status
  status: text('status').default('new').notNull(),
  assignedTo: text('assigned_to').default('').notNull(),
  internalNotes: text('internal_notes').default('').notNull(),

  // Tracking
  source: text('source').default('website').notNull(),
  utmCampaign: text('utm_campaign').default('').notNull(),
}, (t) => ({
  emailIdx: index('def_leads_email_idx').on(t.email),
  statusIdx: index('def_leads_status_idx').on(t.status),
  createdAtIdx: index('def_leads_created_at_idx').on(t.createdAt),
}));

export const defProperties = pgTable('def_properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

  // Owner (references leads customer info)
  ownerEmail: text('owner_email').notNull(),
  ownerName: text('owner_name').notNull(),

  // Property
  propertyName: text('property_name').default('').notNull(),
  propertyType: text('property_type').notNull(),
  address: text('address').default('').notNull(),
  city: text('city').notNull(),
  region: text('region').default('').notNull(),

  // Monitoring
  hasAIProperty360: boolean('has_ai_property_360').default(false).notNull(),
  monitoringConfig: jsonb('monitoring_config').$type<Record<string, unknown>>().default({}).notNull(),

  // Status
  status: text('status').default('active').notNull(),
  notes: text('notes').default('').notNull(),
}, (t) => ({
  ownerEmailIdx: index('def_properties_owner_email_idx').on(t.ownerEmail),
}));

export const defProjects = pgTable('def_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

  // Link
  leadId: uuid('lead_id').notNull(),
  propertyId: uuid('property_id'),

  // Project
  title: text('title').notNull(),
  serviceType: text('service_type').notNull(),
  scope: text('scope').default('').notNull(),
  status: text('status').default('pending').notNull(),

  // Timeline
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
  completedDate: timestamp('completed_date', { withTimezone: true }),

  // Billing placeholder (no live payment integration)
  estimateAmount: text('estimate_amount').default('').notNull(),
  invoiceRef: text('invoice_ref').default('').notNull(),

  notes: text('notes').default('').notNull(),
}, (t) => ({
  leadIdIdx: index('def_projects_lead_id_idx').on(t.leadId),
  statusIdx: index('def_projects_status_idx').on(t.status),
}));
