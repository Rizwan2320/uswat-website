import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Biotechnology, Genetics, Forensic and Microbiology, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the welcome text, the introduction (Microbiology established in 2011;
   Forensic Science merged in December 2022), the vision and mission, the programmes listed, and 21 named staff with their titles.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plans) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`.
   BS Forensic Sciences is listed on the page but has no programme page in the old site's address list, so it is not built here. */

const PAGE = 'https://uswat.edu.pk/department-of-biotechnology-genetics-forensic-and-microbiology/'
export const SLUG = 'biotechnology-genetics-forensic-and-microbiology'
export const BT = 'bs-biotechnology-3'
export const GE = 'bs-genetics-3'
export const MB = 'bs-microbiology-3'

export const biotechnology: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Biotechnology, Genetics, Forensic and Microbiology',
  fullName: 'Department of Biotechnology, Genetics, Forensic and Microbiology',
  tagline: 'Microbes, genes and evidence: life science that is built to be used.',
  intro: 'Research-oriented BS degrees in Biotechnology, Genetics and Microbiology, with Forensic Sciences, MPhil and PhD study also listed.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Biotechnology, Genetics, Forensic and Microbiology. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Biotechnology, Genetics, Forensic and Microbiology'),
  levelText: 'BS',
  programmesLede: 'The department’s page lists BS degrees in Biotechnology, Microbiology, Genetics and Forensic Sciences, MPhil in Biotechnology and Microbiology, and PhD in both; the three BS programmes with pages are shown here.',
  about: [
    'The 21st century is called an era of biotechnology and applied microbiology. The University of Swat set up the Department of Microbiology in 2011; over time it grew into the Department of Biotechnology, Genetics, Forensic and Microbiology, and the Department of Forensic Science joined it in December 2022.',
    'The department offers research-oriented BS, MPhil and PhD degrees in Biotechnology, Microbiology, Genetics and Forensic Science. Students who meet the admission criteria set by the HEC guidelines are admitted. Its teachers mostly hold doctorates, many with post-doctoral experience from well-regarded institutes.',
    'Teaching and research cover medical microbiology, microbial biotechnology, bioprocessing, molecular biology, tissue culture and nanobiotechnology, with links to institutes in Pakistan and abroad.',
  ],
  vision:
    'To create a world-renowned Department of Biotechnology, Genetics, Forensic and Microbiology that promotes innovation, fosters multidisciplinary research and gives high-quality education, to address society’s concerns and improve scientific understanding.',
  mission:
    'To give a foundation in the basic principles of the biological sciences, with a high level of accuracy and quality in education and research skills, so that students can serve in industry, institutions and the community. To equip students with the knowledge, skills and ethical principles they need for their careers, so that graduates can face future challenges and contribute to society.',
  highlights: [
    { icon: 'flask', title: 'Four fields under one roof', text: 'Biotechnology, genetics, microbiology and forensic science share laboratories, teachers and ideas.' },
    { icon: 'search', title: 'Research from the first year', text: 'Degrees are research-oriented: students learn methods early and apply them in a final-year project.' },
    { icon: 'layers', title: 'From the cell to the process', text: 'Molecular biology, tissue culture and bioprocessing are taught as one chain, from idea to product.' },
    { icon: 'shield', title: 'Medicine, food and evidence', text: 'Courses connect to health, industry and the courts, from diagnosis to forensic analysis.' },
    { icon: 'users', title: 'A doctorate-led faculty', text: 'The page notes that most teachers hold a doctorate, many with post-doctoral experience.' },
    { icon: 'cap', title: 'MPhil and PhD pathways', text: 'The department lists MPhil and PhD in Biotechnology and in Microbiology.' },
  ],
  disciplines: [BT, GE, MB],
  labs: [
    {
      title: 'Microbiology laboratory',
      text: 'Culturing, staining and identifying bacteria and fungi, with strict attention to safety and sterile technique.',
      art: officeHero(SLUG),
      tools: ['Autoclave', 'Incubators', 'Biosafety cabinet'],
    },
    {
      title: 'Molecular biology and genetics laboratory',
      text: 'DNA and RNA extraction, PCR and gel work for genetics and biotechnology projects.',
      art: officeHero(MB),
      tools: ['PCR machines', 'Gel electrophoresis', 'Microcentrifuges'],
    },
    {
      title: 'Plant and cell culture laboratory',
      text: 'Growing plants and cells under sterile conditions, for conservation and for making useful compounds.',
      art: officeHero(SLUG),
      tools: ['Laminar-flow cabinet', 'Growth chamber', 'Shaking incubator'],
    },
    {
      title: 'Bioprocessing and nanobiotechnology laboratory',
      text: 'Fermentation, small-scale production and the study of nanoparticles for biological use.',
      art: officeHero(BT),
      tools: ['Bench fermenter', 'Spectrophotometer', 'Centrifuge'],
    },
  ],
  research: [
    { icon: 'flask', title: 'Medical microbiology', text: 'Disease-causing microbes, how they spread and how they respond to treatment.', tags: ['Bacteria', 'Infection', 'Antibiotics'] },
    { icon: 'layers', title: 'Microbial biotechnology and bioprocessing', text: 'Using microbes to make enzymes, fuels and useful chemicals.', tags: ['Fermentation', 'Enzymes', 'Bioprocessing'] },
    { icon: 'spark', title: 'Molecular biology and tissue culture', text: 'Studying genes and growing plants and cells under controlled conditions.', tags: ['DNA', 'Tissue culture', 'Genetics'] },
    { icon: 'shield', title: 'Nanobiotechnology and forensic science', text: 'Tiny materials for biology, and the scientific analysis of evidence.', tags: ['Nanoparticles', 'Forensics', 'DNA analysis'] },
  ],
  careers: [
    { icon: 'flask', title: 'Research scientist', text: 'MPhil and PhD, then research posts.' },
    { icon: 'shield', title: 'Diagnostic or forensic laboratory scientist', text: 'Hospitals, public laboratories and forensic services.' },
    { icon: 'briefcase', title: 'Biotechnology and pharma industry', text: 'Quality control, production and development.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'globe', title: 'Food, agriculture and environment', text: 'Testing and improvement of food, crops and water.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Biology society', text: 'Student-run talks, journal clubs and quiz nights for first-year students.' },
    { icon: 'flask', title: 'Laboratory open hours', text: 'Supervised time for students to practise techniques outside class.' },
    { icon: 'spark', title: 'Guest seminars', text: 'Visiting scientists speak about research and careers.' },
    { icon: 'trophy', title: 'Science day', text: 'Students show experiments and posters to schools in the district.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'The page lists BS Biotechnology, BS Microbiology, BS Genetics and BS Forensic Sciences, MPhil in Biotechnology and in Microbiology, and PhD in Biotechnology and in Microbiology.' },
    { q: 'What do I need to apply?', a: 'The page says students who meet the admission criteria as per HEC guidelines are admitted. It gives no further entry requirement; the merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Muhammad Nazir Ud-Din, Associate Professor, as Chairman.' },
    { q: 'What happened to the Department of Forensic Science?', a: 'The page says it was merged into this department in December 2022.' },
    { q: 'Where can I find the latest notices?', a: 'Merit lists, timetables and announcements are published on the university notices page.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The 21 staff named on the department’s page, with the titles it gives.',
  alumni: ['low-cost-medium-for-plantlet-culture', 'pedigree-survey-of-inherited-traits', 'bacteria-in-roadside-drinking-water'],
  reference: {
    sources: [{ label: 'Department of Biotechnology, Genetics, Forensic and Microbiology page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page lists the programmes twice (BS in four subjects, MPhil and PhD in two). It gives no entry requirement beyond “as per HEC guidelines”, and no seat numbers, fees or intake dates.',
      'BS Forensic Sciences is listed, but it has no programme page in the old site’s address list, so it appears here in the text only.',
      'The page calls the unit both a department and a “Centre”. Which faculty it belongs to is not on the page.',
      'Dr. Akhar Rasool is also named on the Department of Zoology page.',
      'The BS programme pages on the old site hold only links to scheme-of-studies files, so the study plans, outcomes and careers on the programme pages are illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department. Staff e-mail addresses on the page are not shown.',
    ],
  },
  team: [
    { id: 'muhammad-nazir-ud-din', name: 'Dr. Muhammad Nazir Ud-Din', title: 'Associate Professor and Chairman', role: 'head', roleLabel: 'Chairman' },
    { id: 'fazal-akbar', name: 'Prof. Dr. Fazal Akbar', title: 'Professor', role: 'member' },
    { id: 'shahid-ali', name: 'Prof. Dr. Shahid Ali', title: 'Professor', role: 'member' },
    { id: 'ali-akbar', name: 'Dr. Ali Akbar', title: 'Professor', role: 'member' },
    { id: 'haji-khan', name: 'Dr. Haji Khan', title: 'Associate Professor', role: 'member' },
    { id: 'muhammad-israr', name: 'Dr. Muhammad Israr', title: 'Associate Professor', role: 'member' },
    { id: 'syed-shujait-ali', name: 'Dr. Syed Shujait Ali', title: 'Associate Professor', role: 'member' },
    { id: 'nisar-ahmad', name: 'Dr. Nisar Ahmad', title: 'Associate Professor', role: 'member' },
    { id: 'zahid-hussain', name: 'Dr. Zahid Hussain', title: 'Associate Professor', role: 'member' },
    { id: 'mohammad-ali', name: 'Dr. Mohammad Ali', title: 'Associate Professor', role: 'member' },
    { id: 'nasib-zaman', name: 'Dr. Nasib Zaman', title: 'Associate Professor', role: 'member' },
    { id: 'muhammad-rizwan', name: 'Dr. Muhammad Rizwan', title: 'Associate Professor (TTS)', role: 'member' },
    { id: 'akhar-rasool', name: 'Dr. Akhar Rasool', title: 'Assistant Professor', role: 'member' },
    { id: 'wajid-khan', name: 'Dr. Wajid Khan', title: 'Assistant Professor', role: 'member' },
    { id: 'muhammad-suleman', name: 'Dr. Muhammad Suleman', title: 'Assistant Professor', role: 'member' },
    { id: 'zafar-ali', name: 'Dr. Zafar Ali', title: 'Assistant Professor', role: 'member' },
    { id: 'arshad-iqbal', name: 'Dr. Arshad Iqbal', title: 'Assistant Professor of Biotechnology (TTS)', role: 'member' },
    { id: 'murad-rahat', name: 'Dr. Murad Rahat', title: 'Assistant Professor (Fixed Pay)', role: 'member' },
    { id: 'ishaq-khan', name: 'Mr. Ishaq Khan', title: 'Lecturer', role: 'member' },
    { id: 'murad-ali', name: 'Mr. Murad Ali', title: 'Lecturer', role: 'member' },
    { id: 'sadia-akbar', name: 'Dr. Sadia Akbar', title: 'Lecturer', role: 'member', qualifications: ['Gold Medalist'] },
  ],
}

const lede =
  'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.'
const applyFaq = {
  q: 'What do I need to apply?',
  a: 'The department has not published an entry requirement for this programme. The merit criteria are announced with each intake on the admissions page.',
}

export const bsBiotechnology: DisciplineProfile = {
  slug: BT,
  department: SLUG,
  status: 'draft',
  name: 'BS Biotechnology',
  shortName: 'Biotechnology',
  curriculumLede: lede,
  tagline: 'Use living systems to make things that help people.',
  summary: 'Molecular biology, tissue culture, bioprocessing and nanobiotechnology, with a research project in the last year.',
  ...pictures(BT, SLUG, 'BS Biotechnology. Department of Biotechnology, Genetics, Forensic and Microbiology, University of Swat.', 'Illustration for BS Biotechnology'),
  about: [
    'BS Biotechnology teaches how living cells and their molecules can be put to work in medicine, agriculture, food and industry. It combines biology and chemistry with laboratory methods from the first year.',
    'In the last year students choose electives and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'flask', title: 'Methods you can use', text: 'DNA work, culture and fermentation are taught by doing.' },
    { icon: 'layers', title: 'From the cell to the product', text: 'The courses follow an idea from the laboratory bench to a working process.' },
    { icon: 'briefcase', title: 'Wide fields of work', text: 'Health, food, agriculture and industry all hire biotechnologists.' },
    { icon: 'cap', title: 'A route to MPhil and PhD', text: 'The department lists MPhil and PhD in Biotechnology.' },
  ],
  outcomes: [
    'Explain the structure and function of cells, genes and proteins.',
    'Carry out core molecular and microbial laboratory techniques safely.',
    'Describe how a biotechnological process is scaled from the bench to production.',
    'Design a small experiment, analyse the data and report the result.',
    'Discuss the ethics and biosafety of biotechnology.',
  ],
  years: [
    year(1, ['Cell Biology', 'General Chemistry', 'Biostatistics', 'Functional English', 'Islamic Studies'], ['General Microbiology', 'Organic Chemistry', 'Introduction to Biotechnology', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Biochemistry I', 'Genetics', 'Molecular Biology', 'Computer Skills', 'Laboratory Techniques'], ['Biochemistry II', 'Immunology', 'Plant Tissue Culture', 'Bioinformatics', 'Research Methods']),
    year(3, ['Genetic Engineering', 'Industrial Microbiology', 'Animal Cell Culture', 'Enzyme Technology', 'Biosafety and Bioethics'], ['Bioprocess Engineering', 'Environmental Biotechnology', 'Nanobiotechnology', 'Pharmaceutical Biotechnology', 'Scientific Writing']),
    year(4, ['Genomics and Proteomics', 'Elective I', 'Elective II', 'Research Project I'], ['Entrepreneurship in Biotechnology', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'flask', title: 'Medical and pharmaceutical biotechnology', text: 'Vaccines, diagnostics and biological medicines.' },
    { icon: 'globe', title: 'Plant and environmental biotechnology', text: 'Tissue culture, plant improvement and cleaning up pollution.' },
    { icon: 'gear', title: 'Industrial and bioprocess', text: 'Fermentation and enzymes at scale.' },
    { icon: 'spark', title: 'Nanobiotechnology', text: 'Tiny materials for sensing and delivery.' },
  ],
  skills: [
    { group: 'Laboratory', items: ['Sterile technique', 'DNA extraction and PCR', 'Cell culture', 'Spectrophotometry'] },
    { group: 'Analysis', items: ['Bioinformatics', 'Experimental design', 'Statistics for biology'] },
    { group: 'Professional', items: ['Scientific writing', 'Presenting', 'Teamwork', 'Biosafety'] },
  ],
  careers: [
    { icon: 'flask', title: 'Research scientist', text: 'MPhil and PhD, then research posts.' },
    { icon: 'briefcase', title: 'Biotechnology and pharma industry', text: 'Quality control, production and development.' },
    { icon: 'shield', title: 'Laboratory scientist', text: 'Hospitals and diagnostic laboratories.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'globe', title: 'Agriculture and food technologist', text: 'Testing and improvement of crops and food.' },
  ],
  faq: [applyFaq, ...scienceFaq('Biotechnology', 4)],
}

export const bsGenetics: DisciplineProfile = {
  slug: GE,
  department: SLUG,
  status: 'draft',
  name: 'BS Genetics',
  shortName: 'Genetics',
  curriculumLede: lede,
  tagline: 'Read how inheritance works, from the gene to the family.',
  summary: 'Classical and molecular genetics, genomics and bioinformatics, with laboratory work in every year.',
  ...pictures(GE, SLUG, 'BS Genetics. Department of Biotechnology, Genetics, Forensic and Microbiology, University of Swat.', 'Illustration for BS Genetics'),
  about: [
    'BS Genetics teaches how traits are passed on and how genes work, from Mendel’s peas to the sequencing of a genome. It combines laboratory methods with the statistics and computing that genetic data needs.',
    'In the last year students choose electives and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'flask', title: 'Laboratory methods', text: 'Extract DNA, run PCR and read the results.' },
    { icon: 'chart', title: 'Data and statistics', text: 'Genetic data is large, so the degree teaches how to analyse it.' },
    { icon: 'users', title: 'Health and families', text: 'Genetics explains inherited conditions and how counselling works.' },
    { icon: 'cap', title: 'A route to further study', text: 'The degree prepares graduates for MPhil and PhD study.' },
  ],
  outcomes: [
    'Explain the principles of inheritance and the structure and function of genes.',
    'Carry out DNA extraction, PCR and electrophoresis safely and correctly.',
    'Analyse genetic data using statistics and basic bioinformatics tools.',
    'Describe how genetic variation relates to health, agriculture and evolution.',
    'Discuss the ethics of genetic testing and genetic technologies.',
  ],
  years: [
    year(1, ['Cell Biology', 'General Chemistry', 'Biostatistics', 'Functional English', 'Islamic Studies'], ['Principles of Genetics', 'Organic Chemistry', 'General Microbiology', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Molecular Genetics', 'Biochemistry', 'Cytogenetics', 'Computer Skills', 'Laboratory Techniques'], ['Population Genetics', 'Molecular Biology', 'Human Genetics', 'Bioinformatics', 'Research Methods']),
    year(3, ['Genetic Engineering', 'Genomics', 'Medical Genetics', 'Evolutionary Genetics', 'Biosafety and Bioethics'], ['Plant and Animal Breeding', 'Immunogenetics', 'Epigenetics', 'Biostatistics for Genetics', 'Scientific Writing']),
    year(4, ['Proteomics and Systems Biology', 'Elective I', 'Elective II', 'Research Project I'], ['Genetic Counselling', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'users', title: 'Human and medical genetics', text: 'Inherited conditions, testing and counselling.' },
    { icon: 'globe', title: 'Plant and animal genetics', text: 'Breeding and the improvement of crops and livestock.' },
    { icon: 'database', title: 'Genomics and bioinformatics', text: 'Sequences, databases and the tools to read them.' },
    { icon: 'spark', title: 'Population and evolutionary genetics', text: 'How gene frequencies change in time and place.' },
  ],
  skills: [
    { group: 'Laboratory', items: ['DNA extraction', 'PCR', 'Gel electrophoresis', 'Karyotyping'] },
    { group: 'Analysis', items: ['Bioinformatics tools', 'Statistics for biology', 'Pedigree analysis'] },
    { group: 'Professional', items: ['Scientific writing', 'Presenting', 'Teamwork', 'Research ethics'] },
  ],
  careers: [
    { icon: 'flask', title: 'Research scientist', text: 'MPhil and PhD, then research posts.' },
    { icon: 'shield', title: 'Genetic laboratory scientist', text: 'Hospitals and diagnostic laboratories.' },
    { icon: 'users', title: 'Genetic counselling assistant', text: 'Clinics and health programmes.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'globe', title: 'Plant and animal breeding', text: 'Seed and livestock improvement work.' },
  ],
  faq: [applyFaq, ...scienceFaq('Genetics', 4)],
}

export const bsMicrobiology: DisciplineProfile = {
  slug: MB,
  department: SLUG,
  status: 'draft',
  name: 'BS Microbiology',
  shortName: 'Microbiology',
  curriculumLede: lede,
  tagline: 'The smallest living things, and their large effects.',
  summary: 'Bacteria, viruses, fungi and the immune system, from medical and food microbiology to industrial use.',
  ...pictures(MB, SLUG, 'BS Microbiology. Department of Biotechnology, Genetics, Forensic and Microbiology, University of Swat.', 'Illustration for BS Microbiology'),
  about: [
    'BS Microbiology teaches the biology of bacteria, viruses, fungi and other microbes, and how they affect health, food, soil and industry. Laboratory work starts in the first year and builds sterile technique and careful records.',
    'The university set up its Department of Microbiology in 2011, and this programme grew from it. In the last year students choose electives and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'flask', title: 'Core laboratory skills', text: 'Culture, stain, count and identify microbes.' },
    { icon: 'shield', title: 'Health and safety matter', text: 'Microbiologists help control infection, from hospitals to food plants.' },
    { icon: 'globe', title: 'Microbes everywhere', text: 'Water, soil, food and industry all rely on microbiologists.' },
    { icon: 'cap', title: 'A route to MPhil and PhD', text: 'The department lists MPhil and PhD in Microbiology.' },
  ],
  outcomes: [
    'Describe the structure, growth and classification of bacteria, viruses and fungi.',
    'Use sterile technique to culture, stain, count and identify microbes.',
    'Explain how microbes cause disease and how the immune system responds.',
    'Test the quality of water and food and report the result.',
    'Apply biosafety rules in the laboratory.',
  ],
  years: [
    year(1, ['General Microbiology', 'General Chemistry', 'Cell Biology', 'Functional English', 'Islamic Studies'], ['Microbial Physiology', 'Organic Chemistry', 'Biostatistics', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Bacteriology', 'Biochemistry', 'Virology', 'Computer Skills', 'Laboratory Techniques'], ['Mycology and Parasitology', 'Immunology', 'Microbial Genetics', 'Molecular Biology', 'Research Methods']),
    year(3, ['Medical Microbiology', 'Food Microbiology', 'Environmental Microbiology', 'Industrial Microbiology', 'Biosafety'], ['Antimicrobial Agents and Resistance', 'Clinical Laboratory Methods', 'Public Health Microbiology', 'Microbial Biotechnology', 'Scientific Writing']),
    year(4, ['Epidemiology', 'Elective I', 'Elective II', 'Research Project I'], ['Quality Assurance in Microbiology', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'shield', title: 'Medical and clinical microbiology', text: 'Infection, diagnosis and antimicrobial resistance.' },
    { icon: 'globe', title: 'Food and environmental microbiology', text: 'Safe food, clean water and healthy soil.' },
    { icon: 'gear', title: 'Industrial microbiology', text: 'Using microbes to make useful products.' },
    { icon: 'brain', title: 'Immunology and virology', text: 'How the body and viruses meet.' },
  ],
  skills: [
    { group: 'Laboratory', items: ['Sterile technique', 'Culture and staining', 'Antibiotic sensitivity testing', 'Microscopy'] },
    { group: 'Analysis', items: ['Water and food testing', 'Statistics for biology', 'Record keeping'] },
    { group: 'Professional', items: ['Scientific writing', 'Presenting', 'Teamwork', 'Biosafety'] },
  ],
  careers: [
    { icon: 'shield', title: 'Clinical laboratory scientist', text: 'Hospitals and diagnostic laboratories.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD, then research posts.' },
    { icon: 'briefcase', title: 'Food and pharmaceutical quality control', text: 'Testing and release of products.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'globe', title: 'Public health and environment', text: 'Water, sanitation and disease control programmes.' },
  ],
  faq: [applyFaq, ...scienceFaq('Microbiology', 4)],
}
