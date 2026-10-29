/**
 * POST /api/advisor — Narrative advisor powered by Nebius Token Factory / NVIDIA API Catalog.
 *
 * Runs server-side only so API keys never reach the browser bundle.
 * The advisor only *explains* recommendations already produced by the rule-based
 * decision engine; it never changes or re-ranks them.
 *
 * Env (set in Vercel Project Settings → Environment Variables, or .env.local):
 *   NEBIUS_API_KEY / NVIDIA_API_KEY   required
 *   NEBIUS_MODEL / NVIDIA_MODEL       optional, model id (defaults to nvidia/Nemotron-3_5-Lightning)
 *   NEBIUS_BASE_URL / NVIDIA_BASE_URL optional, OpenAI-compatible base URL
 *   AI_PROVIDER                       optional, 'nebius' | 'nvidia'
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_NEBIUS_BASE_URL = 'https://api.tokenfactory.nebius.com/v1';
const DEFAULT_NEBIUS_MODEL = 'nvidia/Nemotron-3_5-Lightning';

const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_NVIDIA_MODEL = 'nvidia/llama-3.1-nemotron-70b-instruct';

const MAX_BODY_BYTES = 16_000;
const UPSTREAM_TIMEOUT_MS = 40_000;

// Best-effort per-client limit. Serverless instances are short-lived and not shared,
// so this blunts casual abuse of the paid upstream; use a platform firewall for hard limits.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

/** Raw upstream error text can echo account or key details, so it is dev-only. */
function exposeDiagnostics(): boolean {
  return process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production';
}

