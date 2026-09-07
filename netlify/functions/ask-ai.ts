import type { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { question, product } = JSON.parse(event.body || '{}');

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Question is required' }),
      };
    }

    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      instructions:
        'You are a helpful food nutrition assistant. Answer questions using the scanned product information provided. Be clear, simple, and do not diagnose medical conditions.',
      input: `
Product information:
${JSON.stringify(product, null, 2)}

User question:
${question}
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: response.output_text,
      }),
    };
  } catch (error) {
    console.error('AI error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Unable to get AI response',
      }),
    };
  }
};