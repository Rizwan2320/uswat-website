import type { IconTitled } from '../academics/types'
import { officeBanner, officeHero } from '../offices/art'
import type { Source } from '../offices/types'

/* Facts for /about and /about/vice-chancellors-message. Every line comes from the register copies of two pages of the university's own site
   (read 2026-11-22 from the owner's Drive; the copies were crawled on 2026-11-06). Nothing is added from memory (CLAUDE.md rule 3).
   Where the copy is cut off or says two things, it is listed in `openPoints` and left out of the page. */

export const ABOUT_PATH = '/about'
export const MESSAGE_PATH = '/about/vice-chancellors-message'

const ABOUT_SOURCE: Source = { label: 'About University, University of Swat', url: 'https://uswat.edu.pk/about-university/' }
const MESSAGE_SOURCE: Source = { label: 'Vice Chancellor’s Message, University of Swat', url: 'https://uswat.edu.pk/vice-chancellors-message-2/' }

export const VERIFIED_AT = '2026-11-06'

export const ABOUT = {
  banner: officeBanner('about', 'About the University of Swat. History, vision and mission.'),
  hero: officeHero('about'),
  lead: 'A public-sector university in Swat, Khyber Pakhtunkhwa. Its story, its vision and its mission.',
  motto: 'Aspiring for Quality Education with Relevance',
  stats: [
    { value: 2010, label: 'university established' },
    { value: 7, label: 'departments in the first session, 2010‑11' },
    { value: 27, label: 'departments since' },
    { value: 2, label: 'new campuses: Woman Campus and Shangla Campus' },
  ],
  /** The history, oldest first. `when` is written the way the university’s page gives it (some entries have no day). */
  story: [
    { when: '29 May 2010', text: 'The then Prime Minister of Pakistan announced the establishment of the University of Swat during his visit to the Swat valley.' },
    { when: 'July 2010', text: 'The university came into formal existence by order of the Governor of Khyber Pakhtunkhwa, with the prior approval of the President of Pakistan.' },
    { when: 'August 2010', text: 'Dr. Muhammad Farooq Khan (Shaheed) was appointed the first Vice Chancellor.' },
    { when: 'Session 2010‑11', text: 'In its first academic session the university launched 7 departments. The Higher Education Department had handed over two buildings at Saidu Sharif, Swat (the page gives no date for the handover).' },
    { when: 'Since then', text: 'The number of departments grew from 7 to 27, and two new campuses, the Woman Campus and the Shangla Campus, were established.' },
    { when: 'Today', text: 'The main campus is at Charbagh, Swat, where the main academic campuses and all the administrative offices are located. The university’s page lists Phase-I as completed: three academic blocks, girls’ and boys’ hostels, a masjid, the library, the examination section, the administration block, residential buildings for staff, the boundary wall and the road infrastructure.' },
  ],
  vision: 'The University of Swat aspires to be a premier seat of learning, distinctively recognized for transformative education and multi-disciplinary research to serve humanity.',
  mission:
    'University of Swat is committed to provide academic and rewarding environment for intellectual growth to promote quality research and education, focused on creative and critical thinking with multi-cultural affinity of glorious human values.',
  values: ['Commitment', 'Creativity', 'Excellence', 'Responsibility', 'Leadership', 'Service'],
  /** Only the objectives that the copy gives as whole sentences. */
  objectives: [
    'To nurture creativity for attaining excellence in academic distinction.',
    'To encourage and support human resource development for the stakeholders in the respective paradigms.',
    'To flourish the career and human intellectual growth in the luminance of diversity.',
  ],
  valley: [
    { icon: 'globe', title: 'Where three regions meet', text: 'The Swat valley lies in a region where South Asia, Central Asia and China meet.' },
    { icon: 'layers', title: 'The river Swat', text: 'A clear-water river that starts in the Ushu range of mountains and runs through the valley.' },
    { icon: 'briefcase', title: 'Mingora', text: 'The commercial hub of Swat, about 2 km from the capital city of Saidu Sharif.' },
    { icon: 'spark', title: 'Crafts', text: 'Swat is known for embroidery, shawls, wooden furniture, wood carving, handicrafts and honey.' },
  ] as IconTitled[],
  sources: [ABOUT_SOURCE, MESSAGE_SOURCE] as Source[],
  openPoints: [
    'Four of the seven objectives are cut off in the copy of the page that we hold (they end in the middle of a sentence), so they are not shown here.',
    'The page says both that construction at the Charbagh campus is in progress and that Phase-I is complete. This page follows the second statement and names it as the university’s own.',
  ],
  verifiedAt: VERIFIED_AT,
}

