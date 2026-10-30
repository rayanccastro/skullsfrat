import { handleApi } from '../server/recruitment-handler.js';

// Native Web Handler, executed by the Vercel Node.js runtime.
export default {
  async fetch(request) {
    return await handleApi(request, {
      RECRUITMENT_WEBHOOK_URL: process.env.RECRUITMENT_WEBHOOK_URL || ''
    }) || new Response('Página não encontrada.', { status: 404 });
  }
};
