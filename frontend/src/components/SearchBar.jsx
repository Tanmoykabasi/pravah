import { MapPin, Navigation, Crosshair } from 'lucide-react';

const CHUNGTHANG_LOCATION = {
  name: 'Chungthang',
  lat: 27.6,
  lon: 88.64,
  blurb: 'Teesta River Basin, Sikkim',
};

/**
 * Replaces the open search bar with a "Your Location" device readout.
 * Contains a discreet secret trigger button (and container click) to
 * seamlessly switch location to "Chungthang" for live demonstration.
 */
export default function SearchBar({ onSelect, selectedLocation, userPosition }) {
  const isChungthang = selectedLocation?.name === 'Chungthang';

  const handleTriggerChungthang = () => {
    if (!isChungthang) {
      onSelect?.(CHUNGTHANG_LOCATION);
    }
  };

  const handleSecretButtonClick = (e) => {
    e.stopPropagation();
    if (isChungthang) {
      // Toggle back to "Your Location" for repeated demonstrations
      onSelect?.(null);
    } else {
      onSelect?.(CHUNGTHANG_LOCATION);
    }
  };

  return (
    <div
      onClick={handleTriggerChungthang}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTriggerChungthang();
        }
      }}
      className={`group relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 backdrop-blur-md transition-all duration-300 outline-none select-none ${
        isChungthang
          ? 'border-sky-300/80 bg-white/90 shadow-glass-lg'
          : 'border-white/80 bg-white/75 shadow-glass hover:bg-white/90 hover:border-sky-200'
      }`}
    >
      {/* Left side: Icon + Location Readout */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
            isChungthang
              ? 'bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-soft-sky'
              : 'bg-sky-100 text-sky-700 ring-1 ring-sky-200 group-hover:bg-sky-200/80'
          }`}
        >
          {isChungthang ? (
            <MapPin className="h-5 w-5" />
          ) : (
            <Navigation className="h-4.5 w-4.5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-base font-bold text-slate-900 truncate">
              {isChungthang ? 'Chungthang' : 'Your Location'}
            </p>
            {isChungthang ? (
              <span className="pill pill-safe !px-2 !py-0.5 !text-[9.5px]">
                <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-current" />
                SIMULATING
              </span>
            ) : (
              <span className="pill pill-neutral !px-2 !py-0.5 !text-[9.5px]">
                <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-sky-500" />
                GPS LOCKED
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate font-mono">
            {isChungthang
              ? '27.6000°N · 88.6400°E · Teesta River Basin, Sikkim'
              : `${userPosition?.lat?.toFixed(4) ?? '27.6005'}°N · ${userPosition?.lon?.toFixed(4) ?? '88.6395'}°E · Teesta Catchment Zone`}
          </p>
        </div>
      </div>

      {/* Secret trigger button */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleSecretButtonClick}
          title={isChungthang ? 'Click to reset to Your Location' : 'Simulate Chungthang demo'}
          aria-label="Secret demo switch"
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
            isChungthang
              ? 'text-sky-600 bg-sky-50 ring-1 ring-sky-200 hover:bg-sky-100 active:scale-90'
              : 'text-slate-300 opacity-60 hover:opacity-100 hover:text-sky-600 hover:bg-sky-50 hover:ring-1 hover:ring-sky-200 active:scale-90'
          }`}
        >
          <Crosshair className={`h-4 w-4 ${isChungthang ? 'text-sky-600' : ''}`} />
        </button>
      </div>
    </div>
  );
}
