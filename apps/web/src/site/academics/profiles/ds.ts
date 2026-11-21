import type { DisciplineProfile } from '../types'

import { art, banner } from './art'
import { commonFaq, firstYear, year } from './core'

export const ds: DisciplineProfile = {
  slug: 'bs-data-science',
  department: 'dcst',
  status: 'draft',
  shortName: 'DS',
  tagline: 'Statistics, programming and machine learning, used to turn data into decisions.',
  summary:
    'Statistics, programming and machine learning: collecting, analysing and explaining data.',
  hero: art('ds', 'hero'),
  banner: banner('ds', 'Department of Data Science. Explore, Analyze, Innovate.'),
  tile: art(
    'ds',
    'tile',
    'Illustration of a bar chart with a trend line, a scatter plot and a donut chart',
  ),
  figure: art(
    'ds',
    'lab',
    'Illustration of a bar chart with a trend line, a scatter plot and a donut chart',
  ),
  about: [
    'BS Data Science combines statistics, programming and domain knowledge. Students learn to collect and clean data, to explore it, to build models that predict, and to explain the results to people who make decisions.',
    'Courses use real data sets from health, agriculture, education and tourism. The final-year project is built around a question from an organisation outside the department.',
  ],
  whyStudy: [
    {
      icon: 'chart',
      title: 'Statistics first',
      text: 'Probability, inference and regression give the reasoning behind every model.',
    },
    {
      icon: 'database',
      title: 'Data from end to end',
      text: 'Collection, storage, cleaning, analysis and reporting.',
    },
    {
      icon: 'brain',
      title: 'Machine learning',
      text: 'Classical methods and deep learning, applied to real data.',
    },
    {
      icon: 'globe',
      title: 'Questions that matter',
      text: 'Projects on local problems in health, agriculture, education and tourism.',
    },
  ],
  outcomes: [
    'Collect, clean and combine data from several sources.',
    'Choose and apply statistical methods, and state what they do and do not show.',
    'Build, evaluate and compare machine learning models.',
    'Present findings in clear charts, dashboards and reports.',
    'Handle data responsibly, with attention to privacy and bias.',
  ],
  years: [
    firstYear,
    year(
      2,
      [
        'Data Structures and Algorithms',
        'Probability and Statistics',
        'Programming for Data Science',
        'Database Systems',
        'Communication and Presentation Skills',
      ],
      [
        'Statistical Inference',
        'Data Wrangling and Visualisation',
        'Linear Models and Regression',
        'Introduction to Machine Learning',
        'Design and Analysis of Algorithms',
      ],
    ),
    year(
      3,
      [
        'Machine Learning',
        'Data Mining',
        'Big Data Technologies',
        'Optimisation Methods',
        'Elective I',
      ],
      [
        'Deep Learning',
        'Time Series Analysis',
        'Text Analytics',
        'Data Ethics and Privacy',
        'Elective II',
      ],
    ),
    year(
      4,
      [
        'Final Year Project I',
        'Data Engineering and Pipelines',
        'Business Intelligence',
        'Professional Practices',
        'Elective III',
      ],
      ['Final Year Project II', 'Applied Data Science Studio', 'Entrepreneurship', 'Elective IV'],
    ),
  ],
  tracks: [
    {
      icon: 'chart',
      title: 'Analytics and statistics',
      text: 'Experiments, forecasting and decision support.',
    },
    {
      icon: 'brain',
      title: 'Machine learning',
      text: 'Modelling, deep learning and model evaluation.',
    },
    {
      icon: 'database',
      title: 'Data engineering',
      text: 'Pipelines, warehouses and large-scale processing.',
    },
    {
      icon: 'globe',
      title: 'Applied domains',
      text: 'Health, agriculture, finance and education data.',
    },
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'R', 'SQL'] },
    {
      group: 'Tools',
      items: ['Jupyter', 'pandas', 'scikit-learn', 'Spark', 'Tableau-style dashboards'],
    },
    {
      group: 'Concepts',
      items: [
        'Statistics',
        'Machine learning',
        'Visualisation',
        'Data ethics',
        'Experiment design',
      ],
    },
  ],
  careers: [
    {
      icon: 'chart',
      title: 'Data analyst',
      text: 'Answer questions with data and present the answers.',
    },
    { icon: 'brain', title: 'Data scientist', text: 'Build models that predict and recommend.' },
    {
      icon: 'database',
      title: 'Data engineer',
      text: 'Build the pipelines that deliver clean data.',
    },
    {
      icon: 'briefcase',
      title: 'Business intelligence developer',
      text: 'Create the dashboards that managers use.',
    },
  ],
  faq: [
    {
      q: 'How much mathematics is there?',
      a: 'A good amount: calculus, linear algebra, probability and statistics run through the programme. Each is taught with data and code, not only with proofs.',
    },
    ...commonFaq('Data Science'),
  ],
}
