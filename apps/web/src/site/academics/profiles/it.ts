import type { DisciplineProfile } from '../types'

import { art } from './art'
import { commonFaq, firstYear, year } from './core'

export const it: DisciplineProfile = {
  slug: 'bs-information-technology',
  department: 'dcst',
  status: 'draft',
  shortName: 'IT',
  tagline: 'Networks, servers, the cloud and the information systems that organisations run on.',
  summary:
    'Networks, servers, cloud and security: running the technology that organisations depend on.',
  hero: art('it', 'hero'),
  tile: art('it', 'tile', 'Illustration of a network of connected computers around a central hub'),
  figure: art('it', 'lab', 'Illustration of a network of connected computers around a central hub'),
  about: [
    'BS Information Technology is about putting technology to work in organisations. Students learn to design and run networks and servers, to manage data and information systems, and to keep them secure.',
    'The programme is practical. Laboratories cover network configuration, server administration and cloud services, and projects are built around the needs of a real or realistic organisation.',
  ],
  whyStudy: [
    {
      icon: 'network',
      title: 'Networks and infrastructure',
      text: 'Build and manage wired, wireless and cloud networks in the laboratory.',
    },
    {
      icon: 'shield',
      title: 'Security from the start',
      text: 'Network security, digital forensics and safe system administration.',
    },
    {
      icon: 'cloud',
      title: 'Cloud and services',
      text: 'Virtual machines, containers and managed cloud services.',
    },
    {
      icon: 'briefcase',
      title: 'Jobs everywhere',
      text: 'Every bank, hospital, school and government office needs people who keep systems running.',
    },
  ],
  outcomes: [
    'Design, configure and troubleshoot local and wide area networks.',
    'Install and administer server operating systems and common services.',
    "Analyse an organisation's needs and design an information system for it.",
    'Apply security controls and respond to incidents.',
    'Plan and manage an IT project and the service that follows it.',
  ],
  years: [
    firstYear,
    year(
      2,
      [
        'Data Structures and Algorithms',
        'Digital Logic Design',
        'Probability and Statistics',
        'Web Programming',
        'Communication and Presentation Skills',
      ],
      [
        'Database Systems',
        'Operating Systems',
        'Computer Networks',
        'Systems Analysis and Design',
        'IT Infrastructure',
      ],
    ),
    year(
      3,
      [
        'Network Administration',
        'Information Security',
        'Cloud Computing',
        'Mobile Application Development',
        'Elective I',
      ],
      [
        'Enterprise Systems',
        'Network Security',
        'Server Administration',
        'IT Project Management',
        'Elective II',
      ],
    ),
    year(
      4,
      [
        'Final Year Project I',
        'Internet of Things',
        'Digital Forensics',
        'Professional Practices',
        'Elective III',
      ],
      ['Final Year Project II', 'IT Service Management', 'Entrepreneurship', 'Elective IV'],
    ),
  ],
  tracks: [
    {
      icon: 'network',
      title: 'Networking',
      text: 'Routing, switching, wireless and network design.',
    },
    {
      icon: 'shield',
      title: 'Cyber security',
      text: 'Defence, monitoring, forensics and incident response.',
    },
    {
      icon: 'cloud',
      title: 'Cloud and systems',
      text: 'Virtualisation, containers and cloud platforms.',
    },
    {
      icon: 'database',
      title: 'Information systems',
      text: 'Databases, enterprise software and business analysis.',
    },
  ],
  skills: [
    {
      group: 'Systems',
      items: ['Linux', 'Windows Server', 'Virtualisation', 'Containers', 'Cloud platforms'],
    },
    {
      group: 'Networking',
      items: ['TCP/IP', 'Routing and switching', 'Wi-Fi', 'Firewalls', 'Wireshark'],
    },
    {
      group: 'Practice',
      items: ['SQL', 'Scripting', 'Monitoring', 'Documentation', 'Service management'],
    },
  ],
  careers: [
    {
      icon: 'network',
      title: 'Network engineer',
      text: 'Design and run networks for organisations.',
    },
    { icon: 'gear', title: 'Systems administrator', text: 'Keep servers and services healthy.' },
    { icon: 'shield', title: 'Security analyst', text: 'Monitor, investigate and respond.' },
    {
      icon: 'database',
      title: 'IT manager',
      text: 'Lead the technology of a school, clinic or company.',
    },
  ],
  faq: [
    {
      q: 'Is this a hardware programme?',
      a: 'Not mainly. It covers networks, servers and information systems; electronics is limited to the basics of digital logic.',
    },
    ...commonFaq('Information Technology'),
  ],
}
