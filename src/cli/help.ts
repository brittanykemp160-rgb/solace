// Help text

import { c } from './theme';

export const printHelp = () => {
  console.log(`
Usage: solace [options] [folder]

Commands:
  solace                 Start interactive chat
  solace <folder>        Chat about a specific folder
  solace ask "question"  One-shot question
  solace desktop         Open desktop app
  solace --help          Show this help
  solace --version       Show version

Slash commands:
  /new          Start new session
  /clear        Clear and reset
  /model        Switch AI model
  /help         Show commands
  /exit         Quit
`);
};
