// One-shot ask mode

import { apiRequest } from '../services/api';
import { streamResponse } from '../services/stream';

export const askOnce = async (question: string, folder?: string): Promise<void> => {
  try {
    const response = await fetch(process.env.SOLACE_API_URL || 'https://api.solace.dev/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, folder }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    await streamResponse(response, (event) => {
      if (event.type === 'text' && event.content) {
        process.stdout.write(event.content);
      } else if (event.type === 'error') {
        console.error('Error:', event.error);
      } else if (event.type === 'done') {
        console.log();
      }
    });
  } catch (error) {
    console.error('Failed to connect:', error);
    process.exit(1);
  }
};