export const MESSAGE = {
  banner: officeBanner('vice-chancellors-message', 'Vice Chancellor’s Message. University of Swat. Prof. Dr. Husnul Amin.'),
  hero: officeHero('vice-chancellors-message'),
  lead: 'A message to students, faculty, staff, alumni and partners from the Vice Chancellor, Prof. Dr. Husnul Amin.',
  person: { id: 'husnul-amin', name: 'Prof. Dr. Husnul Amin', title: 'Vice Chancellor, University of Swat' },
  /** The message as the university’s page gives it, paragraph by paragraph (the greeting line and the signature are the byline below it). */
  paragraphs: [
    'It is with immense pride, humility, and a profound sense of responsibility that I assume the office of Vice Chancellor of the University of Swat. I am honored to serve this distinguished institution at a pivotal moment in its journey and look forward to working collectively with our students, faculty, staff, alumni, partners, and stakeholders to shape a future defined by excellence, innovation, and impact.',
    'The University of Swat stands at the heart of one of the world’s most breathtaking and ecologically significant regions. Nestled amidst the mountains, rivers, and rich cultural heritage of the Swat Valley, our University possesses a unique identity and an extraordinary opportunity to contribute to the advancement of knowledge, sustainable development, and human prosperity. We are not merely an institution of higher learning; we are a catalyst for transformation, a center for intellectual inquiry, and a beacon of hope for future generations.',
    'As we embark on a new chapter, our collective ambition must be clear: to establish the University of Swat as a nationally recognized and internationally connected center of academic excellence, research innovation, and societal engagement. We must aspire not only to educate students but also to create leaders, innovators, entrepreneurs, researchers, and responsible citizens who will shape the future of Pakistan and contribute meaningfully to the global community.',
    'The challenges confronting our world today—climate change, environmental degradation, technological disruption, economic uncertainty, and social inequalities—require universities to assume a more active and transformative role. Institutions of higher education must generate knowledge, foster innovation, and provide solutions that address the pressing needs of society. The University of Swat is uniquely positioned to contribute to these efforts, particularly in areas relating to environmental sustainability, climate resilience, biodiversity conservation, water resource management, mountain ecosystems, emerging technologies, public policy, and community development.',
    'My vision is to cultivate a vibrant academic ecosystem where excellence in teaching is matched by excellence in research, where innovation flourishes alongside tradition, and where diversity of thought is celebrated as a source of strength. We will continue to strengthen academic quality, modernize curricula, expand research opportunities, encourage interdisciplinary collaboration, and promote a culture of continuous learning and discovery.',
    'Research will remain a cornerstone of our institutional growth. We will strive to enhance our research capacity, establish meaningful national and international collaborations, attract competitive research funding, and encourage scholarship that generates tangible benefits for society. Our faculty and students will be empowered to pursue knowledge that addresses local challenges while contributing to global scientific and intellectual discourse.',
    'The future of higher education is increasingly shaped by digital technologies, artificial intelligence, entrepreneurship, and innovation-driven economies. The University of Swat must position itself at the forefront of these developments. We will work to strengthen digital transformation, promote technological literacy, support entrepreneurial initiatives, and create opportunities that prepare our graduates to thrive in a rapidly evolving world.',
    'At the same time, we remain firmly committed to the values that define great universities: integrity, merit, inclusivity, transparency, academic freedom, and respect for diversity. We will continue to foster an environment where every student has the opportunity to learn, grow, and realize their full potential regardless of background or circumstance.',
    'The success of any university is ultimately measured not by its buildings or statistics but by the lives it transforms and the contributions it makes to society. Our students are at the center of everything we do. Their aspirations, achievements, and success will remain our highest priority. We will continue to strengthen student support services, enhance learning opportunities, and provide an educational experience that equips graduates with the knowledge, skills, character, and confidence necessary for meaningful lives and careers.',
    'As we move forward, I invite all members of the University community to join me in a shared commitment to excellence. Together, we can build a University that not only meets the challenges of the present but also shapes the opportunities of the future. Through collaboration, innovation, dedication, and a shared sense of purpose, we will elevate the University of Swat to new heights of academic distinction and societal relevance.',
    'The journey ahead is filled with promise. Let us embrace it with confidence, determination, and an unwavering commitment to excellence. I warmly welcome you to the University of Swat and invite you to be part of this exciting journey of growth, discovery, and transformation.',
  ],
  sources: [MESSAGE_SOURCE] as Source[],
  verifiedAt: VERIFIED_AT,
}
