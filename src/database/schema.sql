-- =====================================================================
-- ResQAI — AI-Powered Emergency Response & Resource Coordination Platform
-- PostgreSQL / Supabase Complete Database Schema & RLS Policies
-- =====================================================================

-- Enable PostGIS / UUID extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OPERATORS TABLE
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'OPERATOR' CHECK (role IN ('OPERATOR', 'DISPATCHER', 'COMMANDER', 'ADMIN')),
    organization VARCHAR(255) DEFAULT 'City Emergency Command Center',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('FIRE', 'ACCIDENT', 'FLOOD', 'BUILDING_DAMAGE', 'MEDICAL', 'OTHER')),
    status VARCHAR(50) DEFAULT 'REPORTED' CHECK (status IN (
        'REPORTED', 'ANALYZING', 'VERIFICATION_REQUIRED', 'ACTIVE',
        'DISPATCHED', 'RESPONDERS_EN_ROUTE', 'ON_SCENE', 'RESOLVED', 'CLOSED'
    )),
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    severity_score NUMERIC(5, 2) DEFAULT 50.00,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    estimated_affected INTEGER DEFAULT 1,
    ai_confidence NUMERIC(4, 3) DEFAULT 0.85,
    ai_summary TEXT,
    report_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_coords ON incidents(latitude, longitude);

-- 3. REPORTS TABLE (Zero-login citizen reports)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(20) UNIQUE NOT NULL,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    emergency_type VARCHAR(50) NOT NULL CHECK (emergency_type IN ('FIRE', 'ACCIDENT', 'FLOOD', 'BUILDING_DAMAGE', 'MEDICAL', 'OTHER')),
    description TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address TEXT NOT NULL,
    voice_transcript TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    anonymous_session_id VARCHAR(100) NOT NULL,
    in_danger BOOLEAN DEFAULT false,
    people_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_incident_id ON reports(incident_id);
CREATE INDEX IF NOT EXISTS idx_reports_anonymous_session ON reports(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- 4. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('IMAGE', 'VIDEO', 'AUDIO')),
    storage_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_report_id ON evidence(report_id);

-- 5. AI ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
    classification VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    confidence NUMERIC(4, 3) NOT NULL,
    affected_estimate INTEGER NOT NULL,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    summary TEXT NOT NULL,
    recommended_resources JSONB DEFAULT '[]'::jsonb,
    recommended_route JSONB DEFAULT '{}'::jsonb,
    human_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_assessments_incident_id ON ai_assessments(incident_id);

-- 6. RESOURCES TABLE (Emergency Fleet & Units)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('AMBULANCE', 'FIRE_UNIT', 'RESCUE_UNIT', 'POLICE_UNIT', 'TRAFFIC_UNIT', 'MEDICAL_TEAM')),
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'UNAVAILABLE')),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    heading NUMERIC(5, 2) DEFAULT 0,
    capacity INTEGER DEFAULT 4,
    organization VARCHAR(255) DEFAULT 'City Emergency Service',
    current_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);

-- 7. RESOURCE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS resource_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
    assigned_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'EN_ROUTE' CHECK (status IN ('PENDING', 'ACCEPTED', 'EN_ROUTE', 'ON_SCENE', 'COMPLETED', 'CANCELLED')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    arrived_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_assignments_incident ON resource_assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_assignments_resource ON resource_assignments(resource_id);

-- 8. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address TEXT NOT NULL,
    emergency_capacity INTEGER DEFAULT 50,
    available_capacity INTEGER DEFAULT 20,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CRITICAL_CAPACITY', 'DIVERTING', 'CLOSED')),
    specialties JSONB DEFAULT '["TRAUMA_L1", "BURN_UNIT", "ICU", "PEDIATRIC"]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. INCIDENT TIMELINE TABLE
CREATE TABLE IF NOT EXISTS incident_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_incident_id ON incident_timeline(incident_id, created_at ASC);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id VARCHAR(255) NOT NULL,
    operator_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous Citizens can insert reports & evidence without auth
CREATE POLICY "Public report insert policy" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public report read policy" ON reports FOR SELECT USING (true);
CREATE POLICY "Public evidence insert policy" ON evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Public evidence read policy" ON evidence FOR SELECT USING (true);

-- Authenticated Operators have full access to incidents & resources
CREATE POLICY "Public read for active incident public status" ON incidents FOR SELECT USING (true);
CREATE POLICY "Public read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Public read hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Public read timeline" ON incident_timeline FOR SELECT USING (true);
