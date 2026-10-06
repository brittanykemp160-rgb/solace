// /clear command handler

export const handleClear = (reset: () => void) => {
  console.clear();
  reset();
  return null;
};