export function clientKey(req: VercelRequest): string | null {
  const fwd = req.headers?.['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
  return first || null;
}

/** Returns true when the client has exceeded its quota for the current window. */
export function isRateLimited(key: string | null, now = Date.now()): boolean {
  if (!key) return false;
  if (rateBuckets.size > 500) {
    for (const [k, v] of rateBuckets) if (v.resetAt <= now) rateBuckets.delete(k);
  }
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

export function resetRateLimit(): void {
  rateBuckets.clear();
}

export interface AdvisorRecommendation {
  title: string;
  confidence: number;
  uncertainty: number;
  expectedYield: number;
  expectedIncome: number;
  waterSavings: number;
  reasoning: string[];
}

export interface AdvisorScenario {
  name: string;
  location: string;
  year: number;
  parameters: { rainfallDelta: number; salinityDelta: number; awdAdoption: number };
  projections: Array<{ year: number; yield: number; waterUse: number; riskScore: number }>;
}

export interface RecommendationPayload {
  mode?: 'recommendation';
  recommendation: AdvisorRecommendation;
  audience: string;
  language: string;
}

export interface ScenarioPayload {
  mode: 'scenario';
  scenario: AdvisorScenario;
  audience: string;
  language: string;
}

export type AdvisorPayload = RecommendationPayload | ScenarioPayload;

export interface ProviderConfig {
  name: string;
  providerId: 'nebius' | 'nvidia';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ValidationResult {
  valid: boolean;
  cleanText: string;
  reason?: string;
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseScenarioPayload(raw: Record<string, unknown>): ScenarioPayload | null {
  const sc = raw.scenario;
  if (!sc || typeof sc !== 'object') return null;
  const s = sc as Record<string, unknown>;
  const params = (s.parameters && typeof s.parameters === 'object' ? s.parameters : {}) as Record<string, unknown>;
  const projections = Array.isArray(s.projections)
    ? s.projections.slice(0, 6).map((x) => {
        const p = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
        return { year: num(p.year), yield: num(p.yield), waterUse: num(p.waterUse), riskScore: num(p.riskScore) };
      }).filter((p) => p.year > 0)
    : [];
  if (projections.length === 0) return null;
  return {
    mode: 'scenario',
    scenario: {
      name: str(s.name, 120) || 'Custom scenario',
      location: str(s.location, 120) || 'Selected location',
      year: num(s.year),
      parameters: { rainfallDelta: num(params.rainfallDelta), salinityDelta: num(params.salinityDelta), awdAdoption: num(params.awdAdoption) },
      projections,
    },
    audience: str(raw.audience, 40) || 'farmer',
    language: str(raw.language, 20) || 'English',
  };
}

export function parsePayload(raw: unknown): AdvisorPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  if ((raw as Record<string, unknown>).mode === 'scenario') return parseScenarioPayload(raw as Record<string, unknown>);
  const rec = (raw as Record<string, unknown>).recommendation;
  if (!rec || typeof rec !== 'object') return null;
  const r = rec as Record<string, unknown>;
  const title = str(r.title, 200);
  if (!title) return null;

  return {
    recommendation: {
      title,
      confidence: num(r.confidence),
      uncertainty: num(r.uncertainty),
      expectedYield: num(r.expectedYield),
      expectedIncome: num(r.expectedIncome),
      waterSavings: num(r.waterSavings),
      reasoning: Array.isArray(r.reasoning)
        ? r.reasoning.slice(0, 8).map((x) => str(x, 300)).filter(Boolean)
        : [],
    },
    audience: str((raw as Record<string, unknown>).audience, 40) || 'farmer',
    language: str((raw as Record<string, unknown>).language, 20) || 'English',
  };
}

export function buildScenarioMessages(p: ScenarioPayload, isRetry = false) {
  const { scenario: sc } = p;
  const systemContent = [
    'You are a concise agricultural advisor for Mekong Delta farmers and officials.',
    'Explain what a what-if SIMULATION shows, plainly and honestly, in clear English under 120 words.',
    'Provide ONLY the final 4-part explanation using this exact structure:',
    '',
    'Scenario outcome: <One or two sentences on how yield, water use and risk change across the projected years, using ONLY the supplied numbers.>',
    'Why: <Which scenario settings (rainfall change, salinity increase, AWD adoption) plausibly drive that change. Stay general and do not invent numbers or mechanisms.>',
    'Main risk: <The primary risk visible in the supplied numbers, in cautious proportionate language.>',
    'Next step: <One practical action. Recommend consulting a qualified local agricultural extension officer before changing practices.>',
    '',
    'STRICT RULES:',
    '- Total response must be under 120 words.',
    '- Use ONLY the facts provided. Do not invent numbers, prices, rainfall data or guarantees.',
    '- State that these are simulated projections on demonstration data, not measurements or forecasts of real fields.',
    '- Never output chain-of-thought, scratchpads, planning notes, drafts or word counts.',
    '- Never begin with "Here\'s a thinking process", "Let me analyze", "Step-by-step reasoning", or "Draft".',
    '- Output ONLY the 4 required lines, starting immediately with "Scenario outcome:".',
  ].join('\n');

  const rows = sc.projections.map(
    (x) => `- ${x.year}: yield ${x.yield} t/ha; water use ${x.waterUse} m3/ha; risk score ${x.riskScore}/100`,
  );
  const userLines = [
    `Audience: ${p.audience}. Reply in ${p.language}.`,
    `Scenario: ${sc.name} at ${sc.location}, simulated from ${sc.year}.`,
    `Settings: rainfall change ${sc.parameters.rainfallDelta}%; salinity increase ${sc.parameters.salinityDelta} dS/m; AWD adoption ${sc.parameters.awdAdoption}%.`,
    'Projected results (simulated):',
    ...rows,
  ];
  if (isRetry) {
    userLines.push(
      '',
      'CRITICAL: Your previous response contained internal planning or lacked the exact 4-part structure.',
      'Output ONLY the final 4 lines now, starting directly with "Scenario outcome:". No preamble, no thinking process.',
    );
  }
  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: userLines.join('\n') },
  ];
}

export function buildMessages(p: AdvisorPayload, isRetry = false) {
  if (p.mode === 'scenario') return buildScenarioMessages(p, isRetry);
  const { recommendation: r } = p;

  const systemContent = [
    'You are a concise agricultural advisor for Mekong Delta farmers.',
    'Explain the decision engine recommendation plainly and honestly in clear English under 120 words.',
    'Provide ONLY the final 4-part explanation using this exact structure:',
    '',
    'Recommendation: <Restate the recommendation title verbatim. Do not change, rerank, or replace it.>',
    'Why: <Brief explanation using ONLY the supplied engine reasoning and metrics. Do not invent numbers or claims.>',
    'Main risk: <Cautious, evidence-grounded statement of the primary reported risk. If a reported value (e.g. soil salinity) exceeds a stated crop tolerance threshold, note this as "raising a significant concern about the variety\'s suitability for this field." Do not exaggerate to "severe crop failure", "devastating losses", or other unsupported severity claims. State only what the supplied evidence supports.>',
    'Next step: <One practical action supported by the evidence. Recommend consulting a qualified local agricultural extension officer to verify field conditions and crop suitability before transplanting. Do not invent unverified agronomic practices, flooding schedules, or soil amendment procedures.>',
    '',
    'STRICT RULES:',
    '- Total response must be under 120 words.',
    '- Use ONLY the facts provided in the prompt. Do not invent numbers, rainfall data, or financial guarantees.',
    '- Do not exaggerate risks or invent unsupported outcomes. Use cautious, proportionate language.',
    '- When a conflict exists between the recommendation and the evidence, clearly flag it without catastrophizing.',
    '- Do not alter or rerank the rule-based recommendation.',
    '- Never output chain-of-thought, scratchpads, planning notes, draft refinement, or word counts.',
    '- Never begin with "Here\'s a thinking process", "Let me analyze", "Step-by-step reasoning", or "Draft".',
    '- Do not reproduce prompt instructions or describe how the response was built.',
    '- Output ONLY the 4 required lines, starting immediately with "Recommendation:".',
  ].join('\n');

  const userLines = [
    `Audience: ${p.audience}. Reply in ${p.language}.`,
    `Recommendation: ${r.title}`,
    `Metrics: Expected yield ${r.expectedYield} t/ha; income uplift ${r.expectedIncome}M VND; water savings ${r.waterSavings}%; confidence ${r.confidence}% (uncertainty ${r.uncertainty}%)`,
    'Engine reasoning facts:',
    ...r.reasoning.map((x) => `- ${x}`),
  ];

  if (isRetry) {
    userLines.push(
      '',
      'CRITICAL: Your previous response contained internal planning or lacked the exact 4-part structure.',
      'Output ONLY the final 4 lines for the farmer now, starting directly with "Recommendation:". No preamble, no thinking process.'
    );
  }

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: userLines.join('\n') },
  ];
}

