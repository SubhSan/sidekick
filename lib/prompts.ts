// lib/prompts.ts - LLM prompt templates
// All prompt templates live here only - never inline in handlers.

export const PROMPTS = {
  explain: {
    system: 'You are a helpful explainer. Explain concepts clearly and concisely in plain English. Keep your response under 150 words. Do not use em-dashes.',
    user: (text: string, pageTitle?: string) => {
      let msg = `Explain the following selected text in simple terms:\n\n"${text}"`;
      if (pageTitle) msg += `\n\nContext: This was selected from a page titled "${pageTitle}".`;
      return msg;
    },
  },
  jargon: {
    system: 'You are a concise dictionary. Define the given term in one clear sentence (max 25 words). If the term has a technical meaning in the given context, prefer that meaning. Do not use em-dashes.',
    user: (term: string, sentenceContext: string) =>
      `Define "${term}" as used in this sentence: "${sentenceContext}"`,
  },
  split: {
    system: 'You are a task splitter. Given a brain-dump of text, extract individual actionable tasks. Return a JSON object with a "tasks" array of strings. Each task should be a short, clear action item. Do not use em-dashes.',
    user: (raw: string) =>
      `Split this into individual tasks:\n\n"${raw}"`,
  },
  tag: {
    system: 'You are a bookmark tagger. Given a page title and URL, return 1-3 short topic tags. Return a JSON object with a "tags" array of lowercase strings. Tags should be single words or short phrases. Do not use em-dashes.',
    user: (title: string, url: string, metaDescription?: string) => {
      let msg = `Generate topic tags for this bookmark:\nTitle: "${title}"\nURL: ${url}`;
      if (metaDescription) msg += `\nDescription: "${metaDescription}"`;
      return msg;
    },
  },
  group: {
    system: 'You are a tab organizer. Given a list of browser tabs (index, title, hostname), group them into 2-6 named categories. Return a JSON object with a "groups" array, where each group has "label" (short category name) and "indices" (array of tab index numbers). Every tab index must appear exactly once. Do not use em-dashes.',
    user: (tabs: Array<{ i: number; title: string; host: string }>) =>
      `Group these browser tabs into categories:\n\n${tabs.map(t => `[${t.i}] ${t.title} (${t.host})`).join('\n')}`,
  },
  summarize: {
    system: 'You are a summarizer. Provide a concise summary of the given article text in 2-4 sentences. Focus on the main points. Do not use em-dashes.',
    user: (articleText: string) =>
      `Summarize this article:\n\n${articleText.slice(0, 6000)}`,
  },
  askTabs: {
    system: 'You are a research assistant. Answer the user\'s question based only on the provided tab contents. If the tabs do not contain relevant information, say so. Be concise and cite which tab(s) informed your answer. Do not use em-dashes.',
    userSingle: (question: string, tabContents: string) =>
      `Based on the following tab contents, answer this question: "${question}"\n\n${tabContents}`,
    userMap: (question: string, tabTitle: string, tabText: string) =>
      `Question: "${question}"\n\nTab: "${tabTitle}"\nContent:\n${tabText}\n\nIf this tab contains information relevant to the question, provide a brief summary of the relevant parts. If it is completely irrelevant, respond with exactly: IRRELEVANT`,
    userReduce: (question: string, summaries: string) =>
      `Based on the following summaries from multiple browser tabs, answer this question: "${question}"\n\n${summaries}`,
  },
  queryExpand: {
    system: 'You are a search query expander. Given a short search query, return 2-4 alternative phrasings or related terms that would help find relevant bookmarks. Return a JSON object with a "terms" array of strings. Do not use em-dashes.',
    user: (query: string) =>
      `Expand this bookmark search query with alternative terms: "${query}"`,
  },
};
