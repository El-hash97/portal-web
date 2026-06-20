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

export const appRatings = pgTable('app_ratings', {
  id:       serial('id').primaryKey(),
  appId:    integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  deviceId: text('device_id').notNull(),
  rating:   integer('rating').notNull(),
  ratedAt:  timestamp('rated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const feedbackItems = pgTable('feedback', {
  id:        serial('id').primaryKey(),
  appId:     integer('app_id').references(() => apps.id, { onDelete: 'set null' }),
  pesan:     text('pesan').notNull(),
  status:    text('status').notNull().default('baru'),
  deviceId:  text('device_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AppRating     = typeof appRatings.$inferSelect;
export type FeedbackItem  = typeof feedbackItems.$inferSelect;
