import { luciferLeaderboard } from '../server/lucifer-ranking.js';

// Web Handler da Vercel — ranking persistente em Redis REST (Upstash).
export default {
  async fetch(request) {
    return luciferLeaderboard(request,process.env);
  }
};
