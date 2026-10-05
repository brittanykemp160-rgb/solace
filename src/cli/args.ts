// CLI argument parsing

interface Args {
  folder?: string;
  question?: string;
  command?: 'ask' | 'desktop' | 'chat';
  help?: boolean;
  version?: boolean;
}

export const parseArgs = (argv: string[]): Args => {
  const args: Args = { command: 'chat' };
  const rest = argv.slice(2);

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--version' || arg === '-v') {
      args.version = true;
    } else if (arg === 'ask') {
      args.command = 'ask';
      args.question = rest.slice(i + 1).join(' ');
      break;
    } else if (arg === 'desktop') {
      args.command = 'desktop';
      args.folder = rest[i + 1];
      break;
    } else if (!arg.startsWith('-')) {
      args.folder = arg;
    }
  }

  return args;
};
