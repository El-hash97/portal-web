import { pgTable, serial, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const apps = pgTable('apps', {
  id:        serial('id').primaryKey(),
  nama:      text('nama').notNull(),
  kategori:  text('kategori').notNull(),
  deskripsi: text('deskripsi').notNull(),
  link:      text('link').notNull(),
  icon:      text('icon').notNull(),
  logo:      text('logo'),
  aktif:     boolean('aktif').notNull().default(true),
});

export const appClicks = pgTable('app_clicks', {
  id:        serial('id').primaryKey(),
  appId:     integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  clickedAt: timestamp('clicked_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AppRecord    = typeof apps.$inferSelect;
export type NewAppRecord = typeof apps.$inferInsert;
export type AppClick     = typeof appClicks.$inferSelect;
