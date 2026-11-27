/* Draws the wide banners for the Research and Administration pages (1672 x 941 WebP, public/images/offices/banner-<key>.webp).
   Same family as the six department banners: dark green, glowing line art, a small first line and a two-tone title.
   The words in each picture are the office's own name and nothing else (no claims); the page repeats them as the h1's alt text.
   Run from apps/web:  node scripts/make-office-banners.mjs   (needs Playwright's Chromium and sharp, both already dev dependencies). */
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import sharp from 'sharp'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(here, '..', 'public', 'images', 'offices')
const FONTS = path.join(here, '..', 'node_modules', '@fontsource', 'poppins', 'files')
mkdirSync(OUT, { recursive: true })

const font = (file) => `data:font/woff2;base64,${readFileSync(path.join(FONTS, file)).toString('base64')}`

/* 24 x 24 line icons (the same drawings as src/site/academics/AcademicIcon.tsx where one exists). */
const ICON = {
  flask: 'M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7.5 15h9',
  cap: 'M2 9l10-5 10 5-10 5L2 9ZM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm2 14h13',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3 3 0 0 1 0 5.6M17.5 14.3c2.2.6 3.5 2.5 3.5 5.7',
  building: 'M4 21V7l8-4 8 4v14M2 21h20M9 21v-5h6v5M8 10h2M14 10h2M8 13h2M14 13h2',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3ZM8.5 12l2.5 2.5 4.5-5',
  clipboard: 'M9 4h6v3H9zM7 5.5H5.5V21h13V5.5H17M9 12h6M9 16h4',
  laptop: 'M5 6h14v9H5zM2 19h20M9 15v4M15 15v4',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20ZM7.5 12h2.2l1.2-2.2 1.8 4 1.3-1.8h2.5',
  tooth: 'M7.5 4C5.4 4 4 5.7 4 7.9c0 2 1 3.6 1.6 5.6.6 2 .8 6.5 2.3 6.5 1.3 0 1-3.9 2.7-3.9h2.8c1.7 0 1.4 3.9 2.7 3.9 1.5 0 1.7-4.5 2.3-6.5.6-2 1.6-3.6 1.6-5.6C20 5.7 18.6 4 16.5 4c-1.2 0-2 .6-4.5.6S8.7 4 7.5 4Z',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16M12 8.5v7',
  rocket: 'M12 3c3 1.5 5 5 5 9l-2.5 3h-5L7 12c0-4 2-7.5 5-9ZM9.5 15l-2.5 3 3-.5M14.5 15l2.5 3-3-.5M12 9.5a1.2 1.2 0 1 0 0 .01',
}

