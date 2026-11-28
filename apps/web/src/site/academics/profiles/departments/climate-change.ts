import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Climate Change and Disaster Management, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   THE OWNER ASKED FOR THIS PAGE TO BE INVENTED (2026-11-28): the university's page for the department holds only its title (the saved copy is one line, and the
   old address list files it as an empty shell). So the department's NAME and the programme name "BS Disaster Preparedness and Climate Change" (which the
   Environmental Sciences page lists) are the only real parts. Everything else is illustrative text for the template that nobody in the department has written:
   `status: 'draft'`, and the page says so at the foot. No staff are named, and no eligibility, fee or intake date is given.
   When the department writes its own text, replace it and set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-climate-change-and-disaster-management/'
const ENV_PAGE = 'https://uswat.edu.pk/department-of-environmental-sciences/'
export const SLUG = 'climate-change-and-disaster-management'
export const BS = 'bs-disaster-preparedness-and-climate-change'

export const climateChange: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Climate Change and Disaster Management',
  tagline: 'Prepare for floods, glaciers and a changing climate.',
  intro: 'A department for the science of climate change and the practice of preparing for, and recovering from, disasters in the mountain valleys of the north.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Climate Change and Disaster Management. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Climate Change and Disaster Management'),
  levelText: 'BS',
  programmesLede: 'The department’s degree is the BS in Disaster Preparedness and Climate Change.',
  about: [
    'The Swat Valley knows floods, landslides and a warming climate at first hand. The Department of Climate Change and Disaster Management teaches students how climate change works, how hazards become disasters, and how communities and governments can prepare, respond and recover.',
    'Students learn the science of weather, water and hazard, and the practice of risk assessment, early warning, emergency planning and community resilience, with field work in the valleys.',
    'This page is illustrative: the university’s own page for the department holds only its title, so the text below was written for the template and has not been checked by the department.',
  ],
  vision: 'To be a centre where the science of climate change and the practice of disaster management meet, to make mountain communities safer.',
  mission:
    'To educate graduates who can assess hazards and climate risk, plan for emergencies, and work with communities and agencies before, during and after a disaster.',
  highlights: [
    { icon: 'cloud', title: 'Climate science', text: 'Weather, climate, glaciers and water in a mountain setting.' },
    { icon: 'shield', title: 'Disaster preparedness', text: 'Risk assessment, early warning and emergency plans.' },
    { icon: 'globe', title: 'Field work in the valleys', text: 'Visits to flood-prone and landslide-prone sites.' },
    { icon: 'users', title: 'Community resilience', text: 'Working with villages, schools and local agencies.' },
    { icon: 'chart', title: 'Maps and data', text: 'GIS, remote sensing and climate data.' },
    { icon: 'briefcase', title: 'Careers in relief and planning', text: 'Agencies, NGOs and local government.' },
  ],
  disciplines: [BS],
  labs: [
    { title: 'GIS and remote sensing laboratory', text: 'Hazard maps, satellite images and flood models.', art: officeHero(SLUG), tools: ['GIS software', 'Satellite imagery', 'Large-format screens'] },
    { title: 'Weather and climate station', text: 'Recording temperature, rainfall and river levels.', art: officeHero(BS), tools: ['Weather sensors', 'Rain gauges', 'Data loggers'] },
    { title: 'Emergency operations room', text: 'Table-top exercises in running a response.', art: officeHero(SLUG), tools: ['Wall maps', 'Radio sets', 'Exercise scenarios'] },
    { title: 'Field kit store', text: 'Equipment for hazard surveys and community mapping.', art: officeHero(BS), tools: ['GPS units', 'Survey tapes', 'First-aid kits'] },
  ],
  research: [
    { icon: 'cloud', title: 'Climate and hydrology', text: 'Rainfall, snowmelt and river flow in the upper valleys.', tags: ['Climate', 'Rivers', 'Snowmelt'] },
    { icon: 'shield', title: 'Hazard and risk', text: 'Floods, landslides and glacial lakes.', tags: ['Floods', 'Landslides', 'Risk maps'] },
    { icon: 'users', title: 'Community preparedness', text: 'How villages and schools plan for emergencies.', tags: ['Preparedness', 'Schools', 'Early warning'] },
    { icon: 'search', title: 'Recovery and adaptation', text: 'Rebuilding and adjusting livelihoods after a disaster.', tags: ['Recovery', 'Adaptation', 'Livelihoods'] },
  ],
  careers: [
    { icon: 'shield', title: 'Disaster management officer', text: 'Provincial and district disaster management bodies.' },
    { icon: 'globe', title: 'Climate and environment analyst', text: 'Government, research and consulting.' },
    { icon: 'users', title: 'Relief and development worker', text: 'NGOs and international organisations.' },
    { icon: 'chart', title: 'GIS analyst', text: 'Mapping hazards and planning response.' },
    { icon: 'briefcase', title: 'Risk and safety adviser', text: 'Companies, hotels and infrastructure projects.' },
    { icon: 'cap', title: 'Teacher or researcher', text: 'Further study and teaching.' },
  ],
  studentLife: [
    { icon: 'shield', title: 'Emergency drills', text: 'A yearly campus drill run with the students.' },
    { icon: 'globe', title: 'Field days', text: 'Visits to river banks, slopes and relief sites.' },
    { icon: 'users', title: 'Resilience society', text: 'Student-run talks and community awareness sessions.' },
    { icon: 'trophy', title: 'Scenario contests', text: 'Teams plan a response to a made-up disaster.' },
  ],
  faq: [
    { q: 'Which programme does the department offer?', a: 'The BS in Disaster Preparedness and Climate Change. The Environmental Sciences page also names the programme.' },
    { q: 'What do I need to apply?', a: 'No eligibility rule is published for this programme yet. Admission rules are published with each intake on the admissions pages.' },
    { q: 'Who leads the department?', a: 'No head of department is named yet.' },
    { q: 'Is this page final?', a: 'No. The university’s own page for the department holds only its title, so the text here is illustrative and marked as a draft.' },
  ],
  peopleTitle: 'Faculty',
  peopleLede: 'No staff are named yet.',
  alumni: ['flood-risk-in-a-valley-village', 'a-school-evacuation-plan-for-a-hill-town', 'glacier-melt-and-a-local-water-channel'],
  reference: {
    sources: [
      { label: 'Department of Climate Change and Disaster Management page, University of Swat (title only)', url: PAGE },
      { label: 'Department of Environmental Sciences page, University of Swat (names the programme)', url: ENV_PAGE },
    ],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The university’s page for this department holds only its title, and the old address list files it as an empty shell. At the owner’s request the text on this page is illustrative and was written for the template; the department has not checked any of it.',
      'The department name and the name of the programme (BS Disaster Preparedness and Climate Change) are the only parts taken from the university’s pages. The Environmental Sciences page lists the same programme, and another list on it calls it “BS Climate Change”.',
      'No head of department, staff, eligibility, fee, seat number or intake date is stated; none is shown here.',
      'The old address list has no programme page for this degree; its page here is new.',
    ],
  },
  team: [],
}

