import fs from 'node:fs'
import { getMigrations } from 'better-auth/db/migration'
import { authOptions, pool } from './auth.mjs'
const { compileMigrations, toBeCreated, toBeAdded } = await getMigrations(authOptions)
console.error('tables to create:', toBeCreated.map(t => t.table).join(', '))
const sql = await compileMigrations()
fs.writeFileSync('out/identity-up.sql', sql + '\n')
console.error('sql bytes', sql.length)
await pool.end()
