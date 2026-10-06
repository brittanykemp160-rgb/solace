// /model command handler

import { MODELS, findModel, DEFAULT_MODEL_ID } from '../../data/models';

export const handleModel = (query: string, setModelId: (id: string) => void): string => {
  if (!query) {
    return `Available models:\n${MODELS.map(m => `  ${m.id}`).join('\n')}`;
  }

  const model = findModel(query);
  if (!model) {
    return `Model not found: ${query}`;
  }

  setModelId(model.id);
  return `Switched to ${model.name}`;
};