/* pre: small first line; one: white title line; two: green title line; tag: italic last line. */
const BANNERS = [
  { key: 'about', icon: 'book', pre: 'University of Swat', one: 'About', two: '', tag: 'History • Vision • Mission' },
  { key: 'vice-chancellors-message', icon: 'users', pre: 'University of Swat', one: 'Vice Chancellor’s', two: 'Message', tag: 'Prof. Dr. Husnul Amin' },
  { key: 'research', icon: 'flask', pre: 'University of Swat', one: 'Research', two: '', tag: 'Offices • Journals • Library' },
  { key: 'administration', icon: 'building', pre: 'University of Swat', one: 'Administration', two: '', tag: 'Directorates • Offices • Boards' },
  { key: 'oric-2', icon: 'flask', pre: 'Office of', one: 'Research, Innovation', two: 'and Commercialization', tag: 'ORIC' },
  { key: 'advanced-studies-and-research-board', icon: 'cap', pre: 'Directorate of', one: 'Advanced Studies', two: 'and Research', tag: 'DASR' },
  { key: 'directorate-of-it', icon: 'laptop', pre: 'Directorate of', one: 'Information', two: 'Technology', tag: 'University of Swat' },
  { key: 'controller-of-examination-office', icon: 'clipboard', pre: 'Office of the', one: 'Controller of', two: 'Examinations', tag: 'University of Swat' },
  { key: 'directorate-of-works', icon: 'gear', pre: 'Directorate of', one: 'Works', two: '', tag: 'University of Swat' },
  { key: 'proctorial-board', icon: 'shield', pre: '', one: 'Proctorial', two: 'Board', tag: 'University of Swat' },
  { key: 'kamyab-jawan-markaz', icon: 'rocket', pre: '', one: 'Youth Development', two: 'Centre (YDC)', tag: 'University of Swat' },
  { key: 'alumni', icon: 'users', pre: '', one: 'Alumni', two: 'Association', tag: 'University of Swat' },
  { key: 'hunerkada-center-for-excellence', icon: 'globe', pre: '', one: 'Hunerkada', two: 'Center of Excellence', tag: 'University of Swat' },
  { key: 'allied-health-sciences', icon: 'heart', pre: 'University of Swat', one: 'Faculty of Allied', two: 'Health Sciences', tag: 'Centres • Programmes' },
  { key: 'bs-medical-laboratory-technology', icon: 'flask', pre: 'Allied Health Sciences', one: 'BS Medical Laboratory', two: 'Technology (MLT)', tag: 'University of Swat' },
  { key: 'bs-dental-technology', icon: 'tooth', pre: 'Allied Health Sciences', one: 'BS Dental', two: 'Technology', tag: 'University of Swat' },
  { key: 'doctor-of-physical-therapy', icon: 'users', pre: 'Allied Health Sciences', one: 'Doctor of', two: 'Physical Therapy (DPT)', tag: 'University of Swat' },
  { key: 'bs-radiography-and-imaging-technology', icon: 'scan', pre: 'Allied Health Sciences', one: 'BS Radiography &', two: 'Imaging Technology', tag: 'University of Swat' },
  { key: 'management-and-commerce', icon: 'users', pre: 'Department of', one: 'Management', two: 'and Commerce', tag: 'University of Swat' },
  { key: 'english-and-foreign-languages', icon: 'globe', pre: 'Department of', one: 'English and', two: 'Foreign Languages', tag: 'University of Swat' },
  { key: 'central-library-office', icon: 'book', pre: 'University of Swat', one: 'Central', two: 'Library', tag: 'Hours • Staff • Contact' },
  { key: 'quality-enhancement-cell', icon: 'shield', pre: 'University of Swat', one: 'Quality', two: 'Enhancement Cell', tag: 'QEC' },
  { key: 'academic-calendar', icon: 'clipboard', pre: 'University of Swat', one: 'Academic', two: 'Calendar', tag: 'Semesters • Dates' },
  { key: 'geology', icon: 'globe', pre: 'Department of', one: 'Geology', two: '', tag: 'University of Swat' },
  { key: 'archaeology', icon: 'building', pre: 'Department of', one: 'Archaeology', two: '', tag: 'University of Swat' },
  { key: 'environmental-sciences', icon: 'flask', pre: 'Department of', one: 'Environmental', two: 'Sciences', tag: 'University of Swat' },
  { key: 'economics-and-development-studies', icon: 'clipboard', pre: 'Department of', one: 'Economics and', two: 'Development Studies', tag: 'University of Swat' },
  { key: 'directorate-of-admissions', icon: 'cap', pre: 'Directorate of', one: 'Admissions', two: '', tag: 'University of Swat' },
  { key: 'directorate-of-administration', icon: 'building', pre: 'Directorate of', one: 'Administration', two: '', tag: 'University of Swat' },
  { key: 'directorate-of-planning-and-development', icon: 'clipboard', pre: 'Directorate of', one: 'Planning and', two: 'Development', tag: 'University of Swat' },
  { key: 'directorate-of-research-and-technological-development', icon: 'flask', pre: 'Directorate of Research', one: 'and Technological', two: 'Development', tag: 'University of Swat' },
  { key: 'registeror-office', icon: 'clipboard', pre: 'Office of the', one: 'Registrar', two: '', tag: 'University of Swat' },
  { key: 'treasurer-office', icon: 'building', pre: 'Office of the', one: 'Treasurer', two: '', tag: 'University of Swat' },
  { key: 'provost-office', icon: 'users', pre: 'Office of the', one: 'Provost', two: '', tag: 'Students • Hostels • Discipline' },
  { key: 'vc-office', icon: 'users', pre: 'Office of the', one: 'Vice', two: 'Chancellor', tag: 'University of Swat' },
  { key: 'office-of-the-pro-vice-chancellor-pro-vc', icon: 'shield', pre: 'Office of the', one: 'Pro Vice', two: 'Chancellor', tag: 'University of Swat' },
  { key: 'university-advancement-financial-aid-office', icon: 'heart', pre: 'University Advancement', one: 'and Financial', two: 'Aid Office', tag: 'Scholarships' },
  { key: 'e-office', icon: 'laptop', pre: 'University of Swat', one: 'E-Office', two: '', tag: 'Digital file management' },
  { key: 'dean-office-3', icon: 'flask', pre: 'Faculty of', one: 'Chemical Sciences', two: 'Dean’s Office', tag: 'University of Swat' },
  { key: 'election-administrative-officers-and-faculty-members', icon: 'users', pre: 'University of Swat', one: 'Elections', two: 'to the Authorities', tag: 'Officers and faculty members' },
  { key: 'press-release', icon: 'globe', pre: 'University of Swat', one: 'Press', two: 'Releases', tag: 'Headlines' },
  { key: 'developmental-projects', icon: 'building', pre: 'University of Swat', one: 'Developmental', two: 'Projects', tag: 'Campus buildings' },
  { key: 'research-group', icon: 'flask', pre: 'Research Group', one: 'Ecological Risk', two: 'Assessment', tag: 'and Environmental Management' },
  { key: 'directorate-of-sports', icon: 'users', pre: 'Directorate of', one: 'Sports', two: '', tag: 'University of Swat' },
  { key: 'office-365', icon: 'laptop', pre: 'University of Swat', one: 'Office 365', two: '', tag: 'University of Swat' },
  { key: 'office-of-the-deans', icon: 'cap', pre: 'Office of the', one: 'Deans', two: '', tag: 'University of Swat' },
  { key: 'maincampus', icon: 'building', pre: 'University of Swat', one: 'Main Campus', two: '', tag: 'Charbagh' },
  { key: 'women-campus', icon: 'heart', pre: 'University of Swat', one: 'Women Campus', two: '', tag: 'College of Home Sciences' },
  { key: 'sangota-campus', icon: 'building', pre: 'University of Swat', one: 'Sangota Campus', two: '', tag: 'University of Swat' },
  { key: 'red-crescent-building', icon: 'building', pre: 'University of Swat', one: 'Red Crescent', two: 'Building', tag: 'University of Swat' },
  { key: 'convocation-2022', icon: 'cap', pre: 'University of Swat', one: '2nd Convocation', two: '', tag: 'University of Swat' },
  { key: 'open-day', icon: 'users', pre: 'University of Swat', one: 'Open Day', two: 'for Admissions', tag: 'University of Swat' },
  { key: 'admissions', icon: 'cap', pre: 'University of Swat', one: 'Admissions', two: '', tag: 'Apply, notices and merit lists' },
  { key: 'merit-list', icon: 'clipboard', pre: 'University of Swat', one: 'Merit Lists', two: '', tag: 'Admissions' },
  { key: 'downloads', icon: 'book', pre: 'University of Swat', one: 'Forms, Rules', two: 'and Policies', tag: 'Downloads' },
  { key: 'physics', icon: 'rocket', pre: 'University of Swat', one: 'Department of', two: 'Physics', tag: 'BS Physics' },
  { key: 'chemistry', icon: 'flask', pre: 'University of Swat', one: 'Department of', two: 'Chemistry', tag: 'BS Chemistry' },
  { key: 'mathematics-and-statistics', icon: 'cap', pre: 'University of Swat', one: 'Mathematics', two: 'and Statistics', tag: 'Numbers, proof and data' },
  { key: 'bs-physics-2', icon: 'rocket', pre: 'Department of Physics', one: 'BS', two: 'Physics', tag: 'University of Swat' },
  { key: 'bs-chemistry-2', icon: 'flask', pre: 'Department of Chemistry', one: 'BS', two: 'Chemistry', tag: 'University of Swat' },
  { key: 'bs-mathematics-2', icon: 'cap', pre: 'Mathematics and Statistics', one: 'BS', two: 'Mathematics', tag: 'University of Swat' },
  { key: 'bs-statistics', icon: 'clipboard', pre: 'Mathematics and Statistics', one: 'BS', two: 'Statistics', tag: 'University of Swat' },
  { key: 'botany', icon: 'globe', pre: 'University of Swat', one: 'Department of', two: 'Botany', tag: 'BS Botany' },
  { key: 'zoology', icon: 'heart', pre: 'University of Swat', one: 'Department of', two: 'Zoology', tag: 'BS Zoology' },
  { key: 'biotechnology-genetics-forensic-and-microbiology', icon: 'flask', pre: 'University of Swat', one: 'Biotechnology, Genetics,', two: 'Forensic and Microbiology', tag: 'BS Biotechnology, Genetics, Microbiology' },
  { key: 'psychological-studies', icon: 'users', pre: 'University of Swat', one: 'Psychological', two: 'Studies', tag: 'BS Psychology' },
  { key: 'agricultural-sciences-and-forestry', icon: 'globe', pre: 'University of Swat', one: 'Agricultural Sciences', two: 'and Forestry', tag: 'BS Forestry' },
  { key: 'bs-botany-2', icon: 'globe', pre: 'Department of Botany', one: 'BS', two: 'Botany', tag: 'University of Swat' },
  { key: 'bs-zoology-2', icon: 'heart', pre: 'Department of Zoology', one: 'BS', two: 'Zoology', tag: 'University of Swat' },
  { key: 'bs-biotechnology-3', icon: 'flask', pre: 'Biotechnology and Microbiology', one: 'BS', two: 'Biotechnology', tag: 'University of Swat' },
  { key: 'bs-genetics-3', icon: 'flask', pre: 'Biotechnology and Microbiology', one: 'BS', two: 'Genetics', tag: 'University of Swat' },
  { key: 'bs-microbiology-3', icon: 'flask', pre: 'Biotechnology and Microbiology', one: 'BS', two: 'Microbiology', tag: 'University of Swat' },
  { key: 'bs-psychology-2', icon: 'users', pre: 'Psychological Studies', one: 'BS', two: 'Psychology', tag: 'University of Swat' },
  { key: 'bs-forestry', icon: 'globe', pre: 'Agricultural Sciences and Forestry', one: 'BS', two: 'Forestry', tag: 'University of Swat' },
  { key: 'bs-geology-2', icon: 'globe', pre: 'Department of Geology', one: 'BS', two: 'Geology', tag: 'University of Swat' },
  { key: 'bs-archaeology', icon: 'book', pre: 'Department of Archaeology', one: 'BS', two: 'Archaeology', tag: 'University of Swat' },
  { key: 'bs-environmental-sciences', icon: 'globe', pre: 'Environmental Sciences', one: 'BS', two: 'Environmental Sciences', tag: 'University of Swat' },
  { key: 'bs-economics-2', icon: 'clipboard', pre: 'Economics and Development Studies', one: 'BS', two: 'Economics', tag: 'University of Swat' },
  { key: 'bs-development-studies-2', icon: 'users', pre: 'Economics and Development Studies', one: 'BS', two: 'Development Studies', tag: 'University of Swat' },
  { key: 'bs-english-2', icon: 'book', pre: 'English and Foreign Languages', one: 'BS', two: 'English', tag: 'University of Swat' },
  { key: 'bba-hons-2', icon: 'building', pre: 'Management and Commerce', one: 'BBA', two: '(Hons)', tag: 'University of Swat' },
  { key: 'education-and-staff-training', icon: 'cap', pre: 'Department of Education', one: 'and Staff', two: 'Training', tag: 'University of Swat' },
  { key: 'home-economics', icon: 'heart', pre: 'Department of', one: 'Home', two: 'Economics', tag: 'University of Swat' },
  { key: 'islamic-and-arabic-studies', icon: 'book', pre: 'Department of Islamic', one: 'and Arabic', two: 'Studies', tag: 'University of Swat' },
  { key: 'law-sharia', icon: 'shield', pre: 'Department of', one: 'Law and', two: 'Shari’a', tag: 'University of Swat' },
  { key: 'media-and-communication-studies', icon: 'globe', pre: 'Department of Media', one: 'and Communication', two: 'Studies', tag: 'University of Swat' },
  { key: 'pakistan-studies', icon: 'building', pre: 'Department of', one: 'Pakistan', two: 'Studies', tag: 'University of Swat' },
  { key: 'pashto', icon: 'book', pre: 'Department of', one: 'Pashto', two: '', tag: 'University of Swat' },
  { key: 'social-and-gender-studies', icon: 'users', pre: 'Department of Social', one: 'and Gender', two: 'Studies', tag: 'University of Swat' },
  { key: 'tourism-and-hospitality', icon: 'globe', pre: 'Department of Tourism', one: 'and', two: 'Hospitality', tag: 'University of Swat' },
  { key: 'urdu', icon: 'book', pre: 'Department of', one: 'Urdu', two: '', tag: 'University of Swat' },
  { key: 'b-ed-hons', icon: 'cap', pre: 'Education and Staff Training', one: 'B.Ed', two: '(Hons)', tag: 'University of Swat' },
  { key: 'bs-home-economics', icon: 'heart', pre: 'Department of Home Economics', one: 'BS', two: 'Home Economics', tag: 'University of Swat' },
  { key: 'bs-islamic-studies-2', icon: 'book', pre: 'Islamic and Arabic Studies', one: 'BS', two: 'Islamic Studies', tag: 'University of Swat' },
  { key: 'ba-llb-law-and-shariah', icon: 'shield', pre: 'Department of Law and Shari’a', one: 'BA LL.B', two: '(Law and Shari’a)', tag: 'University of Swat' },
  { key: 'bs-journalism-and-mass-communication-2', icon: 'globe', pre: 'Media and Communication Studies', one: 'BS', two: 'Media and Communication', tag: 'University of Swat' },
  { key: 'bs-pakistan-studies-2', icon: 'building', pre: 'Department of Pakistan Studies', one: 'BS', two: 'Pakistan Studies', tag: 'University of Swat' },
  { key: 'bs-sociology', icon: 'users', pre: 'Social and Gender Studies', one: 'BS', two: 'Sociology', tag: 'University of Swat' },
  { key: 'bs-criminology', icon: 'shield', pre: 'Social and Gender Studies', one: 'BS', two: 'Criminology', tag: 'University of Swat' },
  { key: 'bs-tourism-and-hospitality-2', icon: 'globe', pre: 'Tourism and Hospitality', one: 'BS', two: 'Tourism and Hospitality', tag: 'University of Swat' },
  { key: 'bs-culinary-arts', icon: 'heart', pre: 'Tourism and Hospitality', one: 'BS', two: 'Culinary Arts', tag: 'University of Swat' },
  { key: 'bs-pashto', icon: 'book', pre: 'Department of Pashto', one: 'BS', two: 'Pashto', tag: 'University of Swat' },
  { key: 'bs-urdu', icon: 'book', pre: 'Department of Urdu', one: 'BS', two: 'Urdu', tag: 'University of Swat' },
]

