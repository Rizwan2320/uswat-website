-- identity 0001: the faculty portal's own schema (ADR-0020). Not a Payload migration.
-- Applied by apps/web/scripts/identity-migrate.mjs, never by the CMS build (ADR-0005).
-- Tables for the library come from its own schema compiler (docs/evidence/FP0/scripts/gen-schema.mjs,
-- better-auth 1.7.18); the two tables at the end are ours.
create schema identity;
set local search_path to identity;

create table "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null, "twoFactorEnabled" boolean);

create table "session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade);

create table "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "passkey" ("id" text not null primary key, "name" text, "publicKey" text not null, "userId" text not null references "user" ("id") on delete cascade, "credentialID" text not null, "counter" integer not null, "deviceType" text not null, "backedUp" boolean not null, "transports" text, "createdAt" timestamptz, "aaguid" text);

create table "twoFactor" ("id" text not null primary key, "secret" text not null, "backupCodes" text not null, "userId" text not null references "user" ("id") on delete cascade, "verified" boolean, "failedVerificationCount" integer, "lockedUntil" timestamptz);

create index "session_userId_idx" on "session" ("userId");

create index "account_userId_idx" on "account" ("userId");

create index "verification_identifier_idx" on "verification" ("identifier");

create index "passkey_userId_idx" on "passkey" ("userId");

create index "passkey_credentialID_idx" on "passkey" ("credentialID");

create index "twoFactor_secret_idx" on "twoFactor" ("secret");

create index "twoFactor_userId_idx" on "twoFactor" ("userId");

-- Ours: TOTP once-only set (AUTH-04). Holds a SHA-256 of account and code, never the code.
create table "totp_replay" ("key" text not null primary key, "usedAt" timestamptz not null);
create index "totp_replay_usedAt_idx" on "totp_replay" ("usedAt");

-- Ours: recovery codes, salted SHA-256 only (AUTH-05).
create table "recovery_code" ("id" text not null primary key, "userId" text not null references "user" ("id") on delete cascade, "salt" text not null, "hash" text not null, "usedAt" timestamptz, "createdAt" timestamptz default CURRENT_TIMESTAMP not null);
create index "recovery_code_userId_idx" on "recovery_code" ("userId");

create table "migrations" ("name" text not null primary key, "appliedAt" timestamptz default CURRENT_TIMESTAMP not null);
