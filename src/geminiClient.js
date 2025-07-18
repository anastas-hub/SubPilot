const { EventEmitter } = require('events');

// Optionnel : pour Node < 18
// const fetch = require('node-fetch');

class GeminiClient extends EventEmitter {
  constructor(apiKey, model = 'gemini-2.0-flash-lite') {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  }

  async generateContent(prompt, maxRetries = 5, delayMs = 1000) {
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(this.baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          this.emit('response', data);
          return data;
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : delayMs * attempt;

          this.emit('retry', { attempt, waitTime });
          await new Promise(res => setTimeout(res, waitTime));
          continue;
        }

        const errorText = await response.text();
        this.emit('error', {
          code: response.status,
          message: errorText
        });
        break;

      } catch (err) {
        this.emit('error', {
          code: 'network',
          message: err.message
        });
        break;
      }
    }

    this.emit('failed', 'Échec après plusieurs tentatives.');
    return null;
  }
}

module.exports = GeminiClient;