const circuit = (flip) => {
  const lines = [
    [0, 90, 190, 90, 250, 150, 520, 150],
    [0, 150, 120, 150, 180, 210, 380, 210],
    [0, 40, 300, 40, 340, 80, 610, 80],
  ]
  const g = lines
    .map((p) => {
      const pts = [[p[0], p[1]], [p[2], p[3]], [p[4], p[5]], [p[6], p[7]]].map((q) => q.join(',')).join(' ')
      return `<polyline points="${pts}" fill="none" stroke="#3fdc6a" stroke-opacity=".5" stroke-width="3"/><circle cx="${p[6]}" cy="${p[7]}" r="7" fill="#02200c" stroke="#5ee27a" stroke-width="3"/>`
    })
    .join('')
  return `<svg class="circuit ${flip ? 'br' : 'tl'}" viewBox="0 0 640 260" width="640" height="260">${g}</svg>`
}

const html = (b) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;font-weight:800;src:url(${font('poppins-latin-800-normal.woff2')})}
@font-face{font-family:P;font-weight:600;src:url(${font('poppins-latin-600-normal.woff2')})}
@font-face{font-family:P;font-weight:600;font-style:italic;src:url(${font('poppins-latin-600-italic.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1672px;height:941px;overflow:hidden;font-family:P,sans-serif;color:#fff;position:relative;
 background:radial-gradient(ellipse 60% 70% at 76% 46%,#127a35 0%,#07481d 38%,#032610 70%,#021a0a 100%)}
body::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(94,226,122,.22) 1.6px,transparent 1.7px);background-size:34px 34px;
 -webkit-mask-image:radial-gradient(ellipse 55% 65% at 78% 46%,#000 0%,transparent 80%);mask-image:radial-gradient(ellipse 55% 65% at 78% 46%,#000 0%,transparent 80%)}
.circuit{position:absolute}.tl{left:0;top:0}.br{right:0;bottom:0;transform:rotate(180deg)}
.wave{position:absolute;left:0;bottom:0;width:100%;height:160px}
.text{position:absolute;left:150px;top:231px;height:362px;width:800px;display:flex;flex-direction:column;justify-content:center}
.pre{font-weight:600;font-size:46px;color:#dff8e3;display:flex;align-items:center;gap:26px;margin-bottom:6px}
.pre i{display:block;height:3px;width:150px;background:linear-gradient(90deg,#5ee27a,transparent)}
.one{font-weight:800;line-height:1.04;white-space:nowrap}
.two{font-weight:800;line-height:1.04;color:#6cf08a;white-space:nowrap}
.tag{margin-top:16px;font-style:italic;font-weight:600;font-size:38px;color:#effaf0}
.art{position:absolute;right:130px;top:412px;transform:translateY(-50%);width:560px;height:560px}
.tile{position:absolute;inset:80px;border-radius:84px;background:linear-gradient(145deg,rgba(94,226,122,.28),rgba(94,226,122,.05));border:3px solid rgba(124,255,160,.55);
 box-shadow:0 0 90px rgba(94,226,122,.55),inset 0 0 60px rgba(94,226,122,.18);display:grid;place-items:center}
.tile svg{width:250px;height:250px;stroke:#9dffb4;fill:none;stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 14px rgba(124,255,160,.9))}
.ring{position:absolute;inset:0;border-radius:50%;border:2px dashed rgba(124,255,160,.35)}
.ring.b{inset:-60px;border:2px solid rgba(124,255,160,.18)}
.node{position:absolute;width:26px;height:26px;border-radius:50%;background:#02200c;border:4px solid #5ee27a;box-shadow:0 0 22px rgba(94,226,122,.9)}
</style>
<body>
${circuit(false)}${circuit(true)}
<svg class="wave" viewBox="0 0 1672 160" preserveAspectRatio="none"><path d="M0 120 C300 40 620 150 980 110 S1500 70 1672 120 L1672 160 L0 160Z" fill="rgba(2,26,10,.85)"/><path d="M0 120 C300 40 620 150 980 110 S1500 70 1672 120" fill="none" stroke="#5ee27a" stroke-width="5" stroke-opacity=".8"/></svg>
<div class="text" id="t">
 ${b.pre ? `<div class="pre"><span>${b.pre}</span><i></i></div>` : ''}
 <div class="one" id="one">${b.one}</div>
 ${b.two ? `<div class="two" id="two">${b.two}</div>` : ''}
 <div class="tag">${b.tag}</div>
</div>
<div class="art"><div class="ring"></div><div class="ring b"></div>
 <div class="tile"><svg viewBox="0 0 24 24"><path d="${ICON[b.icon]}"/></svg></div>
 <span class="node" style="left:40px;top:120px"></span><span class="node" style="right:20px;top:60px"></span><span class="node" style="right:-20px;bottom:150px"></span><span class="node" style="left:110px;bottom:20px"></span>
</div>
`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } })
for (const b of BANNERS) {
  await page.setContent(html(b))
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    // one font size for both title lines: as large as fits the 800 px text column, at most 130 px and short enough for the 362 px window the page shows (measured after the fonts load)
    const lines = [...document.querySelectorAll('.one,.two')]
    let s = 130
    const fits = () => {
      lines.forEach((l) => (l.style.fontSize = s + 'px'))
      return Math.max(...lines.map((l) => l.scrollWidth)) <= 800
    }
    const room = () => [...document.getElementById('t').children].reduce((h, c) => h + c.getBoundingClientRect().height + parseFloat(getComputedStyle(c).marginTop) + parseFloat(getComputedStyle(c).marginBottom), 0) <= 340
    while ((!fits() || !room()) && s > 56) s -= 2
    return s
  })
  const png = await page.screenshot()
  await sharp(png).webp({ quality: 84 }).toFile(path.join(OUT, `banner-${b.key}.webp`))
  console.log('wrote', b.key)
}
await browser.close()
