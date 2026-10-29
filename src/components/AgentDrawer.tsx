import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, MinusCircle, Sparkles, X } from 'lucide-react';
import { AgentError, friendlyAgentError, runAgent } from '../services/agentClient';
import type {
  AgentContext,
  AgentEvent,
  AgentLanguage,
  AgentStepInfo,
  AnswerBasis,
} from '../types/agent';

type ResultEvent = Extract<AgentEvent, { type: 'result' }>;
type TraceStep = AgentStepInfo & { seenAt: number };
type Run =
  | { status: 'idle' }
  | { status: 'running'; steps: TraceStep[] }
  | { status: 'done'; steps: TraceStep[]; result: ResultEvent }
  | { status: 'error'; steps: TraceStep[]; message: string };

const SUGGESTIONS = [
  'Should I switch to a salt-tolerant rice variety this season?',
  'Is alternate wetting and drying worth it under this scenario?',
  'What are the biggest risks here over the next three years?',
];

const BASIS: Record<AnswerBasis, { label: string; hint: string; className: string }> = {
  engine: { label: 'Twin / engine', hint: 'From the simulated twin state or the rule-based recommendation', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  forecast: { label: 'Live forecast', hint: 'From the live Open-Meteo 16-day forecast', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  evidence: { label: 'Web evidence', hint: 'From a numbered source retrieved by Tavily this run', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  assumption: { label: 'Model judgement', hint: 'Not backed by a retrieved source', className: 'bg-amber-50 text-amber-800 border-amber-200' },
};

function upsertStep(steps: TraceStep[], step: AgentStepInfo): TraceStep[] {
  const i = steps.findIndex((s) => s.key === step.key);
  if (i === -1) return [...steps, { ...step, seenAt: Date.now() }];
  const next = steps.slice();
  next[i] = { ...step, seenAt: steps[i].seenAt };
  return next;
}

function seconds(ms?: number): string {
  if (ms === undefined) return '';
  return ms < 950 ? `${Math.max(1, Math.round(ms))} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function useTicker(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

function StepIcon({ status }: { status: AgentStepInfo['status'] }) {
  if (status === 'running') return <Loader2 className="h-4 w-4 animate-spin text-emerald-600" aria-hidden />;
  if (status === 'done') return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />;
  if (status === 'failed') return <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />;
  return <MinusCircle className="h-4 w-4 text-slate-400" aria-hidden />;
}

function Trace({ steps, now }: { steps: TraceStep[]; now: number }) {
  return (
    <ol className="space-y-2.5" aria-label="Agent run trace">
      {steps.map((s) => (
        <li key={s.key} className="flex gap-2.5">
          <div className="mt-0.5 shrink-0"><StepIcon status={s.status} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-medium text-slate-900">{s.label}</span>
              <span className="text-[11px] text-slate-500">
                {s.actor && (
                  <span className={s.actorKind === 'model' ? 'font-mono text-emerald-700' : ''} title={s.actor}>
                    {s.actor}
                  </span>
                )}
                {s.actor && ' · '}
                {s.status === 'running' ? `${seconds(now - s.seenAt)}…` : seconds(s.durationMs)}
                {s.tokens ? ` · ${s.tokens.prompt + s.tokens.completion} tokens` : ''}
              </span>
            </div>
            {s.detail && <div className="text-xs text-slate-600">{s.detail}</div>}
            {s.items && s.items.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {s.items.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function CiteChips({ cites, onJump }: { cites: number[]; onJump: (id: number) => void }) {
  return (
    <>
      {cites.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onJump(id)}
          className="rounded border border-emerald-200 bg-white px-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
          aria-label={`Jump to source ${id}`}
        >
          [{id}]
        </button>
      ))}
    </>
  );
}

function Answer({ result, flashId, onJump }: { result: ResultEvent; flashId: number | null; onJump: (id: number) => void }) {
  const { answer, sources, forecast, models, corrections, totalMs } = result;
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-slate-900">{answer.headline}</h3>
          <span
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
            title="Confidence reflects the evidence found, and is capped at medium because the twin inputs are simulated."
          >
            {answer.confidence} confidence
          </span>
        </div>
      </div>

      <section aria-label="Recommended actions">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">What to do</h4>
        <ol className="space-y-2.5">
          {answer.actions.map((a, i) => (
            <li key={a.step} className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">{a.step}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-slate-600">{a.why}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${BASIS[a.basis].className}`} title={BASIS[a.basis].hint}>
                      {BASIS[a.basis].label}
                    </span>
                    <CiteChips cites={a.cites} onJump={onJump} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Risks">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Risks and mitigations</h4>
        <ul className="space-y-2">
          {answer.risks.map((r) => (
            <li key={r.risk} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs leading-relaxed">
              <div className="font-medium text-slate-900">{r.risk} <CiteChips cites={r.cites} onJump={onJump} /></div>
              <div className="mt-0.5 text-slate-600">{r.mitigation}</div>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        <span className="font-semibold">What this cannot tell you: </span>
        {answer.limits}
      </div>

      {forecast && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3 text-xs text-sky-900">
          <span className="font-semibold">Live forecast used (Open-Meteo, {forecast.days} days): </span>
          {forecast.rainTotalMm} mm rain over {forecast.rainyDays} rainy days · {forecast.minTempC} to {forecast.maxTempC} °C
          {forecast.et0TotalMm !== null ? ` · ${forecast.et0TotalMm} mm evapotranspiration` : ''}
        </div>
      )}

      <section aria-label="Sources">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Sources retrieved with Tavily ({sources.length})
        </h4>
        {sources.length === 0 ? (
          <p className="text-xs text-slate-500">No web sources were retrieved for this run, so no claim above is labelled as web evidence.</p>
        ) : (
          <ol className="space-y-2">
            {sources.map((s) => (
              <li
                key={s.id}
                id={`agent-source-${s.id}`}
                className={`rounded-2xl border p-3 text-xs transition-colors ${flashId === s.id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1 font-medium text-slate-900 hover:text-emerald-700"
                >
                  <span className="text-emerald-700">[{s.id}]</span> {s.title}
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                </a>
                <div className="text-[11px] text-slate-500">{s.domain}{s.publishedDate ? ` · ${s.publishedDate}` : ''}</div>
                <p className="mt-1 line-clamp-3 leading-relaxed text-slate-600">{s.snippet}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {corrections.length > 0 && (
        <div className="text-[11px] leading-relaxed text-slate-500">
          <span className="font-semibold">Verifier corrections: </span>
          {corrections.join('; ')}.
        </div>
      )}

      <div className="border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
        Planner <span className="font-mono">{models.planner}</span> · Reasoner <span className="font-mono">{models.reasoner}</span> · served by
        Nebius Token Factory · {(totalMs / 1000).toFixed(1)} s end to end. Decision support only: confirm with your local
        agricultural extension officer before changing practice.
      </div>
    </div>
  );
}

interface AgentDrawerProps {
  context: AgentContext;
  onClose: () => void;
}

export default function AgentDrawer({ context, onClose }: AgentDrawerProps) {
  const [question, setQuestion] = useState(SUGGESTIONS[0]);
  const [language, setLanguage] = useState<AgentLanguage>('English');
  const [run, setRun] = useState<Run>({ status: 'idle' });
  const [flashId, setFlashId] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const running = run.status === 'running';
  const now = useTicker(running);

  const close = useCallback(() => {
    abortRef.current?.abort();
    onClose();
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      abortRef.current?.abort();
    };
  }, [close]);

  useEffect(() => {
    if (run.status === 'done') resultRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [run.status, reduceMotion]);

  const onEvent = useCallback((event: AgentEvent) => {
    setRun((prev) => {
      const steps = 'steps' in prev ? prev.steps : [];
      if (event.type === 'step') return prev.status === 'running' ? { status: 'running', steps: upsertStep(steps, event.step) } : prev;
      if (event.type === 'result') return { status: 'done', steps, result: event };
      return { status: 'error', steps, message: friendlyAgentError(event.error) };
    });
  }, []);

  const start = async () => {
    const text = question.trim();
    if (text.length < 5 || running) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setRun({ status: 'running', steps: [] });
    try {
      await runAgent({ question: text, language, context }, onEvent, controller.signal);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = friendlyAgentError(err instanceof AgentError ? err.reason : 'unknown');
      setRun((prev) => ({ status: 'error', steps: 'steps' in prev ? prev.steps : [], message }));
    }
  };

  const jumpToSource = (id: number) => {
    document.getElementById(`agent-source-${id}`)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setFlashId(id);
    window.setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), 1400);
  };

  const { scenario } = context;
  return (
    <div className="fixed inset-0 z-[2000]">
      <div className="absolute inset-0 bg-slate-900/30" onClick={close} aria-hidden />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-title"
        initial={reduceMotion ? false : { x: 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="absolute right-0 top-0 flex h-full w-full max-w-[620px] flex-col bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="agent-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden /> Geodesis Agent
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Plans the research, pulls live evidence, reasons with Nemotron on Nebius Token Factory, then verifies every citation.
            </p>
          </div>
          <button onClick={close} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close agent">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-24 pt-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{context.location.name} · {context.year}</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">SIMULATED INPUTS</span>
            </div>
            <div className="mt-1">
              Salinity {context.metrics.salinity} dS/m · yield {context.metrics.yield} t/ha · risk {context.metrics.riskScore}/100
              {scenario && <> · rainfall {scenario.rainfallDelta}% · salinity +{scenario.salinityDelta} · AWD {scenario.awdAdoption}%</>}
            </div>
          </div>

          <div>
            <label htmlFor="agent-question" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Your question
            </label>
            <textarea
              id="agent-question"
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) start();
              }}
              rows={2}
              className="w-full resize-none rounded-2xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              disabled={running}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuestion(s)}
                  disabled={running}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="inline-flex rounded-full border border-slate-200 p-0.5 text-xs" role="group" aria-label="Answer language">
                {(['English', 'Vietnamese'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    disabled={running}
                    aria-pressed={language === l}
                    className={`rounded-full px-3 py-1 font-medium ${language === l ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {l === 'English' ? 'English' : 'Tiếng Việt'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={start}
                disabled={running || question.trim().length < 5}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
                {running ? 'Agent working…' : run.status === 'idle' ? 'Run agent' : 'Run again'}
              </button>
            </div>
          </div>

          {run.status !== 'idle' && (
            <section aria-live="polite" aria-label="Agent progress">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Run trace: which model or tool does what</h3>
              <Trace steps={run.steps} now={now} />
            </section>
          )}

          {run.status === 'error' && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">{run.message}</div>
          )}

          {run.status === 'done' && (
            <div ref={resultRef} className="border-t border-slate-200 pt-5">
              <Answer result={run.result} flashId={flashId} onJump={jumpToSource} />
            </div>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