/**
 * Sanitizes and validates model output to ensure planning notes or chain-of-thought
 * are never presented to the farmer as final advice.
 */
export function sanitizeAndValidateAdvice(raw: unknown, lead = 'Recommendation'): ValidationResult {
  const leadPattern = lead.replace(/\s+/g, '\\s+');
  const leadHeader = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*)?${leadPattern}\\s*:\\s*(?:\\*\\*)?`, 'i');
  if (!raw || typeof raw !== 'string') {
    return { valid: false, cleanText: '', reason: 'empty_response' };
  }

  // 1. Strip HTML reasoning/scratchpad tags
  let text = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<scratchpad>[\s\S]*?<\/scratchpad>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .trim();

  // 2. Detect planning/scratchpad indicators
  const planningPatterns = [
    /here['’]?s\s+a\s+thinking\s+process/i,
    /thinking\s+process\s*:/i,
    /\bmental\s+refinement\b/i,
    /\bdeconstruct\s+(?:the\s+)?requirements\b/i,
    /\banalyze\s+user\s+(?:request|input)\b/i,
    /\bcheck\s+constraints\b/i,
    /\bword\s+count\s*:/i,
    /\bdraft\s+\d+\s*:/i,
    /step-by-step\s+reasoning/i,
  ];

  const hasPlanningMarker = planningPatterns.some((pattern) => pattern.test(text));

  // If planning markers exist at the start, check if an isolated clean 4-part block exists at the end
  if (hasPlanningMarker) {
    const recIndex = text.search(leadHeader);
    if (recIndex !== -1) {
      const candidate = text.slice(recIndex).trim();
      if (!planningPatterns.some((pattern) => pattern.test(candidate))) {
        text = candidate;
      }
    }
  }

  // Still contains planning notes?
  if (planningPatterns.some((pattern) => pattern.test(text))) {
    return { valid: false, cleanText: '', reason: 'contains_planning_notes' };
  }

  // Check for prompt template placeholder leakage
  if (/<\s*(?:Restate|Brief explanation|Honest statement|Give one practical action)[^>]*>/i.test(text)) {
    return { valid: false, cleanText: '', reason: 'contains_prompt_template_placeholders' };
  }

  // 3. Verify required 4-part structure
  const hasRec = leadHeader.test(text);
  const hasWhy = /(?:^|\n)\s*(?:\*\*)?Why\s*:\s*(?:\*\*)?/i.test(text);
  const hasRisk = /(?:^|\n)\s*(?:\*\*)?Main\s+risk\s*:\s*(?:\*\*)?/i.test(text);
  const hasNext = /(?:^|\n)\s*(?:\*\*)?Next\s+step\s*:\s*(?:\*\*)?/i.test(text);

  if (!hasRec || !hasWhy || !hasRisk || !hasNext) {
    return { valid: false, cleanText: '', reason: 'missing_required_structure' };
  }

  // 4. Normalize markdown bolding on headers for clean presentation
  const formatted = text
    .replace(new RegExp(`(?:^|\\n)\\s*\\*\\*${leadPattern}:\\*\\*\\s*`, 'gi'), `\n${lead}: `)
    .replace(/(?:^|\n)\s*\*\*Why:\*\*\s*/gi, '\nWhy: ')
    .replace(/(?:^|\n)\s*\*\*Main risk:\*\*\s*/gi, '\nMain risk: ')
    .replace(/(?:^|\n)\s*\*\*Next step:\*\*\s*/gi, '\nNext step: ')
    .trim();

  // 5. Ensure word count does not exceed limit
  const wordCount = formatted.split(/\s+/).filter(Boolean).length;
  if (wordCount > 150) {
    return { valid: false, cleanText: '', reason: 'exceeds_length_limit' };
  }

  return { valid: true, cleanText: formatted };
}

/**
 * Classify upstream HTTP errors into safe, user-facing categories.
 */
export function classifyUpstreamError(status: number): string {
  if (status === 401) return 'auth_invalid';
  if (status === 402) return 'quota_exhausted';
  if (status === 403) return 'access_denied';
  if (status === 404) return 'model_not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500 && status < 600) return 'provider_error';
  return 'upstream_error';
}

/**
 * Pasted secrets often arrive with surrounding quotes, whitespace/newlines or a
 * "Bearer " prefix, all of which make the provider answer 401. Strip them.
 */
export function cleanApiKey(raw: string | undefined): string {
  if (!raw) return '';
  let key = raw.trim();
  key = key.replace(/^["'`]+|["'`]+$/g, '').trim();
  key = key.replace(/^bearer\s+/i, '').trim();
  return key;
}

