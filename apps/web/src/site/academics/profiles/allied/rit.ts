import type { DisciplineProfile } from '../../types'
import { year } from '../core'

import { FACULTY, ahFaq, pictures } from './core'

/* BS Radiography & Imaging Technology. It is on the faculty page; no page says which centre runs it (see ahs.ts).
   The text below is illustrative: `status: 'draft'`. */
export const rit: DisciplineProfile = {
  slug: 'bs-radiography-and-imaging-technology',
  department: FACULTY,
  status: 'draft',
  name: 'BS Radiography & Imaging Technology',
  shortName: 'Radiography & Imaging',
  tagline: 'See inside the body safely: X-ray, CT, MRI and ultrasound.',
  summary: 'The technology and technique of medical imaging, with radiation safety taught throughout.',
  ...pictures(
    'bs-radiography-and-imaging-technology',
    'BS Radiography and Imaging Technology. Faculty of Allied Health Sciences, University of Swat.',
    'Illustration for BS Radiography and Imaging Technology',
  ),
  about: [
    'BS Radiography & Imaging Technology teaches students to produce the medical images that doctors use to diagnose illness and injury: X-rays, CT and MRI scans and ultrasound. They learn how each machine works, how to position a patient, and how to get a clear image with the least possible exposure.',
    'Radiation safety and patient care are taught in every semester. Students practise in the imaging suite from the second year, and the final year includes attachments in hospital imaging departments.',
  ],
  whyStudy: [
    { icon: 'search', title: 'Four imaging methods', text: 'Radiography, CT, MRI and ultrasound are all part of the study plan.' },
    { icon: 'shield', title: 'Safety first', text: 'Radiation protection and quality assurance run through the whole degree.' },
    { icon: 'gear', title: 'Technology that keeps changing', text: 'Digital imaging and picture archiving are taught as standard practice.' },
    { icon: 'briefcase', title: 'Demand in every hospital', text: 'Imaging departments need trained technologists in public and private hospitals.' },
  ],
  outcomes: [
    'Position patients and produce diagnostic images for the common radiographic examinations.',
    'Explain how X-ray, CT, MRI and ultrasound equipment works and what each can show.',
    'Apply radiation-protection principles to keep doses as low as reasonably achievable.',
    'Process, store and share images with digital imaging systems.',
    'Care for patients before, during and after an examination, and work with radiologists and clinicians.',
  ],
  years: [
    year(1, ['Human Anatomy I', 'Physiology I', 'Introduction to Radiography and Imaging', 'Functional English', 'Islamic Studies'], ['Human Anatomy II', 'Physiology II', 'Radiation Physics', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Radiographic Anatomy and Positioning I', 'Radiographic Equipment', 'Patient Care and Medical Ethics', 'Medical Statistics', 'Computer Skills for Health Sciences'], ['Radiographic Positioning II', 'Image Processing and Photography', 'Radiation Biology', 'Pathology', 'Contrast Media and Pharmacology']),
    year(3, ['Computed Tomography', 'Ultrasound Imaging I', 'Radiation Protection and Safety', 'Digital Imaging and PACS', 'Clinical Practice I'], ['Magnetic Resonance Imaging', 'Ultrasound Imaging II', 'Fluoroscopy and Interventional Procedures', 'Research Methods', 'Clinical Practice II']),
    year(4, ['Nuclear Medicine and Radiotherapy Basics', 'Quality Assurance in Imaging', 'Hospital Attachment I', 'Research Project I'], ['Professional Ethics and Management', 'Elective', 'Hospital Attachment II', 'Research Project II']),
  ],
  tracks: [
    { icon: 'search', title: 'CT and MRI', text: 'Cross-sectional imaging, protocols and image quality.' },
    { icon: 'spark', title: 'Ultrasound', text: 'Scanning technique for abdominal, obstetric and vascular studies.' },
    { icon: 'shield', title: 'Radiation protection and quality', text: 'Dose measurement, shielding and quality-assurance programmes.' },
    { icon: 'database', title: 'Digital imaging and PACS', text: 'Storing, moving and displaying images across a hospital network.' },
  ],
  skills: [
    { group: 'Imaging', items: ['Patient positioning', 'Exposure selection', 'Image evaluation'] },
    { group: 'Safety', items: ['Dose reduction', 'Shielding', 'Quality assurance'] },
    { group: 'Professional', items: ['Patient care', 'Communication', 'Record keeping'] },
  ],
  careers: [
    { icon: 'search', title: 'Radiographer', text: 'X-ray and imaging departments in hospitals and clinics.' },
    { icon: 'gear', title: 'CT or MRI technologist', text: 'Advanced imaging suites.' },
    { icon: 'spark', title: 'Ultrasound technologist', text: 'Diagnostic ultrasound in hospitals and private centres.' },
    { icon: 'shield', title: 'Radiation safety officer', text: 'Protecting patients and staff and keeping equipment compliant.' },
    { icon: 'cap', title: 'Researcher or lecturer', text: 'Further study, then teaching and research in medical imaging.' },
  ],
  faq: ahFaq('BS Radiography & Imaging Technology', 4),
}
