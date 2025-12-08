
-- NextAuth.js Tables
CREATE TABLE users
(
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  email         TEXT,
  email_verified TIMESTAMP WITH TIME ZONE,
  image         TEXT,
  role          TEXT DEFAULT 'USER'
);

CREATE TABLE accounts
(
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               TEXT NOT NULL,
  provider           TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token      TEXT,
  access_token       TEXT,
  expires_at         BIGINT,
  token_type         TEXT,
  scope              TEXT,
  id_token           TEXT,
  session_state      TEXT,

  CONSTRAINT provider_unique UNIQUE (provider, provider_account_id)
);

CREATE TABLE sessions
(
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires      TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE verification_tokens
(
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMP WITH TIME ZONE NOT NULL,
  
  CONSTRAINT verification_token_unique UNIQUE (identifier, token)
);