export function resolveProvider(): ProviderConfig | null {
  const explicit = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  const nebiusEnvKey = cleanApiKey(process.env.NEBIUS_API_KEY);
  const nvidiaEnvKey = cleanApiKey(process.env.NVIDIA_API_KEY);

  const nebiusKey = nebiusEnvKey && !nebiusEnvKey.startsWith('nvapi-')
    ? nebiusEnvKey
    : (explicit === 'nebius' ? nebiusEnvKey : '');
  const nvidiaKey = nvidiaEnvKey || (nebiusEnvKey?.startsWith('nvapi-') && explicit !== 'nebius' ? nebiusEnvKey : '');

  if (explicit === 'nebius' || (!explicit && nebiusKey)) {
    const key = nebiusEnvKey || nebiusKey;
    if (!key) return null;
    return {
      name: 'Nebius Token Factory',
      providerId: 'nebius',
      apiKey: key,
      baseUrl: (process.env.NEBIUS_BASE_URL || DEFAULT_NEBIUS_BASE_URL).replace(/\/+$/, ''),
      model: process.env.NEBIUS_MODEL || DEFAULT_NEBIUS_MODEL,
    };
  }

  if (explicit === 'nvidia' || (!explicit && nvidiaKey)) {
    const key = nvidiaKey || nvidiaEnvKey || nebiusEnvKey;
    if (!key) return null;
    return {
      name: 'NVIDIA API Catalog',
      providerId: 'nvidia',
      apiKey: key,
      baseUrl: (process.env.NVIDIA_BASE_URL || process.env.NEBIUS_BASE_URL || DEFAULT_NVIDIA_BASE_URL).replace(/\/+$/, ''),
      model: process.env.NVIDIA_MODEL || process.env.NEBIUS_MODEL || DEFAULT_NVIDIA_MODEL,
    };
  }

  const anyKey = nebiusEnvKey || nvidiaEnvKey;
  if (!anyKey) return null;

  const isNv = anyKey.startsWith('nvapi-') && explicit !== 'nebius';
  return {
    name: isNv ? 'NVIDIA API Catalog' : 'Nebius Token Factory',
    providerId: isNv ? 'nvidia' : 'nebius',
    apiKey: anyKey,
    baseUrl: isNv
      ? (process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_BASE_URL).replace(/\/+$/, '')
      : (process.env.NEBIUS_BASE_URL || DEFAULT_NEBIUS_BASE_URL).replace(/\/+$/, ''),
    model: isNv
      ? (process.env.NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL)
      : (process.env.NEBIUS_MODEL || DEFAULT_NEBIUS_MODEL),
  };
}

