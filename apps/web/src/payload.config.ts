import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { en } from 'payload/i18n/en'
import { completeUrdu, urAdminLanguage, urTranslations } from './i18n/ur'

import { AffiliatedColleges } from './collections/AffiliatedColleges'
import { ArticleTags } from './collections/ArticleTags'
import { AuditLogs } from './collections/AuditLogs'
import { Campuses } from './collections/Campuses'
import { Departments } from './collections/Departments'
import { FacultyGroups } from './collections/FacultyGroups'
import { Offices } from './collections/Offices'
import { People } from './collections/People'
import { Programmes } from './collections/Programmes'
import { ContactDirectory } from './collections/ContactDirectory'
import { Events } from './collections/Events'
import { Jobs } from './collections/Jobs'
import { MeritLists } from './collections/MeritLists'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Notices } from './collections/Notices'
import { Pages } from './collections/Pages'
import { Tenders } from './collections/Tenders'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { canRunJobs } from './governance/jobAccess'
import { lifecycleSweepTask } from './governance/jobs'
import { governancePlugin } from './governance/plugin'
import { folderAccessOverride, GLOBAL_ACCESS } from './governance/staffAccess'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { env } from './env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const built = buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The editor dashboard (CMS-09): my drafts, review queue, expiring soon, stale, needs alt.
      beforeDashboard: ['@/admin/EditorDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    // Schema changes ship as reviewed migrations with a down step (plan MIG-04).
    // Never rely on dev-mode push: it prompts interactively when columns move.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // Locales are fixed before any data exists. Adding or renaming them later forces
  // risky column moves (see docs/evidence/G0/spike-report.md item 6).
  i18n: {
    fallbackLanguage: 'en',
    // Urdu is not one of Payload's accepted admin languages, so the type is cast (see src/i18n/ur.ts).
    supportedLanguages: { en, ur: urAdminLanguage } as never,
    translations: {
      ...({ ur: urTranslations } as object),
      en: {
        error: {
          // Payload's own text says "you must be logged in" even to a signed-in auditor who may only read.
          unauthorized:
            'Not allowed. You are signed out, or your role does not let you do this. Sign in again, or ask the site manager if you think it should.',
        },
      },
    },
  },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Urdu', code: 'ur', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    AffiliatedColleges,
    ArticleTags,
    ContactDirectory,
    MeritLists,
    Notices,
    Events,
    Jobs,
    Tenders,
    FacultyGroups,
    Departments,
    Programmes,
    Offices,
    Campuses,
    People,
    AuditLogs,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [...plugins, governancePlugin],
  // Write paths go through REST and the admin only, where draft versus unpublish is visible to
  // the policy hook (docs/adr/0010). Nothing in the site uses GraphQL.
  graphQL: { disable: true },
  folders: { collectionOverrides: [folderAccessOverride] },
  secret: env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => canRunJobs(req, env.CRON_SECRET),
    },
    tasks: [lifecycleSweepTask],
  },
})

// Payload adds the job-stats global while sanitising, after plugins have run, so its access rule
// is applied to the finished config here (see staffAccess.ts).
export default built.then((config) => {
  const stats = config.globals?.find((g) => g.slug === 'payload-jobs-stats')
  if (stats) stats.access = { ...stats.access, ...GLOBAL_ACCESS['payload-jobs-stats'] }
  completeUrdu(config)
  return config
})
