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
  const [error, setError] = useState('');
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const gotResult = useRef(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const supported = !!getRecognitionClass();

  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setError(''), 2500);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionClass();
    if (!Ctor) return;

    if (recRef.current) {
      try { recRef.current.abort(); } catch { /* ignore */ }
    }

    const rec = new Ctor();
    rec.lang = 'sv-SE';
    rec.interimResults = false;
    rec.continuous = false;
    recRef.current = rec;
    gotResult.current = false;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from({ length: e.results.length })
        .map((_, i) => e.results[i][0].transcript)
        .join(' ')
        .trim();
      if (transcript) {
        gotResult.current = true;
        onResult(transcript);
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      setListening(false);
      if (e.error === 'no-speech') {
        showError('Kunde inte höra — prova igen');
      } else if (e.error !== 'aborted') {
        showError('Kunde inte höra — prova skriva');
      }
    };

    rec.onend = () => {
      setListening(false);
      if (!gotResult.current && !error) {
        showError('Kunde inte höra — prova igen');
      }
    };

    rec.start();
    setListening(true);
  }, [onResult, showError, error]);

  const stop = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* ignore */ }
    }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop(); else start();
  }, [listening, start, stop]);

  return { listening, supported, error, start, stop, toggle };
}
