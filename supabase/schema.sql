-- Verified Homeowner CRM Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (profiles for Supabase Auth users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'wholesaler' CHECK (role IN ('admin', 'wholesaler')),
  plan_type VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'elite', 'pro')),
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive')),
  lead_sequence_position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads table (master list)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name VARCHAR(255),
  phone VARCHAR(50),
  property_address VARCHAR(500),
  city VARCHAR(255),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  mailing_address VARCHAR(500),
  mailing_city VARCHAR(255),
  mailing_state VARCHAR(100),
  mailing_zip VARCHAR(20),
  sequence_number INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User leads (assigned leads with status and action)
CREATE TABLE user_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'called', 'follow_up', 'not_interested')),
  action VARCHAR(50) NOT NULL DEFAULT 'call_now' CHECK (action IN ('call_now', 'pending')),
  assigned_at TIMESTAMP DEFAULT NOW(),
  last_called_at TIMESTAMP,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lead_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_plan ON users(plan_type);
CREATE INDEX idx_leads_sequence ON leads(sequence_number);
CREATE INDEX idx_user_leads_user_id ON user_leads(user_id);
CREATE INDEX idx_user_leads_status ON user_leads(status);
CREATE INDEX idx_user_leads_action ON user_leads(action);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_leads_updated_at BEFORE UPDATE ON user_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, plan_type, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    CASE 
      WHEN NEW.email = 'admin@verifiedhomeowner.com' THEN 'admin'
      ELSE 'wholesaler'
    END,
    CASE 
      WHEN NEW.email = 'admin@verifiedhomeowner.com' THEN 'elite'
      ELSE 'free'
    END,
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
