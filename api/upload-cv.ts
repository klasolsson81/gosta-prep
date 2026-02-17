import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const ext = pathname.split('.').pop()?.toLowerCase();
        if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
          throw new Error('Only PDF and Word files allowed');
        }

        return {
          allowedContentTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        };
      },
      onUploadCompleted: async () => {
        // No-op – we don't need server-side tracking
      },
    });

    return res.json(jsonResponse);
  } catch (err) {
    console.error('Upload CV error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return res.status(400).json({ error: message });
  }
}
