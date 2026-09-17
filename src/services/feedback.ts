// Feedback service

import { apiRequest } from './api';

interface Feedback {
  type: 'bug' | 'feature' | 'general';
  message: string;
  email?: string;
}

export const submitFeedback = async (feedback: Feedback): Promise<boolean> => {
  try {
    await apiRequest('/feedback', {
      method: 'POST',
      body: feedback,
    });
    return true;
  } catch {
    return false;
  }
};
