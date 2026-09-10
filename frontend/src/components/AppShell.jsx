import { useState } from 'react';
import { Home, Map, BellRing, Activity, Settings as SettingsIcon, Waves } from 'lucide-react';
import Dashboard from './Dashboard.jsx';
import MapScreen from './MapScreen.jsx';
import AlertsScreen from './AlertsScreen.jsx';
import DrillScreen from './DrillScreen.jsx';
import SettingsScreen from './SettingsScreen.jsx';
import SosOverlay from './SosOverlay.jsx';
import OfflineBanner from './OfflineBanner.jsx';
import { getStatusMeta } from '../utils/format.js';

const SCREENS = [
  { id: 'home',    label: 'Home',     icon: Home },
  { id: 'map',     label: 'Map',      icon: Map },
  { id: 'alerts',  label: 'Alerts',   icon: BellRing },
  { id: 'drill',   label: 'Drill',    icon: Activity },
  { id: 'settings',label: 'System',   icon: SettingsIcon },
];

export default function AppShell(props) {
  const [screen, setScreen] = useState('home');
  const { telemetry, isOffline, inDangerZone, ...rest } = props;
  const meta = getStatusMeta(telemetry?.status);

  return (
    <div className="relative min-h-screen w-full pb-28">
      {/* Soft background aurora */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 top-40 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />

      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-soft-sky">
              <Waves className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold tracking-widest text-sky-900">
                  PRAVAH
                </span>
                <span className="pill pill-info !px-2 !py-0.5 !text-[9px]">
                  SAT-LIVE
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-sky-500" />
                <span className="truncate uppercase tracking-wider">
                  {props.selectedLocation ? (telemetry?.location || props.selectedLocation.name) : 'Your Location'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="truncate uppercase tracking-wider">
                  {SCREENS.find((s) => s.id === screen)?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`pill ${
                isOffline ? 'pill-danger' : 'pill-safe'
              } hidden sm:inline-flex`}
            >
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-current" />
              {isOffline ? 'OFFLINE' : 'MESH OK'}
            </span>
            <span className={`pill ${meta.pill} hidden md:inline-flex`}>
              {meta.label}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-xs font-bold text-white shadow-soft-sky">
              SD
            </div>
          </div>
        </div>
      </header>

      {/* Offline cache strip */}
      {isOffline && <OfflineBanner telemetry={telemetry} />}

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {screen === 'home' && (
          <Dashboard
            telemetry={telemetry}
            isOffline={isOffline}
            onToggleBlackout={props.onToggleBlackout}
            userPosition={props.userPosition}
            inDangerZone={inDangerZone}
            wards={props.wards}
            onSelectLocation={props.onSelectLocation}
            selectedLocation={props.selectedLocation}
            telemetryLog={props.telemetryLog}
          />
        )}
        {screen === 'map' && (
          <MapScreen
            telemetry={telemetry}
            userPosition={props.userPosition}
            selectedLocation={props.selectedLocation}
            inDangerZone={inDangerZone}
          />
        )}
        {screen === 'alerts' && (
          <AlertsScreen
            telemetry={telemetry}
            telemetryLog={props.telemetryLog}
            wards={props.wards}
            inDangerZone={inDangerZone}
            isOffline={isOffline}
          />
        )}
        {screen === 'drill' && (
          <DrillScreen
            telemetry={telemetry}
            onToggleBlackout={props.onToggleBlackout}
            isOffline={isOffline}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            telemetry={telemetry}
            isOffline={isOffline}
            onToggleBlackout={props.onToggleBlackout}
            bootError={props.bootError}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-30 px-3 pb-3">
        <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-white/70 bg-white/80 p-1.5 shadow-glass-lg backdrop-blur-xl">
          {SCREENS.map(({ id, label, icon: Icon }) => {
            const active = screen === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setScreen(id)}
                className={`flex min-w-[58px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 transition-all duration-200 ${
                  active
                    ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  {active && (
                    <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-500" />
                  )}
                </div>
                <span className="text-[9.5px] font-semibold uppercase tracking-wider">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <SosOverlay
        active={inDangerZone && isOffline}
        userPosition={props.userPosition}
        locationName={telemetry?.location}
      />
    </div>
  );
}
