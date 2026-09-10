import { WifiOff, HardDrive } from 'lucide-react';
import { getStatusMeta } from '../utils/format.js';

export default function OfflineBanner({ telemetry }) {
  const meta = getStatusMeta(telemetry?.status);
  const last = telemetry?.timestamp
    ? new Date(telemetry.timestamp).toLocaleTimeString()
    : 'unknown';

  return (
    <div className="border-b border-rose-200/80 bg-rose-50/70 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:px-6">
        <div className="flex min-w-0 items-center gap-2 text-rose-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          <p className="truncate text-[11px] font-semibold uppercase tracking-widest">
            Offline mode · cached sensor mesh data · GPS lock active
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11px]">
          <span className="hidden items-center gap-1.5 text-rose-700 sm:inline-flex">
            <HardDrive className="h-3.5 w-3.5" />
            Last sync {last}
          </span>
          <span className={`pill ${meta.pill} !text-[9.5px]`}>{meta.label}</span>
        </div>
      </div>
    </div>
  );
}
