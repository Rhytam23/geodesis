# Project Structure Guide

```
geodesis/
├── .github/                     # GitHub Workflows & Issue Templates
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   ├── workflows/ci.yml         # CI pipeline
│   ├── CODEOWNERS               # Code ownership declaration
│   └── PULL_REQUEST_TEMPLATE.md # PR guidelines template
├── api/                         # OpenAPI contracts
├── docs/                        # Project documentation & Wiki
│   └── wiki/                    # GitHub Wiki pages
├── public/                      # Static assets (favicons, icons)
├── src/                         # Source codebase
│   ├── components/              # React components (workspace, dashboards, shared)
│   ├── context/                 # Application contexts (Scenario, Timeline, Role)
│   ├── domain/                  # Domain-Driven models and domain logic
│   ├── hooks/                   # Custom React hooks (useGeodesisTwin, useLocationData)
│   ├── integrations/            # External integration adapters
│   ├── pages/                   # Top-level page views (Workspace, SmartMap, etc.)
│   ├── services/                # Decision engine & service clients
│   ├── styles/                  # Design tokens and global CSS
│   └── types/                   # TypeScript interfaces
├── tests/                       # Vitest test suite
├── .env.example                 # Environment variable reference template
├── LICENSE                      # MIT Open Source License
├── package.json                 # Project dependencies & scripts
├── README.md                    # Primary repository overview
└── vite.config.ts               # Vite build configuration
```
