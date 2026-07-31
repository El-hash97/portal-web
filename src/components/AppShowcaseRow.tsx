'use client';

import { useState } from 'react';
import { ArrowRight, Check, Link2, Wrench } from 'lucide-react';
import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';
import { StarRating } from '@/components/StarRating';
import { useRatingsStore } from '@/context/RatingsContext';
import { AppShowcaseGallery } from '@/components/AppShowcaseGallery';
import { APP_ASSET_IMAGES, appSlug } from '@/lib/appAssets';

export function AppShowcaseRow({ app, reversed }: { app: App; reversed: boolean }) {
  const { getCategoryStyle } = useAppStore();
  const { ratings, rate } = useRatingsStore();
  const ratingData = ratings[app.id] ?? { avg: 0, count: 0, mine: 0 };
  const style = getCategoryStyle(app.kategori);
  const Icon = ICON_MAP[app.icon] ?? ICON_MAP.box;
  const inMaintenance = app.maintenance ?? false;
  const hasLink = !!app.link && app.link !== '#';
  const galleryImages = APP_ASSET_IMAGES[appSlug(app.nama)];

  const [copied, setCopied] = useState(false);
  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/go/${app.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-14`}>
      {/* Content side */}
      <div className="w-full md:w-5/12 shrink-0">
        {app.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.logo} alt={app.nama} className="w-14 h-14 rounded-2xl mb-5 object-cover" />
        ) : (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: style.bg, color: style.color }}
          >
            <Icon size={26} />
          </div>
        )}

        <h2 className="font-display text-[22px] sm:text-[26px] font-bold leading-tight mb-3" style={{ color: '#eef2ff' }}>
          {app.nama}
        </h2>
        <p className="font-data text-[14px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {app.deskripsi}
        </p>

        <div className="mb-6">
          <StarRating
            avg={ratingData.avg}
            count={ratingData.count}
            mine={ratingData.mine}
            onRate={star => rate(app.id, star)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {inMaintenance ? (
            <span
              className="font-data inline-flex items-center gap-2 text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg cursor-not-allowed select-none"
              style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <Wrench size={13} /> Sedang Maintenance
            </span>
          ) : hasLink ? (
            <>
              <a
                href={`/go/${app.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-data inline-flex items-center gap-2 text-white text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg transition-all hover:translate-x-0.5"
                style={{ background: '#EB0A1E' }}
              >
                Buka Aplikasi <ArrowRight size={13} />
              </a>
              <button
                onClick={copyShareLink}
                className="inline-flex items-center justify-center p-2.5 rounded-lg border transition-all"
                style={copied
                  ? { borderColor: 'rgba(29,138,86,0.4)', color: '#1D8A56', background: 'rgba(29,138,86,0.10)' }
                  : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', background: 'transparent' }
                }
                title={copied ? 'Tersalin' : 'Salin link untuk dibagikan'}
              >
                {copied ? <Check size={14} /> : <Link2 size={14} />}
              </button>
            </>
          ) : (
            <span
              className="font-data inline-flex items-center gap-2 text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}
            >
              Link Belum Diisi
            </span>
          )}
        </div>
      </div>

      {/* Visual side */}
      <div className="w-full md:w-7/12">
        {galleryImages?.length ? (
          <AppShowcaseGallery images={galleryImages} alt={app.nama} />
        ) : (
          <div
            className="w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: style.bg, color: style.color }}
            >
              <Icon size={30} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
