// /new command handler

export const handleNew = (reset: () => void) => {
  reset();
  return 'Started new session';
};
