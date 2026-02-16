#!/usr/bin/env tsx
/**
 * Sync Google Sheet → Supabase CRM
 * Deletes all existing records, then inserts fresh from Sheet
 */

import { exec as execCb } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execCb)

const SUPABASE_PROJECT = 'yheiafezylbdtivpgver'
const SUPABASE_TOKEN = 'sbp_fecaf09f2d78656bb4785fce860ba2c31c2fec3f'
const SHEET_ID = '1EaRV5UH8IcvQ4g3S10U_gR2SMzaxP4aYqoh1rU0bHvs'
const RANGE = 'Sheet1!A2:J1359' // skip header

type SheetRow = [string, string, string, string, string, string, string, string, string, string]

async function sqlQuery(sql: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SQL failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function readSheet(): Promise<SheetRow[]> {
  const { stdout } = await exec(`gog sheets get ${SHEET_ID} "${RANGE}" --json`)
  const data = JSON.parse(stdout)
  return data.values as SheetRow[]
}

async function loadLinkedInUrls(): Promise<Map<string, string>> {
  const fs = await import('fs/promises')
  const path = '/Users/hendrikdewinne/.openclaw/workspace/data/linkedin-connections-ranked.json'
  const data = await fs.readFile(path, 'utf-8')
  const list: Array<{ name: string; url: string }> = JSON.parse(data)
  const map = new Map<string, string>()
  for (const item of list) {
    map.set(item.name.trim().toLowerCase(), item.url)
  }
  return map
}

function parseScore(notes: string): number {
  const m = notes.match(/Score:(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

function parseTier(notes: string): string | null {
  const m = notes.match(/Tier:([A-D])/i)
  return m ? m[1].toUpperCase() : null
}

function parseConnectedDate(notes: string): string | null {
  const m = notes.match(/Connected:\s*(\d{1,2}\s+\w+\s+\d{4})/i)
  if (!m) return null
  // Parse "12 Jun 2023" → ISO date
  const d = new Date(m[1])
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function parseDm1Date(notes: string): string | null {
  const m = notes.match(/DM1 sent\s+(\w+\s+\d{1,2})/i)
  if (!m) {
    // Also check "DM1 sent Feb 16"
    const m2 = notes.match(/DM1 sent\s+(\w+\s+\d{1,2})/i)
    if (m2) {
      const d = new Date(`${m2[1]} 2025`) // assume current year
      return isNaN(d.getTime()) ? null : d.toISOString()
    }
    return null
  }
  const d = new Date(`${m[1]} 2025`)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function mapStatus(rawStatus: string): string {
  const s = rawStatus.trim().toLowerCase()
  if (s === 'connected') return 'connected'
  if (s === 'dm1 sent') return 'contacted'
  if (s === 'replied') return 'conversation'
  if (s === 'in behandeling') return 'new'
  return 'new'
}

function escapeSQL(s: string): string {
  return s.replace(/'/g, "''")
}

async function main() {
  console.log('🚀 Starting CRM sync...')

  // 1. Load LinkedIn URLs
  const urlMap = await loadLinkedInUrls()
  console.log(`📎 Loaded ${urlMap.size} LinkedIn URLs`)

  // 2. Read sheet
  const rows = await readSheet()
  console.log(`📋 Read ${rows.length} rows from Google Sheet`)

  // 3. Parse into contacts
  const contacts: any[] = []
  for (const row of rows) {
    const [name, title, company, location, status, nextStep, notes, dm1Draft, dm2Draft, email] = row
    if (!name) continue

    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const score = parseScore(notes || '')
    const tier = parseTier(notes || '')
    const connectedAt = parseConnectedDate(notes || '')
    const dm1Date = parseDm1Date(notes || '')

    const mappedStatus = mapStatus(status || '')
    const lastContactedAt = dm1Date
    const lastResponseAt = mappedStatus === 'conversation' ? dm1Date : null

    const tags: string[] = []
    if (tier) tags.push(`tier_${tier}`)
    if ((notes || '').toLowerCase().includes('dm1 sent')) tags.push('dm1_sent')
    if (mappedStatus === 'conversation') tags.push('replied')
    if (email) tags.push('has_email')

    const linkedinUrl = urlMap.get(name.trim().toLowerCase()) || null

    const fullNotes = [notes, nextStep].filter(Boolean).join('\n\n').trim() || null

    contacts.push({
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      company: company || null,
      title: title || null,
      location: location || '',
      linkedin_url: linkedinUrl,
      status: mappedStatus,
      lead_score: score,
      tags,
      notes: fullNotes,
      last_contacted_at: lastContactedAt,
      last_response_at: lastResponseAt,
      source: 'linkedin',
    })
  }

  console.log(`✅ Parsed ${contacts.length} contacts`)

  // 4. Delete all existing records
  console.log('🗑️  Deleting existing records...')
  await sqlQuery('DELETE FROM crm_contacts')
  console.log('✅ Deleted')

  // 5. Insert in batches of 50
  const BATCH_SIZE = 50
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE)
    const values = batch
      .map((c) => {
        const tagsSQL = c.tags.length > 0 ? `ARRAY[${c.tags.map((t: string) => `'${escapeSQL(t)}'`).join(',')}]` : 'NULL'
        return `(
          '${escapeSQL(c.first_name)}',
          '${escapeSQL(c.last_name)}',
          ${c.email ? `'${escapeSQL(c.email)}'` : 'NULL'},
          ${c.company ? `'${escapeSQL(c.company)}'` : 'NULL'},
          ${c.title ? `'${escapeSQL(c.title)}'` : 'NULL'},
          ${c.location ? `'${escapeSQL(c.location)}'` : 'NULL'},
          ${c.linkedin_url ? `'${escapeSQL(c.linkedin_url)}'` : 'NULL'},
          '${c.source}',
          '${c.status}',
          ${c.lead_score},
          ${tagsSQL},
          ${c.notes ? `'${escapeSQL(c.notes)}'` : 'NULL'},
          ${c.last_contacted_at ? `'${c.last_contacted_at}'` : 'NULL'},
          ${c.last_response_at ? `'${c.last_response_at}'` : 'NULL'}
        )`
      })
      .join(',')

    const sql = `
      INSERT INTO crm_contacts (
        first_name, last_name, email, company, title, location, linkedin_url,
        source, status, lead_score, tags, notes, last_contacted_at, last_response_at
      ) VALUES ${values}
    `

    await sqlQuery(sql)
    console.log(`📦 Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`)
  }

  // 6. Verify count
  const { data } = await sqlQuery('SELECT COUNT(*) as count FROM crm_contacts')
  const count = data?.[0]?.count || 0
  console.log(`\n✅ Sync complete! ${count} contacts in Supabase`)
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
