import { defineConfig } from 'wxt';
import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  vite: () => ({
    plugins: [react({ fastRefresh: false }), tailwind()],
  }),
  manifest: {
    name: 'Sidekick',
    permissions: ['storage','tabs','tabGroups','sessions','bookmarks',
      'declarativeNetRequest','scripting','activeTab','notifications',
      'favicon','contextMenus','alarms','downloads','history'],
    host_permissions: ['https://api.groq.com/*','https://api.open-meteo.com/*',
      'https://geocoding-api.open-meteo.com/*','https://api.bigdatacloud.net/*','<all_urls>'],
    chrome_url_overrides: { newtab: 'newtab.html' },
    web_accessible_resources: [{ resources: ['blocked.html', 'reader.html'], matches: ['<all_urls>'] }],
  },
});
