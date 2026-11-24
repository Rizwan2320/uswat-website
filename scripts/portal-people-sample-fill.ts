/**
 * Fills the 14 Sample People records (slugs sample-person-01 to 14) with realistic invented content, so the public
 * people pages can be judged on something that looks like a real directory. Prints a JSON array of SQL statements
 * (one transaction's worth); it never connects to a database.
 *
 *   pnpm tsx scripts/portal-people-sample-fill.ts > fill.json     then run each statement on a LOCAL or PREVIEW database.
 *
 * Everything here is invented. The records keep their `sample.invalid` source, so every page shows the Sample label.
 * Not for production: the production database holds no Sample people (ADR-0026 locks).
 */
type Fill = { n: string; name: string; designation: string; about: string[]; email: boolean; papers: { title: string; url?: string }[] }

const bio = (subject: string, focus: string): string[] => [
  `Sample biography. Teaches ${subject} and supervises undergraduate and postgraduate projects. This text is invented for layout testing.`,
  `Sample research note. Current interests include ${focus}. Not information about a real person.`,
]

const fills: Fill[] = [
  { n: '01', name: 'Prof. Dr. Nasir Khalil', designation: 'Professor', about: bio('physics', 'solid state physics and renewable energy materials'), email: true, papers: [{ title: 'Sample paper: Thin films for low-cost solar cells' }, { title: 'Sample paper: Heat transfer in layered materials', url: 'https://example.org/sample-paper' }] },
  { n: '02', name: 'Dr. Amina Rauf', designation: 'Associate Professor', about: bio('organic chemistry', 'green solvents and natural product extraction'), email: true, papers: [{ title: 'Sample paper: Plant extracts as mild catalysts' }, { title: 'Sample paper: Water-based reactions at room temperature' }] },
  { n: '03', name: 'Dr. Farhan Yousafzai', designation: 'Assistant Professor', about: bio('software engineering and databases', 'software testing, requirements and open data'), email: true, papers: [{ title: 'Sample paper: Test design for small teams' }, { title: 'Sample paper: A survey of requirements tools' }, { title: 'Sample paper: Open data portals in practice' }] },
  { n: '04', name: 'Prof. Dr. Shahida Perveen', designation: 'Professor', about: bio('mathematics', 'differential equations and numerical methods'), email: false, papers: [{ title: 'Sample paper: Stability of a family of numerical schemes' }, { title: 'Sample paper: Boundary value problems on graphs' }] },
  { n: '05', name: 'Dr. Imtiaz Wazir', designation: 'Associate Professor', about: bio('English literature and language teaching', 'postcolonial fiction and classroom language'), email: true, papers: [{ title: 'Sample paper: Voices of the valley in modern fiction' }] },
  { n: '06', name: 'Dr. Mehwish Aslam', designation: 'Assistant Professor', about: bio('modern history', 'local archives and oral history'), email: false, papers: [{ title: 'Sample paper: Reading district records as sources' }, { title: 'Sample paper: Memory and migration in the north' }] },
  { n: '07', name: 'Prof. Dr. Rehmat Ullah', designation: 'Professor', about: bio('economics', 'development economics and regional trade'), email: true, papers: [{ title: 'Sample paper: Small business credit in rural districts' }, { title: 'Sample paper: Tourism income and local prices' }] },
  { n: '08', name: 'Mr. Salman Afridi', designation: 'Lecturer', about: bio('business administration', 'entrepreneurship and small enterprises'), email: false, papers: [] },
  { n: '09', name: 'Mr. Waqar Hussain', designation: 'Registrar (Sample)', about: ['Sample entry for the Registrar role. Invented for layout testing.'], email: true, papers: [] },
  { n: '10', name: 'Ms. Nargis Bibi', designation: 'Librarian (Sample)', about: ['Sample entry for the Librarian role. Invented for layout testing.'], email: false, papers: [] },
  { n: '11', name: 'Prof. Dr. Zubair Ahmad', designation: 'Professor', about: bio('computer science', 'distributed systems and information security'), email: true, papers: [{ title: 'Sample paper: Consensus on unreliable networks' }, { title: 'Sample paper: Passkeys in campus systems' }, { title: 'Sample paper: Logging that survives failure' }] },
  { n: '12', name: 'Dr. Sadia Karim', designation: 'Associate Professor', about: bio('artificial intelligence and data science', 'language models for Pashto and Urdu text'), email: true, papers: [{ title: 'Sample paper: A small corpus for Pashto news' }, { title: 'Sample paper: Evaluating Urdu summaries' }] },
  { n: '13', name: 'Dr. Tahir Orakzai', designation: 'Assistant Professor', about: bio('computer networks', 'wireless sensing and low-power links'), email: false, papers: [{ title: 'Sample paper: Low-power links in hill terrain' }] },
  { n: '14', name: 'Ms. Rabia Noor', designation: 'Lecturer', about: bio('programming and web development', 'accessible interfaces and learning tools'), email: true, papers: [] },
]

const q = (s: string) => `'${s.replace(/'/g, "''")}'`
const parent = (n: string) => `(select id from people where slug = 'sample-person-${n}')`
const out: string[] = []
for (const f of fills) {
  out.push(`update people_locales set name = ${q(f.name)}, designation = ${q(f.designation)}, details = ${q(f.about.join('\n\n'))} where _locale = 'en' and _parent_id = ${parent(f.n)}`)
  out.push(`update people set visibility_email = ${f.email ? "'public'" : "'hidden'"}, updated_at = now() where slug = 'sample-person-${f.n}'`)
  out.push(`delete from people_publications where _parent_id = ${parent(f.n)}`)
  f.papers.forEach((p, i) =>
    out.push(`insert into people_publications (_order, _parent_id, id, title, url) values (${i + 1}, ${parent(f.n)}, 'sample-${f.n}-${i + 1}', ${q(p.title)}, ${p.url ? q(p.url) : 'null'})`),
  )
}
console.log(JSON.stringify(out))
