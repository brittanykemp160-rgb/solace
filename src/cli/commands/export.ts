// /export command handler

import { writeFileSync } from 'fs';
import { join } from 'path';
import type { Session } from '../../types';

export const handleExport = (session: Session, filename?: string): string => {
  const name = filename || `solace-${session.id}.md`;
  const folder = session.folder || process.cwd();
  const path = join(folder, name);

  const content = [
    `# ${session.title}`,
    '',
    `*Exported from Solace on ${new Date().toISOString()}*`,
    '',
    ...session.messages.map(m =>
      `## ${m.role === 'user' ? 'You' : 'Solace'}\n\n${m.content}`
    ),
  ].join('\n');

  writeFileSync(path, content);
  return `Exported to ${path}`;
};
