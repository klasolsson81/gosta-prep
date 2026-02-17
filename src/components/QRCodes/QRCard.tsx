import { QRCodeSVG } from 'qrcode.react';

interface QRCardProps {
  title: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export default function QRCard({ title, url, icon, color }: QRCardProps) {
  return (
    <div className="flex-shrink-0 w-[300px] snap-center">
      <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <h3 className="font-display font-semibold text-lg">{title}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <QRCodeSVG
            value={url}
            size={200}
            level="M"
            bgColor="#ffffff"
            fgColor="#0F0F0F"
          />
        </div>
        <p className="text-text-muted text-xs text-center break-all max-w-[240px]">{url}</p>
      </div>
    </div>
  );
}
