'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';

interface StarRatingProps {
  avg: number;
  count: number;
  mine: number;
  onRate?: (star: number) => void;
}

export function StarRating({ avg, count, mine, onRate }: StarRatingProps) {
  const [hover, setHover] = useState(0); // -1 = cancel zone, 0 = idle, 1-5 = star
  const interactive = !!onRate;

  const cancelState = hover === -1;

  // Stars to display: cancel zone → 0, hover → hover, rated → mine, else → avg
  const displayLevel = cancelState ? 0 : hover > 0 ? hover : interactive ? mine : Math.round(avg);
  const isPersonal   = cancelState || hover > 0 || (interactive && mine > 0);
  const fillColor    = isPersonal ? '#EB0A1E' : '#F59E0B';

  function stopHover() { if (interactive) setHover(0); }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-0.5">

        {/* Cancel zone — visible when interactive so user can scroll left to cancel */}
        {interactive && (
          <button
            type="button"
            onMouseEnter={() => setHover(-1)}
            onMouseLeave={stopHover}
            onClick={() => onRate?.(0)}
            title="Batalkan penilaian"
            style={{ background: 'none', border: 'none', padding: '1px 3px 1px 0', lineHeight: 0 }}
            className="cursor-pointer"
          >
            <X
              size={10}
              color={cancelState ? '#EB0A1E' : mine > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}
            />
          </button>
        )}

        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={stopHover}
            onClick={() => onRate?.(star)}
            style={{ background: 'none', border: 'none', padding: '1px', lineHeight: 0 }}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          >
            <Star
              size={13}
              fill={star <= displayLevel ? fillColor : 'transparent'}
              color={star <= displayLevel ? fillColor : 'rgba(255,255,255,0.18)'}
            />
          </button>
        ))}
      </div>

      <span className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {cancelState
          ? 'Batalkan penilaian'
          : count > 0
            ? `${avg.toFixed(1)} · ${count} ulasan${mine > 0 && interactive ? ` · kamu ★${mine}` : ''}`
            : interactive ? 'Beri penilaian' : 'Belum ada ulasan'
        }
      </span>
    </div>
  );
}
