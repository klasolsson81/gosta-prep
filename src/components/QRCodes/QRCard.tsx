import { QRCodeSVG } from 'qrcode.react';

interface QRCardProps {
  title: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export default function QRCard({ title, url, icon, color }: QRCardProps) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={color}>{icon}</span>
        <h3 className="font-display font-semibold text-base">{title}</h3>
      </div>
      <div className="bg-white rounded-2xl p-3">
        <QRCodeSVG
          value={url}
          size={180}
          level="M"
          bgColor="#ffffff"
          fgColor="#0F0F0F"
        />
      </div>
      <p className="text-text-muted text-[11px] text-center break-all max-w-[220px] leading-tight">{url}</p>
    </div>
  );
}
