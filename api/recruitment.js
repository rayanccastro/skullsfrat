import { handleApi } from '../server/recruitment-handler.js';

export default {
  async fetch(request) {
    return await handleApi(request, {
      RECRUITMENT_WEBHOOK_URL: process.env.RECRUITMENT_WEBHOOK_URL || '',
      RECRUITMENT_WEBHOOK_SECRET: process.env.RECRUITMENT_WEBHOOK_SECRET || ''
    }) || new Response('Página não encontrada.', { status: 404 });
  }
};
