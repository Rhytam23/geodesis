# Database Design — MEKONG SMART LAND SYSTEM

## v1.0 (Current)

**No persistent database required.**  
All state is ephemeral or stored in browser (localStorage for demo preferences only).

Demonstration data lives in `src/data/mockData.ts`.

---

## Planned Production Schema (v1.1+)

We recommend **PostgreSQL + PostGIS + TimescaleDB** for time-series satellite/weather data.

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('farmer','cooperative','government','researcher')),
  phone TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);
```

#### farms
```sql
CREATE TABLE farms (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  area_ha NUMERIC,
  current_crop TEXT,
  province TEXT,
  district TEXT,
  created_at TIMESTAMPTZ
);
```

#### weather_observations
```sql
CREATE TABLE weather_observations (
  id BIGSERIAL,
  farm_id UUID,
  timestamp TIMESTAMPTZ,
  temp_c NUMERIC,
  rainfall_mm NUMERIC,
  humidity NUMERIC,
  source TEXT,
  PRIMARY KEY (farm_id, timestamp)
);
```

#### soil_samples
```sql
CREATE TABLE soil_samples (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID,
  sampled_at TIMESTAMPTZ,
  salinity_ds_m NUMERIC,
  ph NUMERIC,
  organic_matter NUMERIC,
  source TEXT
);
```

#### recommendations
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  farm_id UUID,
  generated_at TIMESTAMPTZ,
  crop TEXT,
  confidence INTEGER,
  expected_yield NUMERIC,
  expected_profit NUMERIC,
  full_reasoning JSONB,
  uncertainty NUMERIC,
  last_updated TIMESTAMPTZ
);
```

#### market_prices
```sql
CREATE TABLE market_prices (
  id BIGSERIAL,
  crop TEXT,
  province TEXT,
  price_vnd NUMERIC,
  timestamp TIMESTAMPTZ,
  source TEXT
);
```

#### alerts
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  province TEXT,
  level TEXT,
  message TEXT,
  affected_ha NUMERIC,
  created_at TIMESTAMPTZ,
  dispatched BOOLEAN DEFAULT false
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ
);
```

### Indexes (Critical)
```sql
CREATE INDEX idx_farms_location ON farms USING GIST (ST_MakePoint(lng, lat));
CREATE INDEX idx_weather_ts ON weather_observations (timestamp DESC);
CREATE INDEX idx_recs_farm ON recommendations (farm_id, generated_at DESC);
```

### Relationships
- `users` 1:N `farms`
- `farms` 1:N `weather_observations`, `soil_samples`, `recommendations`
- `recommendations` references `market_prices` via JSON or separate join table

### Migration Strategy
- Use `dbmate` or Prisma migrations
- Seed with realistic Mekong data from `mockData.ts` + public MARD reports
- Time-series tables partitioned by month using TimescaleDB

### Future Extensions
- `satellite_layers` (raster references)
- `cooperative_memberships`
- `subsidy_claims`
- `sms_deliveries`

---

**Schema Version**: 0.3 (production target for v1.1)