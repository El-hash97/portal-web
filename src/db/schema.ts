import { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';

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

export type AppRecord    = typeof apps.$inferSelect;
export type NewAppRecord = typeof apps.$inferInsert;
