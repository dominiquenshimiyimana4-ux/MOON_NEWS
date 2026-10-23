-- ============================================================================
--  Moon News — Visitor Analytics schema
--  Target: PostgreSQL 14+
--
--  Design notes / privacy
--  ----------------------
--  * We store an OPAQUE, rotating visitor id — never an IP address, never a raw
--    cookie value, never a user id unless the visitor chose to sign in.
--  * Location is stored at country/city granularity only, and only when it can
--    be derived legally (e.g. from the CDN edge). It is optional.
--  * Rows are aggregated/rolled up and can be swept by retention policy.
--  * The `visits` table is append-only and partitioned by month so it scales to
--    millions of page views: inserts stay fast and old partitions can be
--    dropped/archived without a vacuum of a giant table.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. visitors — one row per unique visitor identity
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitors (
    id              BIGSERIAL      PRIMARY KEY,
    -- Opaque token: HMAC(server_secret, daily_salt + client_fingerprint).
    -- Rotated daily so it cannot be used to track a person across days.
    visitor_id      TEXT           NOT NULL,
    first_visit     TIMESTAMPTZ    NOT NULL DEFAULT now(),
    last_visit      TIMESTAMPTZ    NOT NULL DEFAULT now(),
    -- Coarse, optional, privacy-preserving geo. NULL unless lawful.
    country         TEXT,
    city            TEXT,
    -- Denormalised counters to keep dashboard reads cheap.
    total_visits    INTEGER        NOT NULL DEFAULT 0,
    is_returning    BOOLEAN        NOT NULL DEFAULT FALSE,
    UNIQUE (visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors (last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_first_visit ON visitors (first_visit DESC);

-- ---------------------------------------------------------------------------
-- 2. visits — append-only page-view log, partitioned by month
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visits (
    id              BIGSERIAL,
    visitor_id      TEXT           NOT NULL,
    session_id      TEXT           NOT NULL,
    page            TEXT           NOT NULL,
    source          TEXT           NOT NULL DEFAULT 'direct',
    device          TEXT           NOT NULL CHECK (device IN ('desktop','mobile','tablet')),
    browser         TEXT           NOT NULL DEFAULT 'unknown',
    os              TEXT           NOT NULL DEFAULT 'unknown',
    country         TEXT,
    city            TEXT,
    first_visit     TIMESTAMPTZ    NOT NULL DEFAULT now(),
    last_visit      TIMESTAMPTZ    NOT NULL DEFAULT now(),
    -- Denormalised day bucket (UTC) for fast daily uniques.
    visit_date      DATE           NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
    PRIMARY KEY (id, visit_date)
) PARTITION BY RANGE (visit_date);

-- Helper: create one monthly partition (call from a cron/job).
CREATE OR REPLACE FUNCTION create_visits_partition(target DATE)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    start_date DATE := date_trunc('month', target)::date;
    end_date   DATE := (date_trunc('month', target) + interval '1 month')::date;
    part_name  TEXT := format('visits_%s', to_char(start_date, 'YYYY_MM'));
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF visits FOR VALUES FROM (%L) TO (%L)',
        part_name, start_date, end_date
    );
END;
$$;

-- Bootstrap the current + next month so inserts never fail.
SELECT create_visits_partition(now()::date);
SELECT create_visits_partition((now() + interval '1 month')::date);

CREATE INDEX IF NOT EXISTS idx_visits_visit_date   ON visits (visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_date ON visits (visitor_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_page         ON visits (page);
CREATE INDEX IF NOT EXISTS idx_visits_source       ON visits (source);

-- ---------------------------------------------------------------------------
-- 3. daily_rollup — pre-aggregated daily numbers for the dashboard
--    (uniques, page views, new vs returning, per page/source/device)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_rollup (
    visit_date      DATE    PRIMARY KEY,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    page_views      INTEGER NOT NULL DEFAULT 0,
    new_visitors    INTEGER NOT NULL DEFAULT 0,
    returning       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_rollup_breakdown (
    visit_date  DATE NOT NULL,
    dimension   TEXT NOT NULL CHECK (dimension IN ('page','source','device','browser','os','article')),
    key         TEXT NOT NULL,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    page_views      INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (visit_date, dimension, key)
);

-- ---------------------------------------------------------------------------
-- 4. online_now — a tiny, self-pruning "who is active" table
--    Rows older than the window are deleted on every heartbeat write, so the
--    table stays small and the "Online now" count is a cheap COUNT(*).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS online_now (
    session_id  TEXT        PRIMARY KEY,
    visitor_id  TEXT        NOT NULL,
    page        TEXT        NOT NULL,
    last_seen   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_online_last_seen ON online_now (last_seen DESC);

-- ---------------------------------------------------------------------------
-- 5. Ingestion: record a visit WITHOUT double-counting refreshes.
--    A visit is only inserted when the visitor has no visit recorded in the
--    last `p_dedupe_minutes` (default 30 min) for the same page. Refreshing or
--    reopening the page inside that window updates last_visit instead.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_visit(
    p_visitor_id TEXT,
    p_session_id TEXT,
    p_page       TEXT,
    p_source     TEXT,
    p_device     TEXT,
    p_browser    TEXT,
    p_os         TEXT,
    p_country    TEXT DEFAULT NULL,
    p_city       TEXT DEFAULT NULL,
    p_dedupe_minutes INTEGER DEFAULT 30
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_is_new       BOOLEAN := FALSE;
    v_recent_count INTEGER;
BEGIN
    -- Upsert the visitor identity.
    INSERT INTO visitors (visitor_id, country, city)
    VALUES (p_visitor_id, p_country, p_city)
    ON CONFLICT (visitor_id) DO UPDATE
        SET last_visit = now(),
            total_visits = visitors.total_visits + 1,
            country = COALESCE(visitors.country, EXCLUDED.country),
            city    = COALESCE(visitors.city, EXCLUDED.city)
    RETURNING (first_visit = last_visit) INTO v_is_new;

    UPDATE visitors SET is_returning = NOT v_is_new WHERE visitor_id = p_visitor_id;

    -- De-duplicate: same visitor + same page within the window => not a new view.
    SELECT count(*) INTO v_recent_count
    FROM visits
    WHERE visitor_id = p_visitor_id
      AND page = p_page
      AND last_visit > now() - make_interval(mins => p_dedupe_minutes);

    IF v_recent_count = 0 THEN
        INSERT INTO visits (
            visitor_id, session_id, page, source, device, browser, os,
            country, city, first_visit, last_visit, visit_date
        ) VALUES (
            p_visitor_id, p_session_id, p_page, p_source, p_device, p_browser, p_os,
            p_country, p_city, now(), now(), (now() AT TIME ZONE 'UTC')::date
        );
    END IF;

    -- Heartbeat for the live "online now" counter.
    INSERT INTO online_now (session_id, visitor_id, page)
    VALUES (p_session_id, p_visitor_id, p_page)
    ON CONFLICT (session_id) DO UPDATE SET last_seen = now(), page = EXCLUDED.page;

    DELETE FROM online_now WHERE last_seen < now() - interval '2 minutes';

    RETURN v_recent_count = 0;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. Dashboard queries (used by the API layer)
-- ---------------------------------------------------------------------------

-- Unique visitors for an arbitrary window.
CREATE OR REPLACE FUNCTION unique_visitors_between(p_from DATE, p_to DATE)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT count(DISTINCT visitor_id)::int
    FROM visits
    WHERE visit_date BETWEEN p_from AND p_to;
$$;

-- Everyone currently online (active within the window).
CREATE OR REPLACE FUNCTION online_count(p_window_seconds INTEGER DEFAULT 120)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT count(*)::int
    FROM online_now
    WHERE last_seen > now() - make_interval(secs => p_window_seconds);
$$;

-- Daily series for the traffic chart.
CREATE OR REPLACE FUNCTION visitors_daily(p_days INTEGER DEFAULT 30)
RETURNS TABLE (visit_date DATE, unique_visitors INT, page_views INT) LANGUAGE sql STABLE AS $$
    SELECT d::date,
           count(DISTINCT visitor_id)::int,
           count(*)::int
    FROM generate_series(now()::date - (p_days - 1), now()::date, interval '1 day') AS d
    LEFT JOIN visits ON visits.visit_date = d::date
    GROUP BY d
    ORDER BY d;
$$;

-- Top pages / sources / devices. `p_dimension` must be a whitelisted column.
CREATE OR REPLACE FUNCTION top_dimension(p_dimension TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE (key TEXT, unique_visitors INT, page_views INT) LANGUAGE plpgsql STABLE AS $$
BEGIN
    IF p_dimension NOT IN ('page','source','device','browser','os','country','city') THEN
        RAISE EXCEPTION 'Invalid dimension: %', p_dimension;
    END IF;
    RETURN QUERY EXECUTE format(
        'SELECT %I::text AS key,
                count(DISTINCT visitor_id)::int AS unique_visitors,
                count(*)::int AS page_views
         FROM visits
         WHERE visit_date >= now()::date - ($1 - 1)
         GROUP BY 1
         ORDER BY page_views DESC',
        p_dimension
    ) USING p_days;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. Retention: privacy-friendly by default — keep raw visits 90 days, then
--    rely on daily_rollup. Run nightly.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prune_old_visits(p_keep_days INTEGER DEFAULT 90)
RETURNS void LANGUAGE sql AS $$
    DELETE FROM visits WHERE visit_date < now()::date - p_keep_days;
$$;
