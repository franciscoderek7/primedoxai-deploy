/*
 * chinese-ai-providers.js — Chinese AI Model Fallback Chain
 * Used by gemma-server.js routes: /generate-motion, /translate, /suggest-fix
 *
 * All four vendors expose OpenAI-compatible chat-completions endpoints, so the
 * same OpenAI SDK works for every provider — only apiKey + baseURL + model change.
 * This is exactly the pattern gemma-server.js already uses for Ollama (see
 * getClient() in that file) — this module just adds more providers to the chain.
 *
 * SECURITY NOTE: these API keys live SERVER-SIDE ONLY (read from .env on this
 * Node process). Never put a real DeepSeek/Qwen/GLM/Kimi key into a browser
 * <script> tag or any agents/*.js file that ships to the client — anyone who
 * views page source would be able to steal it and run up the bill. The client
 * connector (agents/chinese-ai-connector.js) calls THIS server, not the vendor
 * APIs directly.
 *
 * MODEL NAMES: the exact current model ID for each vendor changes over time —
 * verify against each provider's own docs before going live and update the
 * *_MODEL env vars below. Defaults here are sensible starting points, not a
 * guarantee that string matches what a given account/plan actually has access to.
 *
 * WHERE TO GET EACH KEY:
 *   DeepSeek  — platform.deepseek.com  (or siliconflow.cn for a cheaper proxy)
 *   Qwen      — siliconflow.cn  (or dashscope.console.aliyun.com for Alibaba direct)
 *   GLM       — open.bigmodel.cn / z.ai  (or siliconflow.cn)
 *   Kimi      — platform.moonshot.cn
 */

const OpenAI = require('openai');

const PROVIDERS = {
  deepseek: {
    key:     process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model:   process.env.DEEPSEEK_MODEL   || 'deepseek-chat',
  },
  qwen: {
    key:     process.env.QWEN_API_KEY,
    baseURL: process.env.QWEN_BASE_URL || 'https://api.siliconflow.cn/v1',
    model:   process.env.QWEN_MODEL    || 'Qwen/Qwen2.5-72B-Instruct',
  },
  glm: {
    key:     process.env.GLM_API_KEY,
    baseURL: process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    model:   process.env.GLM_MODEL    || 'glm-4-plus',
  },
  kimi: {
    key:     process.env.KIMI_API_KEY,
    baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
    model:   process.env.KIMI_MODEL    || 'moonshot-v1-32k',
  },
  // Final fallback — reuses the OpenAI key this backend already supports
  // (see agents/backend/.env.example). No Anthropic/Claude key exists
  // anywhere in this repo, so the chain stops here if OpenAI isn't configured.
  openai: {
    key:     process.env.OPENAI_API_KEY,
    baseURL: undefined,
    model:   process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};

/**
 * Try providers in order, skip any without a configured key, return the
 * first successful completion. Throws a descriptive error if none worked.
 * @param {Array<{role,content}>} messages
 * @param {string[]} chain — provider names in fallback order
 * @param {object} opts — { maxTokens, temperature }
 */
async function chineseAIComplete(messages, chain, opts) {
  opts = opts || {};
  var attempted = [];
  var lastErr = null;

  for (var i = 0; i < chain.length; i++) {
    var name = chain[i];
    var cfg = PROVIDERS[name];
    if (!cfg) continue;
    if (!cfg.key) { attempted.push(name + ' (no API key configured)'); continue; }

    try {
      var client = new OpenAI({ apiKey: cfg.key, baseURL: cfg.baseURL });
      var completion = await client.chat.completions.create({
        model: cfg.model,
        messages: messages,
        max_tokens: opts.maxTokens || 1024,
        temperature: opts.temperature != null ? opts.temperature : 0.5,
      });
      return {
        text: completion.choices[0]?.message?.content || '',
        provider: name,
        model: cfg.model,
      };
    } catch (err) {
      attempted.push(name + ' (' + err.message + ')');
      lastErr = err;
    }
  }

  var err = new Error(
    'All providers in chain failed or unconfigured: ' + attempted.join(', ')
  );
  err.attempted = attempted;
  err.cause = lastErr;
  throw err;
}

module.exports = { chineseAIComplete, PROVIDERS };
