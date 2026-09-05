import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

export const leads = pgTable(
  'nb_leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

    // Contact
    firstName: text('first_name').notNull(),
    lastName: text('last_name').default('').notNull(),
    email: text('email').notNull(),
    phone: text('phone').default('').notNull(),
    city: text('city').notNull(),

    // Project
    projectType: text('project_type').notNull(),
    propertyType: text('property_type').notNull(),
    products: jsonb('products').$type<string[]>().default([]).notNull(),
    roomsCount: text('rooms_count').default('').notNull(),
    timeline: text('timeline').default('').notNull(),
    notes: text('notes').default('').notNull(),

    // CRM
    status: text('status').default('new').notNull(),
    assignedTo: text('assigned_to').default('').notNull(),
    internalNotes: text('internal_notes').default('').notNull(),

    // Source tracking
    source: text('source').default('website').notNull(),
    utmCampaign: text('utm_campaign').default('').notNull(),
  },
  (t) => ({
    emailIdx: index('nb_leads_email_idx').on(t.email),
    statusIdx: index('nb_leads_status_idx').on(t.status),
    createdAtIdx: index('nb_leads_created_at_idx').on(t.createdAt),
  })
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
