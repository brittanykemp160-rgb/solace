// Model data tests

import { MODELS, findModel, isModelId, modelById, DEFAULT_MODEL_ID } from '../data/models';

describe('MODELS', () => {
  it('has at least one model', () => {
    expect(MODELS.length).toBeGreaterThan(0);
  });

  it('has valid model structure', () => {
    for (const model of MODELS) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBeTruthy();
    }
  });
});

describe('findModel', () => {
  it('finds by exact id', () => {
    const model = findModel(MODELS[0].id);
    expect(model?.id).toBe(MODELS[0].id);
  });

  it('finds by partial match', () => {
    const model = findModel('deepseek');
    expect(model).toBeDefined();
  });

  it('returns undefined for no match', () => {
    expect(findModel('nonexistent')).toBeUndefined();
  });
});

describe('isModelId', () => {
  it('validates known model ids', () => {
    expect(isModelId(MODELS[0].id)).toBe(true);
    expect(isModelId('unknown')).toBe(false);
  });
});

describe('modelById', () => {
  it('returns model by id', () => {
    const model = modelById(MODELS[0].id);
    expect(model.id).toBe(MODELS[0].id);
  });

  it('returns default for unknown id', () => {
    const model = modelById('unknown');
    expect(model.id).toBe(DEFAULT_MODEL_ID);
  });
});
