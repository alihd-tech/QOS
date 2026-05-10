"use client"

function IconImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center scale-110 bg-white/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-contain" />
    </div>
  )
}

/* ==================== Existing Icons ==================== */
export function FinderIcon() {
  return <IconImage src="/icons/finder.webp" alt="Finder" />
}
export function SafariIcon() {
  return <IconImage src="/icons/safari.webp" alt="Safari" />
}
export function CalculatorIcon() {
  return <IconImage src="/icons/calculator.webp" alt="Calculator" />
}
export function NotesIcon() {
  return <IconImage src="/icons/notes.webp" alt="Notes" />
}
export function TerminalIcon() {
  return <IconImage src="/icons/terminal.webp" alt="Terminal" />
}
export function SettingsIcon() {
  return <IconImage src="/icons/settings.webp" alt="Settings" />
}
export function AppStoreIcon() {
  return <IconImage src="/icons/store.webp" alt="App Store" />
}
export function WeatherIcon() {
  return <IconImage src="/icons/weather.webp" alt="Weather" />
}
export function PhotosIcon() {
  return <IconImage src="/icons/photos.webp" alt="Photos" />
}
export function MusicIcon() {
  return <IconImage src="/icons/music.webp" alt="Music" />
}
export function CalendarIcon() {
  return <IconImage src="/icons/calendar.webp" alt="Calendar" />
}
export function MapsIcon() {
  return <IconImage src="/icons/maps.webp" alt="Maps" />
}
export function ClockIcon() {
  return <IconImage src="/icons/clock.webp" alt="Clock" />
}
export function CodeIcon() {
  return <IconImage src="/icons/vscode.ico" alt="Code" />
}
export function MediaPlayerIcon() {
  return <IconImage src="/icons/media.webp" alt="Media Player" />
}
export function NewsIcon() {
  return <IconImage src="/icons/news.webp" alt="News" />
}
export function QRCodeIcon() {
  return <IconImage src="/icons/qr.webp" alt="QR Code" />
}
export function SolearnIcon() {
  return <IconImage src="/icons/book.webp" alt="Solearn" />
}
export function SolanaMIcon() {
  return <IconImage src="/icons/apps/solanum.svg" alt="SolanaM" />
}
export function KubernetesIcon() {
  return <IconImage src="/icons/kubernetes.webp" alt="Kubernetes and Docker" />
}

/* ==================== Additional app icons ==================== */
export function DockerIcon() {
  return <IconImage src="/icons/apps/docker.svg" alt="Docker" />
}
export function DatabaseClientIcon() {
  return <IconImage src="/icons/database.webp" alt="Database Client" />
}
export function DsaIcon() {
  return <IconImage src="/icons/pattern.webp" alt="Design Patterns & Algorithms" />
}
export function RustEducationIcon() {
  return <IconImage src="/icons/rust.png" alt="Rust Learning Hub" />
}
export function SshClientIcon() {
  return <IconImage src="/icons/station.webp" alt="SSH Client" />
} 