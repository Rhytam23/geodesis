import type { AgentEvent, AgentRequest } from '../types/agent';

export class AgentError extends Error {
  /** Machine-readable reason code from the backend, or "network" / "stream_ended". */
  public readonly reason: string;

  constructor(reason: string) {
    super(`Geodesis Agent unavailable: ${reason}`);
    this.name = 'AgentError';
    this.reason = reason;
  }
}

export function friendlyAgentError(reason: string): string {
  switch (reason) {
    case 'agent_not_configured':
      return 'The agent is not configured on this deployment. The simulation and recommendations still work.';
    case 'rate_limited_client':
      return 'Too many requests in a short time. Please wait a minute and try again.';
    case 'invalid_payload':
    case 'payload_too_large':
      return 'The agent could not read that request. Try a shorter question.';
    case 'invalid_model_output':
      return 'The models did not return an answer that passed verification. Please try again.';
    case 'cancelled':
      return 'The run was cancelled.';
    case 'network':
      return 'Network problem while contacting the agent. Check your connection and try again.';
    default:
      return 'The agent is temporarily unavailable. The simulation and recommendations are unaffected.';
  }
}

/** Splits a newline-delimited JSON stream into events, tolerating arbitrary chunk boundaries. */
export function createNdjsonParser(onEvent: (event: AgentEvent) => void) {
  let buffer = '';
  const emitLine = (line: string) => {
    if (!line) return;
    try {
      onEvent(JSON.parse(line) as AgentEvent);
    } catch {
      // A malformed line must not break the rest of the stream.
    }
  };
  return {
    push(chunk: string) {
      buffer += chunk;
      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        emitLine(buffer.slice(0, newline).trim());
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf('\n');
      }
    },
    flush() {
      emitLine(buffer.trim());
      buffer = '';
    },
  };
}

/**
 * Runs the Geodesis Agent (POST /api/agent) and reports each progress event as it streams in.
 * Resolves after the final `result` or `error` event; rejects with AgentError when the
 * request itself fails.
 */
export async function runAgent(
  request: AgentRequest,
  onEvent: (event: AgentEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new AgentError('network');
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new AgentError(body.error ?? `http_${res.status}`);
  }

  let finished = false;
  const parser = createNdjsonParser((event) => {
    if (event.type === 'result' || event.type === 'error') finished = true;
    onEvent(event);
  });

  if (!res.body) {
    parser.push(await res.text());
    parser.flush();
  } else {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.push(decoder.decode(value, { stream: true }));
      }
      parser.push(decoder.decode());
      parser.flush();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new AgentError('network');
    }
  }

  if (!finished) throw new AgentError('stream_ended');
}
