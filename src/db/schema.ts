import { pgTable, serial, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const apps = pgTable('apps', {
  id:        serial('id').primaryKey(),
  nama:      text('nama').notNull(),
  kategori:  text('kategori').notNull(),
  deskripsi: text('deskripsi').notNull(),
  link:      text('link').notNull(),
  icon:      text('icon').notNull(),
  logo:      text('logo'),
  aktif:       boolean('aktif').notNull().default(true),
  maintenance: boolean('maintenance').notNull().default(false),
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

export const featureRequests = pgTable('feature_requests', {
  id:           serial('id').primaryKey(),
  requester:    text('requester').notNull(),
  lineName:     text('line_name').notNull(),
  appId:        integer('app_id').references(() => apps.id, { onDelete: 'set null' }),
  requestText:  text('request_text').notNull(),
  photoData:    text('photo_data'),
  status:       text('status').notNull().default('menunggu'),
  approver:     text('approver'),
  rejectReason: text('reject_reason'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  decidedAt:    timestamp('decided_at', { withTimezone: true }),
  finishedAt:   timestamp('finished_at', { withTimezone: true }),
});

export type FeatureRequestRecord = typeof featureRequests.$inferSelect;

export const notifications = pgTable('notifications', {
  id:          serial('id').primaryKey(),
  title:       text('title').notNull(),
  content:     text('content').notNull(),
  photoData:   text('photo_data'),
  status:      text('status').notNull().default('active'),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export type NotificationRecord = typeof notifications.$inferSelect;

export const settings = pgTable('settings', {
  key:   text('key').primaryKey(),
  value: text('value').notNull(),
});

export type SettingRecord = typeof settings.$inferSelect;
