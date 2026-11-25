import type { SiteImage } from './types'

/* "Our Alumni": graduates whose thesis or research is shown on the landing page, each linking to the work.
   EVERY ENTRY BELOW IS SAMPLE: the names, photographs (supplied by the owner as stand-ins on 2026-11-24), departments,
   years and research are invented to test the layout, and the screen says so. Nothing here is information about a real
   graduate. Real entries need the graduate's written consent, the department's confirmation of the thesis, and a source.
   `url` is for a real work held elsewhere (a repository, journal or PDF): when it is set the card opens it directly;
   without it the card opens this site's own page for the work, `/alumni/research/{slug}`. */

export type AlumniWork = {
  slug: string
  name: string
  /** Department and year, as printed under the name. */
  department: string
  year: number
  /** The headline: the title of the thesis or research. */
  title: string
  /** One sentence for the card. */
  summary: string
  /** Paragraphs of the abstract, for the work's own page. */
  abstract: string[]
  keywords: string[]
  photo: SiteImage
  /** Where the full work lives, when it is held elsewhere (https only). */
  url?: string
  sample: boolean
}

export const alumniWorks: AlumniWork[] = [
  {
    slug: 'landslide-risk-swat-valley',
    name: 'Zeeshan Ahmad',
    department: 'Department of Computer and Software Technologies',
    year: 2025,
    title: 'Predicting Landslide Risk in the Swat Valley from Satellite Images',
    summary: 'A machine-learning model that flags steep slopes at risk after heavy rain.',
    abstract: [
      'Heavy monsoon rain and steep slopes make landslides a recurring danger for roads and villages in the Swat valley. This sample thesis trains an image model on satellite scenes and rainfall records to mark slopes that are likely to fail.',
      'The model is compared with a simple slope-and-rainfall rule. The sample result is that the image model finds more of the slopes that later failed, with fewer false alarms along the main road. The work ends with a short guide for district staff on reading the risk map.',
    ],
    keywords: ['Machine learning', 'Satellite images', 'Landslides', 'Swat valley'],
    photo: { src: '/images/alumni/zeeshan-ahmad.webp', alt: 'Portrait of a young man with dark curly hair and a beard, in a black suit and tie', width: 640, height: 640 },
    sample: true,
  },
  {
    slug: 'groundwater-recharge-swat-river',
    name: 'Hamza Yousafzai',
    department: 'Department of Geology',
    year: 2025,
    title: 'Mapping Groundwater Recharge Zones Along the Swat River',
    summary: 'A map of where rain and river water soak into the ground, built from field data and GIS.',
    abstract: [
      'Wells in the valley depend on water that soaks in along the river and its terraces. This sample thesis combines rock and soil type, slope, land use and rainfall in a GIS to rank the ground by how well it lets water in.',
      'Field checks at sample well sites are used to test the map. The work suggests which stretches of the river bank are worth protecting from building, and which are poor places to expect new wells to fill.',
    ],
    keywords: ['Groundwater', 'GIS', 'Geology', 'Swat River'],
    photo: { src: '/images/alumni/hamza-yousafzai.webp', alt: 'Portrait of a smiling young man with wavy brown hair and a short beard, in a navy suit and tie', width: 640, height: 640 },
    sample: true,
  },
  {
    slug: 'microplastics-swat-river',
    name: 'Taimoor Khan',
    department: 'Department of Environmental Sciences',
    year: 2025,
    title: 'Microplastics in the Swat River: Where They Come From and How Much There Is',
    summary: 'Water samples along the river, and what nearby residents know about plastic waste.',
    abstract: [
      'Plastic waste that breaks into small pieces ends up in rivers and the animals that live in them. This sample thesis counts microplastic particles in water taken at several points along the river and traces the most likely sources.',
      'A short household survey asks nearby residents how they dispose of plastic. The sample finding is that the counts rise below market towns, and that most households have no regular collection. The work closes with low-cost steps a municipality could take.',
    ],
    keywords: ['Microplastics', 'Water quality', 'Waste', 'Survey'],
    photo: { src: '/images/alumni/taimoor-khan.webp', alt: 'Portrait of a smiling young man with wavy light-brown hair, in a navy jacket and open-collar white shirt', width: 640, height: 640 },
    sample: true,
  },
]

export const alumniWorkPath = '/alumni/research'
export const alumniWorkHref = (w: Pick<AlumniWork, 'slug' | 'url'>) => w.url ?? `${alumniWorkPath}/${encodeURIComponent(w.slug)}`
export const getAlumniWork = (slug: string) => alumniWorks.find((w) => w.slug === slug)
