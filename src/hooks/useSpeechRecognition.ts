import { useState, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getRecognitionClass(): SpeechRecognitionConstructor | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecognitionConstructor | null;
}

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  const supported = !!getRecognitionClass();

  const start = useCallback(() => {
    const Ctor = getRecognitionClass();
    if (!Ctor) return;

    // Stop any previous instance
    if (recRef.current) {
      try { recRef.current.abort(); } catch { /* ignore */ }
    }

    const rec = new Ctor();
    rec.lang = 'sv-SE';
    rec.interimResults = false;
    rec.continuous = false;
    recRef.current = rec;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from({ length: e.results.length })
        .map((_, i) => e.results[i][0].transcript)
        .join(' ')
        .trim();
      if (transcript) onResult(transcript);
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    rec.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* ignore */ }
    }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop(); else start();
  }, [listening, start, stop]);

  return { listening, supported, start, stop, toggle };
}
