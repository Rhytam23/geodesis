import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Layers, Shield, Sparkles, TrendingUp, Users } from 'lucide-react';

// Tailwind only generates classes it can read as whole strings, so these cannot be built from a colour name.
const PERSONA_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
  amber: 'bg-amber-100 text-amber-700',
};

export default function LandingPage() {
  const stats = [
    { value: '25 yrs', label: 'Simulated climate timeline', unit: '2026 to 2050, drag it' },
    { value: '16 days', label: 'Live forecast per question', unit: 'Open-Meteo, exact coordinates' },
    { value: '2 models', label: 'Nemotron planner and reasoner', unit: 'on Nebius Token Factory' },
    { value: '4 labels', label: 'Where each claim comes from', unit: 'engine, forecast, evidence, assumption' },
  ];

  const features = [
    { icon: Sparkles, title: 'Geodesis Agent', desc: 'Plans its research, pulls a live forecast and web evidence, reasons with NVIDIA Nemotron on Nebius Token Factory, then checks every citation in code.' },
    { icon: Layers, title: 'Interactive digital twin', desc: 'Click the map, drag the 2026 to 2050 timeline and run what-if scenarios for rainfall, salinity and AWD adoption. The twin data is simulated and labelled.' },
    { icon: Globe, title: 'Explainable decisions', desc: 'A rule-based engine shows confidence, reasoning and supporting datasets for every recommendation. No black box, no trained model.' },
    { icon: Users, title: 'Role-specific dashboards', desc: 'Views for farmers, cooperatives, government agencies and researchers.' },
    { icon: TrendingUp, title: 'Economic model', desc: 'Revenue, cost, profit, ROI and payback for each recommendation, with the formulas visible.' },
    { icon: Shield, title: 'Honest by design', desc: 'Simulated values are labelled, the agent says what it cannot know, and the limitations are published in the README.' },
  ];

  const personas = [
    { role: 'Farmer', title: 'Nguyen Van Minh', subtitle: 'Chau Doc, An Giang', link: '/dashboards/farmer', color: 'emerald' },
    { role: 'Cooperative', title: 'Kien Giang Rice Coop', subtitle: '167k ha under management', link: '/dashboards/cooperative', color: 'blue' },
    { role: 'Government', title: 'MARD — Ministry', subtitle: 'Policy & Provincial Coordination', link: '/dashboards/government', color: 'violet' },
    { role: 'Researcher', title: 'Can Tho University', subtitle: 'Climate & Agronomy Research', link: '/dashboards/researcher', color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden border-b bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(#14532D_0.5px,transparent_1px)] bg-[length:5px_5px] opacity-[0.035]"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2 animate-pulse"></div>
              Built for the Nebius × NVIDIA Global AI Hackathon
            </div>

            <h1 className="text-5xl sm:text-[68px] font-semibold tracking-tighter leading-none mb-6">Geodesis</h1>
            <p className="text-2xl text-slate-600 tracking-tight mb-3">A climate digital twin and research agent for Mekong Delta rice farming</p>
            <p className="text-xl text-slate-500 max-w-xl">
              Pick a province, run a salinity or drought scenario, then ask the agent what to plant. It cites the evidence it used and tells you what it cannot know.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Link
                to="/workspace"
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 h-14 bg-primary hover:bg-emerald-900 active:bg-emerald-950 transition-all text-white font-semibold rounded-3xl text-lg shadow-sm"
              >
                Open the workspace <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/mission-control"
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 h-14 border border-slate-300 hover:bg-slate-50 font-medium rounded-3xl text-lg"
              >
                Mission Control overview
              </Link>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-slate-500">
              Demonstration platform · Twin data is simulated · The agent makes live model, search and forecast calls ·{' '}
              <a
                href="https://github.com/Rhytam23/geodesis#limitations-and-known-failure-cases"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700"
              >
                Read the limitations
              </a>
            </p>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="border-t bg-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <div className="text-4xl sm:text-5xl font-semibold tracking-tighter text-primary">{stat.value}</div>
                <div>
                  <div className="font-medium text-slate-700">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex items-center gap-4 mb-9">
          <div className="uppercase tracking-[2px] text-xs font-semibold text-primary">Core Capabilities</div>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="group p-7 border border-slate-200 hover:border-emerald-200 bg-white rounded-3xl transition-all">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-2xl mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xl mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How the agent answers */}
      <div className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
          <div className="flex flex-wrap gap-4 justify-between items-end mb-8">
            <div>
              <div className="text-xs tracking-[1px] font-semibold text-emerald-700">HOW THE AGENT ANSWERS</div>
              <div className="text-3xl sm:text-5xl font-semibold tracking-tight mt-1">Five steps, all visible in the run trace</div>
            </div>
            <Link to="/workspace" className="text-sm font-medium flex items-center gap-1 text-primary hover:underline">
              Try it in the workspace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              'Read the twin state',
              'Plan searches (Nemotron)',
              'Gather forecast and web evidence',
              'Reason (largest Nemotron)',
              'Verify citations (code)',
            ].map((step, idx) => (
              <div key={step} className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl">
                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-primary text-white text-xs flex items-center justify-center font-mono">{idx + 1}</div>
                <div className="font-medium text-sm leading-tight">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Personas */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="mb-9">
          <div className="uppercase tracking-wider text-xs text-slate-500 mb-1">BUILT FOR EVERY STAKEHOLDER</div>
          <div className="text-3xl sm:text-5xl font-semibold tracking-tighter">Dedicated workflows for 4 user roles</div>
          <div className="text-sm text-slate-500 mt-2">The people shown are illustrative demo personas.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((persona) => (
            <Link
              to={persona.link}
              key={persona.role}
              className="group border border-slate-200 bg-white hover:border-slate-300 px-8 py-7 rounded-3xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className={`inline-block text-xs font-semibold tracking-[1px] rounded-full px-3 py-1 mb-5 ${PERSONA_STYLES[persona.color]}`}>
                  {persona.role.toUpperCase()}
                </div>
                <div className="font-semibold tracking-tight text-xl group-hover:text-emerald-700 transition-colors">{persona.title}</div>
                <div className="text-sm text-slate-500 mt-0.5">{persona.subtitle}</div>
              </div>
              <div className="mt-auto pt-6 text-xs flex items-center gap-2 text-emerald-700 font-medium">
                OPEN DASHBOARD <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="bg-primary text-white rounded-3xl px-9 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-white/70 text-sm font-medium">TRY IT</div>
            <div className="text-3xl font-semibold tracking-tighter mt-1">Ask the agent about a province.</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/workspace" className="bg-white hover:bg-slate-100 active:bg-white px-7 py-3 text-primary font-semibold rounded-3xl">Open the workspace</Link>
            <Link to="/gis-map" className="bg-white/10 hover:bg-white/20 border border-white/30 px-7 py-3 text-white font-medium rounded-3xl">Open Interactive Map</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
