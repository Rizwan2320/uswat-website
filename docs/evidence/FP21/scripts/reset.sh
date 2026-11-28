#!/usr/bin/env bash
# Local only: rebuild the scratch portal database fp20 with one head account linked to sample-person-02, and put the SQL-filled
# baseline back on that Sample person in the scratch CMS database. Run from apps/web with the portal env loaded.
set -euo pipefail
export PGPASSWORD=postgres
psql -h 127.0.0.1 -p 5544 -U postgres -qc "drop database if exists fp20" -c "create database fp20"
npx tsx scripts/identity-migrate.ts up | tail -1 | cut -c1-40
npx tsx ../../docs/evidence/FP7/scripts/seed-user.ts fp20.head@example.invalid 'Sample-Pass-Phrase-77' | tail -1 >/dev/null
npx tsx scripts/identity-roles.ts set-department fp20.head@example.invalid "Department of Computer Science" >/dev/null
npx tsx scripts/identity-roles.ts grant-head fp20.head@example.invalid >/dev/null
psql -h 127.0.0.1 -p 5544 -U postgres -d fp20 -qc "insert into identity.account_status (\"userId\",\"status\",\"recordRef\") select id,'active','sample-person-02' from identity.\"user\" where email='fp20.head@example.invalid'"
npx tsx ../../scripts/portal-people-sample-fill.ts | python3 -c "
import json,sys,subprocess
for s in json.load(sys.stdin):
    if 'sample-person-02' in s: subprocess.run(['psql','-h','127.0.0.1','-p','5544','-U','postgres','-d','cmsdemo','-qc',s],check=True)"
psql -h 127.0.0.1 -p 5544 -U postgres -d cmsdemo -qc "update people set cv_link = null where slug='sample-person-02'" -c "delete from people_publications where _parent_id=(select id from people where slug='sample-person-02')" 2>&1 | tail -1
psql -h 127.0.0.1 -p 5544 -U postgres -d cmsdemo -qc "update people set office_location=null, office_hours=null, orcid=null, scholar_url=null where slug='sample-person-02'" -c "delete from people_research_interests where _parent_id=(select id from people where slug='sample-person-02')"