export const bsDisasterClimate: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Disaster Preparedness and Climate Change',
  shortName: 'Disaster Preparedness and Climate Change',
  curriculumLede:
    'This study plan is illustrative: the university has not published a scheme of studies for this programme. Elective courses are chosen from the tracks below.',
  tagline: 'Understand the hazard. Plan the response.',
  summary: 'Climate science, hazard and risk, emergency planning and community resilience over four years, with field work and a capstone project.',
  ...pictures(BS, SLUG, 'BS Disaster Preparedness and Climate Change. Department of Climate Change and Disaster Management, University of Swat.', 'Illustration for BS Disaster Preparedness and Climate Change'),
  about: [
    'The BS in Disaster Preparedness and Climate Change teaches how the climate is changing, how floods, landslides and other hazards become disasters, and how to plan for and respond to them.',
    'Students combine laboratory and GIS work with field visits, and finish with a capstone project on a real risk in a mountain community. This text is illustrative and has not been checked by the department.',
  ],
  whyStudy: [
    { icon: 'shield', title: 'Work that protects people', text: 'Preparedness and response in a hazard-prone region.' },
    { icon: 'chart', title: 'Skills in demand', text: 'GIS, risk assessment and emergency planning.' },
    { icon: 'globe', title: 'Learn in the field', text: 'Rivers, slopes and villages as a classroom.' },
    { icon: 'users', title: 'Community focus', text: 'Resilience is built with local people.' },
  ],
  outcomes: [
    'Explain how climate change affects weather, water and hazards in mountain regions.',
    'Assess the risk of a flood, landslide or other hazard for a community.',
    'Prepare an emergency plan and an early warning scheme.',
    'Use GIS and remote sensing to map hazard and exposure.',
    'Work with communities and agencies before, during and after a disaster.',
    'Carry out and report a field study.',
  ],
  years: [
    year(1, ['Introduction to Climate Science', 'Introduction to Disaster Management', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Physical Geography', 'Introduction to Hazards', 'Expository Writing', 'Pakistan Studies', 'Statistics']),
    year(2, ['Weather and Climate', 'Hydrology', 'Hazard Mapping', 'Research Methods', 'Community Preparedness'], ['Climate Change Science', 'Flood and Landslide Risk', 'GIS Basics', 'Emergency Planning', 'Environmental Law and Policy']),
    year(3, ['Remote Sensing', 'Risk Assessment', 'Early Warning Systems', 'Climate Adaptation', 'Field Work I'], ['Disaster Response and Relief', 'Recovery and Reconstruction', 'Climate Policy', 'Elective I', 'Field Work II']),
    year(4, ['Elective II', 'Elective III', 'Humanitarian Principles', 'Capstone Project I'], ['Elective IV', 'Seminar', 'Internship', 'Capstone Project II']),
  ],
  tracks: [
    { icon: 'cloud', title: 'Climate science', text: 'Weather, climate and hydrology.' },
    { icon: 'shield', title: 'Hazard and risk', text: 'Mapping and assessing hazards.' },
    { icon: 'users', title: 'Emergency management', text: 'Planning, response and relief.' },
    { icon: 'chart', title: 'Geospatial analysis', text: 'GIS and remote sensing.' },
  ],
  skills: [
    { group: 'Technical', items: ['GIS', 'Remote sensing', 'Hazard mapping', 'Data analysis'] },
    { group: 'Planning', items: ['Risk assessment', 'Emergency planning', 'Early warning design', 'Report writing'] },
    { group: 'Professional', items: ['Community engagement', 'Teamwork', 'Communication under pressure'] },
  ],
  careers: [
    { icon: 'shield', title: 'Disaster management officer', text: 'District and provincial bodies.' },
    { icon: 'globe', title: 'Climate analyst', text: 'Government and research.' },
    { icon: 'users', title: 'Relief worker', text: 'NGOs and international organisations.' },
    { icon: 'chart', title: 'GIS analyst', text: 'Mapping and planning.' },
    { icon: 'cap', title: 'Teacher or researcher', text: 'Further study and teaching.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'No eligibility rule is published for this programme yet; the admissions pages publish the rules with each intake.' },
    ...scienceFaq('Disaster Preparedness and Climate Change', 4),
  ],
}
