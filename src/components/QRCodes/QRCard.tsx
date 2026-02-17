import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink } from 'lucide-react';

interface QRCardProps {
  title: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export default function QRCard({ title, url, icon, color }: QRCardProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className={color}>{icon}</span>
        <h3 className="font-semibold text-lg text-text">{title}</h3>
      </div>
      <div className="bg-white rounded-2xl p-5">
        <QRCodeSVG
          value={url}
          size={240}
          level="M"
          bgColor="#ffffff"
          fgColor="#0a0a0f"
        />
      </div>
      <p className="text-text-dim text-xs font-mono text-center break-all max-w-[280px] leading-relaxed">{url}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary-hover transition-colors min-h-[44px]"
      >
        <ExternalLink size={14} />
        Testa länk
      </a>
    </div>
  );
}
