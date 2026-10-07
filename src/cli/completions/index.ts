// Shell completion installer

import { existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const BASH_RC = join(homedir(), '.bashrc');
const ZSH_RC = join(homedir(), '.zshrc');
const FISH_CONFIG = join(homedir(), '.config', 'fish', 'completions', 'solace.fish');

export const installCompletions = (shell: 'bash' | 'zsh' | 'fish' = 'bash') => {
  const completionsDir = __dirname;

  switch (shell) {
    case 'bash':
      if (existsSync(BASH_RC)) {
        const content = readFileSync(BASH_RC, 'utf-8');
        const source = `source "${join(completionsDir, 'bash.sh')}"`;
        if (!content.includes('solace')) {
          appendFileSync(BASH_RC, `\n# Solace completions\n${source}\n`);
        }
      }
      break;
    case 'zsh':
      if (existsSync(ZSH_RC)) {
        const content = readFileSync(ZSH_RC, 'utf-8');
        const source = `source "${join(completionsDir, 'zsh.sh')}"`;
        if (!content.includes('solace')) {
          appendFileSync(ZSH_RC, `\n# Solace completions\n${source}\n`);
        }
      }
      break;
    case 'fish':
      // Fish completions auto-load from config dir
      break;
  }
};
