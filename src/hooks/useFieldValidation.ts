import { useState, useEffect, useRef } from 'react';

export type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid';

interface ValidationResult {
  status: ValidationStatus;
  message: string;
}

/**
 * Validates a GitHub username by checking the public API.
 * Debounced – waits 500ms after the user stops typing.
 */
export function useGitHubValidation(username: string): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({ status: 'idle', message: '' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!username.trim()) {
      setResult({ status: 'idle', message: '' });
      return;
    }

    // Basic format check first
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      setResult({ status: 'invalid', message: 'Ogiltigt format' });
      return;
    }

    setResult({ status: 'checking', message: '' });

    const timeout = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        if (res.ok) {
          const data = await res.json();
          setResult({ status: 'valid', message: data.name || username });
        } else if (res.status === 404) {
          setResult({ status: 'invalid', message: 'Användaren hittades inte' });
        } else {
          // Rate limit or other error – don't block the user
          setResult({ status: 'idle', message: '' });
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({ status: 'idle', message: '' });
        }
      }
    }, 600);

    return () => {
      clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [username]);

  return result;
}

/**
 * Validates a LinkedIn slug format.
 * LinkedIn blocks API checks, so we only validate the format.
 * Valid: 3-100 chars, alphanumeric + hyphens.
 */
export function useLinkedInValidation(slug: string): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({ status: 'idle', message: '' });

  useEffect(() => {
    if (!slug.trim()) {
      setResult({ status: 'idle', message: '' });
      return;
    }

    const timeout = setTimeout(() => {
      if (slug.length < 3) {
        setResult({ status: 'invalid', message: 'Minst 3 tecken' });
      } else if (!/^[a-zA-Z0-9\-åäöÅÄÖ]+$/.test(slug)) {
        setResult({ status: 'invalid', message: 'Bara bokstäver, siffror och bindestreck' });
      } else if (slug.length > 100) {
        setResult({ status: 'invalid', message: 'Max 100 tecken' });
      } else {
        setResult({ status: 'valid', message: 'Ser bra ut' });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [slug]);

  return result;
}

/**
 * Validates a URL format (portfolio, CV links).
 * Checks if it's a valid URL structure.
 */
export function useUrlValidation(url: string): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({ status: 'idle', message: '' });

  useEffect(() => {
    if (!url.trim()) {
      setResult({ status: 'idle', message: '' });
      return;
    }

    const timeout = setTimeout(() => {
      const withProtocol = url.startsWith('http') ? url : `https://${url}`;
      try {
        const parsed = new URL(withProtocol);
        if (!parsed.hostname.includes('.')) {
          setResult({ status: 'invalid', message: 'Ange en giltig domän (t.ex. example.se)' });
        } else {
          setResult({ status: 'valid', message: parsed.hostname });
        }
      } catch {
        setResult({ status: 'invalid', message: 'Ogiltig URL' });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [url]);

  return result;
}
