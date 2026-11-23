import type { DepartmentProfile } from '../types'

import { art, banner, photo } from './art'

/* Department of Computer and Software Technologies (DCST). The department name and its five disciplines come from the
   owner (2026-11-20). Everything else here is illustrative text for the template and has not been checked by the
   department: `status: 'draft'`. Replace it, then set `reviewed`. */
export const dcst: DepartmentProfile = {
  slug: 'dcst',
  status: 'draft',
  shortName: 'DCST',
  tagline: 'Computing, software and data: five degree programmes taught by one department.',
  intro:
    'Five four-year BS programmes in computing, one shared first year, and laboratory work in every semester.',
  hero: art('dcst', 'hero'),
  heroPhotos: [
    photo('dcst-hero-1', 547, 365),
    photo('dcst-hero-2', 678, 452),
    photo('dcst-hero-3', 565, 353),
    photo('dcst-hero-4', 678, 452),
    photo('dcst-hero-5', 638, 480),
  ],
  campusPhoto: photo('dcst-campus', 900, 1125, 'The University of Swat campus at sunset'),
  banner: banner('dcst', 'Department of Computer and Software Technologies (DCST). Learn, Develop, Innovate.'),
  about: [
    'The Department of Computer and Software Technologies teaches the foundations of computing and the practice of building software. Students learn to design programs, structure data, build and secure networks, and apply machine learning to real problems.',
    'The five programmes share a first-year core, so a student can move between disciplines early on. From the second year each programme goes its own way, with its own courses, laboratories and a final-year project.',
  ],
  vision:
    'To be a department whose graduates build dependable software and data systems for the people of Swat, Khyber Pakhtunkhwa and beyond.',
  mission:
    'To teach computing with a strong foundation in programming and mathematics, to give every student regular laboratory practice, and to support research and projects that solve local problems.',
  highlights: [
    {
      icon: 'layers',
      title: 'A shared first year',
      text: 'Programming, mathematics and communication skills are common to all five programmes, so students build the same base before they specialise.',
    },
    {
      icon: 'flask',
      title: 'Laboratory practice',
      text: 'Every programme has laboratory hours each semester, from programming and databases to networks and machine learning.',
    },
    {
      icon: 'rocket',
      title: 'A final-year project',
      text: 'Each student builds a project with a supervisor in the last year and presents it to the department.',
    },
    {
      icon: 'users',
      title: 'Student societies',
      text: 'Programming, data and AI societies run workshops and contests alongside the timetable.',
    },
    {
      icon: 'briefcase',
      title: 'Internships',
      text: 'Students are encouraged to spend a summer in industry or on a research project.',
    },
    {
      icon: 'cap',
      title: 'Paths to further study',
      text: 'The curriculum prepares graduates for MS and PhD study in computing at home or abroad.',
    },
  ],
  disciplines: [
    'bs-computer-science',
    'bs-software-engineering',
    'bs-information-technology',
    'bs-data-science',
    'bs-artificial-intelligence',
  ],
  labs: [
    {
      title: 'Programming and algorithms laboratory',
      text: 'Supervised practice in problem solving, data structures and competitive programming.',
      art: art('cs', 'lab'),
      tools: ['C++', 'Python', 'Java'],
    },
    {
      title: 'Software engineering studio',
      text: 'Team projects run like a small software company: requirements, design, code review, testing and release.',
      art: art('se', 'lab'),
      tools: ['Git', 'Docker', 'CI pipelines'],
    },
    {
      title: 'Networks and systems laboratory',
      text: 'Hands-on work with routers, switches, servers and operating systems, including network security exercises.',
      art: art('it', 'lab'),
      tools: ['Linux', 'Cisco-style simulators', 'Wireshark'],
    },
    {
      title: 'Data analytics laboratory',
      text: 'Cleaning, exploring and visualising data, and building reports and dashboards.',
      art: art('ds', 'lab'),
      tools: ['Python', 'SQL', 'Jupyter'],
    },
    {
      title: 'AI and machine learning laboratory',
      text: 'Training and testing models on shared computers, from classical methods to neural networks.',
      art: art('ai', 'lab'),
      tools: ['PyTorch', 'scikit-learn', 'GPU workstations'],
    },
  ],
  research: [
    {
      icon: 'brain',
      title: 'Artificial intelligence and machine learning',
      text: 'Learning from data, language and vision, and applying it to local languages such as Pashto and Urdu.',
      tags: ['Natural language processing', 'Computer vision', 'Deep learning'],
    },
    {
      icon: 'chart',
      title: 'Data science and analytics',
      text: 'Turning public and institutional data into decisions: health, agriculture, education and tourism.',
      tags: ['Data mining', 'Visualisation', 'Statistics'],
    },
    {
      icon: 'layers',
      title: 'Software engineering',
      text: 'How teams build, test and maintain software that lasts, with a focus on quality and process.',
      tags: ['Testing', 'Requirements', 'Agile practice'],
    },
    {
      icon: 'shield',
      title: 'Networks and security',
      text: 'Reliable and secure networks for campuses, small businesses and public services.',
      tags: ['Network security', 'Cloud', 'Internet of Things'],
    },
  ],
  careers: [
    {
      icon: 'code',
      title: 'Software developer',
      text: 'Web, mobile and systems software for companies and start-ups.',
    },
    {
      icon: 'chart',
      title: 'Data analyst or scientist',
      text: 'Analysis, reporting and prediction for business and public bodies.',
    },
    {
      icon: 'brain',
      title: 'Machine learning engineer',
      text: 'Building and deploying models in products and services.',
    },
    {
      icon: 'network',
      title: 'Network and systems administrator',
      text: 'Running the networks and servers that organisations depend on.',
    },
    {
      icon: 'shield',
      title: 'Security analyst',
      text: 'Protecting systems and data and responding to incidents.',
    },
    {
      icon: 'globe',
      title: 'Freelancer or founder',
      text: 'Remote work for clients worldwide, or a company of your own.',
    },
  ],
  studentLife: [
    {
      icon: 'code',
      title: 'Programming society',
      text: 'Weekly practice sessions and an annual programming contest.',
    },
    {
      icon: 'trophy',
      title: 'Hackathons and competitions',
      text: 'Team events inside the university and with other universities.',
    },
    {
      icon: 'users',
      title: 'Peer mentoring',
      text: 'Senior students help first-year students with programming and study habits.',
    },
    {
      icon: 'spark',
      title: 'Seminars and guest talks',
      text: 'Practitioners and researchers visit to talk about their work.',
    },
  ],
  faq: [
    {
      q: 'Which programmes does the department offer?',
      a: 'BS Computer Science, BS Software Engineering, BS Information Technology, BS Data Science and BS Artificial Intelligence. Each is a four-year programme of eight semesters.',
    },
    {
      q: 'Can I change programme after the first year?',
      a: 'The first year is common to all five programmes, so a change is possible at the end of it, subject to the university rules on transfers and to the seats available.',
    },
    {
      q: 'What do I need to apply?',
      a: 'The eligibility for each programme is on its own page. Applications are made through the university admissions portal when an intake is open.',
    },
    {
      q: 'Do students get laboratory access outside class?',
      a: 'Laboratories are open for supervised practice during the working week. Final-year project students may have extended access arranged by their supervisor.',
    },
    {
      q: 'Where can I find the latest notices?',
      a: 'Merit lists, timetables and announcements are published on the university notices page.',
    },
  ],
  /* Names, titles and qualifications supplied by the owner on 2026-11-21 (no public source address yet; the page stays marked draft). */
  team: [
    {
      id: 'sana-ullah',
      photo: '/images/faculty/sana-ullah.jpg',
      name: 'Dr. Sana Ullah',
      title: 'Professor and Chairman',
      role: 'head',
      qualifications: [
        'Postdoc, Gyeongsang National University, South Korea (2019)',
        'Postdoc, ISEP/INESC-TEC, Porto, Portugal (2015)',
        'PhD (Wireless Networks), Inha University, South Korea (2011)',
      ],
    },
    {
      id: 'abdul-haq',
      photo: '/images/faculty/abdul-haq.jpg',
      name: 'Mr. Abdul Haq',
      title: 'Lecturer',
      role: 'coordinator',
      coordinates: ['bs-software-engineering'],
    },
    {
      id: 'umar-ali',
      photo: '/images/faculty/umar-ali.jpg',
      name: 'Mr. Umar Ali',
      title: 'Lecturer',
      role: 'coordinator',
      coordinates: ['bs-computer-science'],
      qualifications: ['MS Computer Science, Asian Institute of Technology, Thailand'],
    },
    {
      id: 'naeem-ullah',
      photo: '/images/faculty/naeem-ullah.jpg',
      name: 'Mr. Naeem Ullah',
      title: 'Lecturer',
      role: 'coordinator',
      coordinates: ['bs-information-technology'],
    },
    {
      id: 'kiramat-rahman',
      photo: '/images/faculty/kiramat-rahman.jpg',
      name: 'Mr. Kiramat Rahman',
      title: 'Assistant Professor',
      role: 'coordinator',
      coordinates: ['bs-artificial-intelligence', 'bs-data-science'],
    },
  ],
}
