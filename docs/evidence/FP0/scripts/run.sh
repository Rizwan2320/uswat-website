#!/usr/bin/env bash
# usage: run.sh <required|default> <port>
set -u
cd "$(dirname "$0")"
MODE=$1; PORT=$2
psql -h 127.0.0.1 -p 5544 -U postgres -d fp0 -qc 'drop schema if exists identity cascade; create schema identity;' 2>&1 | grep -v NOTICE
PGOPTIONS='-c search_path=identity' psql -h 127.0.0.1 -p 5544 -U postgres -d fp0 -q -v ON_ERROR_STOP=1 -f out/identity-up.sql || exit 1
export BETTER_AUTH_SECRET=$(openssl rand -hex 32) UV_MODE=$MODE PORT=$PORT
node server.mjs > out/server-$MODE.log 2>&1 & SPID=$!
sleep 3
node test.mjs 2>&1 | tee out/test-$MODE.log
kill $SPID 2>/dev/null