async function fetchUpstream(config: ProviderConfig, payload: AdvisorPayload, isRetry = false) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const requestBody: Record<string, unknown> = {
      model: config.model,
      messages: buildMessages(payload, isRetry),
      temperature: 0.1,
      max_tokens: 500,
    };

    // If using Nebius Token Factory with reasoning models, disable internal reasoning effort
    if (config.providerId === 'nebius') {
      requestBody.reasoning_effort = 'none';
    }

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return { ok: true as const, res };
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return { ok: false as const, isTimeout, err };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Ensure local env files are loaded in development if not already present in process.env
  const proc = process as unknown as { loadEnvFile?: (path?: string) => void };
  if (!process.env.NEBIUS_API_KEY && !process.env.NVIDIA_API_KEY && typeof proc.loadEnvFile === 'function') {
    try {
      proc.loadEnvFile('.env.local');
    } catch {
      try {
        proc.loadEnvFile('.env');
      } catch {
        // Ignored in deployed environments where env vars are injected by host
      }
    }
  }

  if (isRateLimited(clientKey(req))) {
    res.setHeader('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
    return res.status(429).json({ error: 'rate_limited_client' });
  }

  const config = resolveProvider();
  if (!config) {
    console.error('advisor: neither NEBIUS_API_KEY nor NVIDIA_API_KEY is configured');
    return res.status(503).json({ error: 'advisor_not_configured' });
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  if (body && body.length > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'payload_too_large' });
  }

  let payload: AdvisorPayload | null = null;
  try {
    const raw = typeof req.body === 'object' ? req.body : JSON.parse(body || '{}');
    payload = parsePayload(raw);
  } catch {
    payload = null;
  }
  if (!payload) return res.status(400).json({ error: 'invalid_payload' });

  // 1. Initial Upstream Attempt
  let attempt = await fetchUpstream(config, payload, false);
  if (!attempt.ok) {
    console.error('advisor upstream unreachable:', attempt.isTimeout ? 'timeout' : (attempt.err instanceof Error ? attempt.err.message : 'unknown'));
    return res.status(502).json({
      error: attempt.isTimeout ? 'upstream_timeout' : 'upstream_unreachable',
      provider: config.name,
      model: config.model,
    });
  }

  if (!attempt.res.ok) {
    const detail = (await attempt.res.text().catch(() => '')).slice(0, 300);
    const category = classifyUpstreamError(attempt.res.status);
    console.error(`advisor upstream error [${category}]`, attempt.res.status, detail);
    return res.status(502).json({
      error: category,
      status: attempt.res.status,
      model: config.model,
      provider: config.name,
      ...(exposeDiagnostics() ? { detail, host: new URL(config.baseUrl).host } : {}),
    });
  }

  let data = (await attempt.res.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let rawContent = data.choices?.[0]?.message?.content || '';
  const lead = payload.mode === 'scenario' ? 'Scenario outcome' : 'Recommendation';
  let validation = sanitizeAndValidateAdvice(rawContent, lead);

  // 2. Retry Attempt if initial output failed validation
  if (!validation.valid) {
    console.warn(`advisor output failed initial validation (${validation.reason}), attempting retry...`);
    attempt = await fetchUpstream(config, payload, true);
    if (attempt.ok && attempt.res.ok) {
      data = (await attempt.res.json().catch(() => ({}))) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      rawContent = data.choices?.[0]?.message?.content || '';
      validation = sanitizeAndValidateAdvice(rawContent, lead);
    }
  }

  // If still invalid after retry, return safe distinct error
  if (!validation.valid) {
    console.error(`advisor output failed validation after retry: ${validation.reason}`);
    return res.status(502).json({
      error: 'invalid_model_output',
      provider: config.name,
      model: config.model,
      ...(exposeDiagnostics() ? { detail: `Model output failed validation: ${validation.reason}` } : {}),
    });
  }

  // The prompt asks the model to say the figures are simulated; guarantee it regardless of model behaviour.
  let advice = validation.cleanText;
  if (payload.mode === 'scenario' && !/simulat/i.test(advice)) {
    advice += '\nNote: these are simulated projections on demonstration data, not measurements.';
  }

  return res.status(200).json({
    advice,
    model: config.model,
    provider: config.name,
  });
}
