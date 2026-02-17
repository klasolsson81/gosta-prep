import { QRCodeSVG } from 'qrcode.react';

interface QRCardProps {
  title: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export default function QRCard({ title, url, icon, color }: QRCardProps) {
  return (
    <div className="bg-elevated border border-glass-border rounded-2xl p-5 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <span className={color}>{icon}</span>
        <h3 className="font-semibold text-base text-text">{title}</h3>
      </div>
      <div className="bg-white rounded-xl p-4">
        <QRCodeSVG
          value={url}
          size={200}
          level="M"
          bgColor="#ffffff"
          fgColor="#0a0a0f"
        />
      </div>
      <p className="text-text-dim text-[11px] font-mono text-center break-all max-w-[240px] leading-tight">{url}</p>
    </div>
  );
}
