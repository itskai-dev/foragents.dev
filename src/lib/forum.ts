import fs from 'fs';
import path from 'path';
import type { ForumThread } from './forumUtils';

interface ForumData {
  threads: ForumThread[];
}

let cachedData: ForumData | null = null;

function loadForumData(): ForumData {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), 'data', 'forum.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  cachedData = JSON.parse(fileContents) as ForumData;
  return cachedData;
}

export async function getForumThreads(category?: string): Promise<ForumThread[]> {
  const data = loadForumData();
  let threads = data.threads;

  if (category) {
    threads = threads.filter(t => t.category === category);
  }

  // Sort by last activity (most recent first)
  return threads.sort((a, b) => 
    new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
  );
}

export async function getForumThreadById(id: string): Promise<ForumThread | null> {
  const data = loadForumData();
  return data.threads.find(t => t.id === id) || null;
}
