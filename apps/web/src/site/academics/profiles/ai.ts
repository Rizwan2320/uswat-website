import type { DisciplineProfile } from '../types'

import { art, banner } from './art'
import { commonFaq, firstYear, year } from './core'

export const ai: DisciplineProfile = {
  slug: 'bs-artificial-intelligence',
  department: 'dcst',
  status: 'draft',
  shortName: 'AI',
  tagline: 'Machine learning, language, vision and robotics: building systems that learn.',
  summary:
    'Machine learning, language, vision and robotics: building systems that learn from data.',
  hero: art('ai', 'hero'),
  banner: banner('ai', 'Department of Artificial Intelligence. Innovating Today, Empowering Tomorrow.'),
  tile: art(
    'ai',
    'tile',
    'Illustration of a neural network with a highlighted path through its layers',
  ),
  figure: art(
    'ai',
    'lab',
    'Illustration of a neural network with a highlighted path through its layers',
  ),
  about: [
    'BS Artificial Intelligence teaches how to build systems that learn from data and act on what they learn. After the shared first year it moves quickly to machine learning, then to language, vision and decision making.',
    'The programme also asks what these systems should and should not do. Courses on ethics and safety sit beside the technical ones, and projects use Pashto and Urdu text and local images as well as standard benchmarks.',
  ],
  whyStudy: [
    {
      icon: 'brain',
      title: 'Learning systems',
      text: 'Machine learning, deep learning and reinforcement learning, with laboratory work.',
    },
    {
      icon: 'search',
      title: 'Language and vision',
      text: 'Natural language processing and computer vision, including Pashto and Urdu.',
    },
    {
      icon: 'gear',
      title: 'Robots and agents',
      text: 'Systems that sense, decide and act in the physical world.',
    },
    {
      icon: 'shield',
      title: 'Responsible AI',
      text: 'Fairness, privacy, safety and the limits of automated decisions.',
    },
  ],
  outcomes: [
    'Build and evaluate machine learning models on real data.',
    'Apply deep learning to text and images.',
    'Formulate problems as search, planning or reinforcement-learning tasks.',
    'Deploy and monitor a model in a working application.',
    'Assess an AI system for bias, safety and privacy risks.',
  ],
  years: [
    firstYear,
    year(
      2,
      [
        'Data Structures and Algorithms',
        'Probability and Statistics',
        'Artificial Intelligence Fundamentals',
        'Computer Organisation',
        'Communication and Presentation Skills',
      ],
      [
        'Database Systems',
        'Machine Learning Fundamentals',
        'Design and Analysis of Algorithms',
        'Multivariable Calculus',
        'Knowledge Representation and Reasoning',
      ],
    ),
    year(
      3,
      [
        'Deep Learning',
        'Natural Language Processing',
        'Computer Vision',
        'Optimisation',
        'Elective I',
      ],
      [
        'Reinforcement Learning',
        'Robotics and Autonomous Systems',
        'Speech and Language Technologies',
        'AI Ethics and Safety',
        'Elective II',
      ],
    ),
    year(
      4,
      [
        'Final Year Project I',
        'Generative Models',
        'Machine Learning Operations',
        'Professional Practices',
        'Elective III',
      ],
      ['Final Year Project II', 'Applied AI Studio', 'Entrepreneurship', 'Elective IV'],
    ),
  ],
  tracks: [
    { icon: 'search', title: 'Language and vision', text: 'Text, speech and image understanding.' },
    { icon: 'gear', title: 'Robotics', text: 'Perception, planning and control.' },
    { icon: 'rocket', title: 'Generative AI', text: 'Models that write, draw and summarise.' },
    { icon: 'cloud', title: 'AI engineering', text: 'Deploying and monitoring models at scale.' },
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'C++', 'SQL'] },
    {
      group: 'Tools',
      items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Hugging Face', 'GPU workstations'],
    },
    {
      group: 'Concepts',
      items: ['Machine learning', 'Neural networks', 'Optimisation', 'NLP', 'Computer vision'],
    },
  ],
  careers: [
    { icon: 'brain', title: 'Machine learning engineer', text: 'Train, test and ship models.' },
    { icon: 'search', title: 'NLP or vision engineer', text: 'Build language and image products.' },
    { icon: 'gear', title: 'Robotics engineer', text: 'Make machines that sense and act.' },
    { icon: 'cap', title: 'AI researcher', text: 'MS and PhD study, then research.' },
  ],
  faq: [
    {
      q: 'Is AI harder than Computer Science?',
      a: 'It uses more mathematics earlier, especially probability, linear algebra and optimisation, and the same programming base. Students who like both coding and mathematics do well.',
    },
    ...commonFaq('Artificial Intelligence'),
  ],
}
