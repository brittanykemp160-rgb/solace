// Supported programming languages

export interface Language {
  id: string;
  name: string;
  extensions: string[];
  comment: string;
}

export const LANGUAGES: Language[] = [
  { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx'], comment: '//' },
  { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'], comment: '//' },
  { id: 'python', name: 'Python', extensions: ['.py'], comment: '#' },
  { id: 'rust', name: 'Rust', extensions: ['.rs'], comment: '//' },
  { id: 'go', name: 'Go', extensions: ['.go'], comment: '//' },
  { id: 'java', name: 'Java', extensions: ['.java'], comment: '//' },
  { id: 'cpp', name: 'C++', extensions: ['.cpp', '.hpp', '.cc', '.h'], comment: '//' },
  { id: 'c', name: 'C', extensions: ['.c', '.h'], comment: '//' },
  { id: 'csharp', name: 'C#', extensions: ['.cs'], comment: '//' },
  { id: 'ruby', name: 'Ruby', extensions: ['.rb'], comment: '#' },
  { id: 'php', name: 'PHP', extensions: ['.php'], comment: '//' },
  { id: 'swift', name: 'Swift', extensions: ['.swift'], comment: '//' },
  { id: 'kotlin', name: 'Kotlin', extensions: ['.kt', '.kts'], comment: '//' },
  { id: 'bash', name: 'Bash', extensions: ['.sh', '.bash'], comment: '#' },
  { id: 'sql', name: 'SQL', extensions: ['.sql'], comment: '--' },
];

export const detectLanguage = (filename: string): Language | undefined => {
  const ext = filename.slice(filename.lastIndexOf('.'));
  return LANGUAGES.find(l => l.extensions.includes(ext));
};
