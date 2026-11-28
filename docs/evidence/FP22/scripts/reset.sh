#!/usr/bin/env bash
# Local only: rebuild the scratch portal database fp20 with a head account (linked to sample-person-02, the person who will leave)
# and a Registrar account; put sample-person-02 in the scratch CMS database back to "current" with contact details.
# Run from apps/web with the portal env loaded.
set -euo pipefail
export PGPASSWORD=postgres
psql -h 127.0.0.1 -p 5544 -U postgres -qc "drop database if exists fp20" -c "create database fp20"
npx tsx scripts/identity-migrate.ts up | tail -1 | cut -c1-40
for e in fp22.head@example.invalid fp22.reg@example.invalid; do npx tsx ../../docs/evidence/FP7/scripts/seed-user.ts $e 'Sample-Pass-Phrase-77' | tail -1 >/dev/null; done
npx tsx scripts/identity-roles.ts set-department fp22.head@example.invalid "Department of Computer Science" >/dev/null
npx tsx scripts/identity-roles.ts grant-head fp22.head@example.invalid >/dev/null
npx tsx scripts/identity-roles.ts set-department fp22.reg@example.invalid "Registrar’s Office" >/dev/null
npx tsx scripts/identity-roles.ts grant-verifier fp22.reg@example.invalid >/dev/null
psql -h 127.0.0.1 -p 5544 -U postgres -d fp20 -qc "insert into identity.account_status (\"userId\",\"status\",\"recordRef\") select id,'active','sample-person-02' from identity.\"user\" where email='fp22.head@example.invalid'"
psql -h 127.0.0.1 -p 5544 -U postgres -d cmsdemo -qc "update people set faculty_status='current', email='sample.person02@example.invalid', visibility_email='public', office_location='Block B, room 4', office_hours='Mon and Wed 10:00 to 12:00' where slug='sample-person-02'"
psql -h 127.0.0.1 -p 5544 -U postgres -d cmsdemo -Atc "select slug, faculty_status, email, office_location from people where slug='sample-person-02'"
