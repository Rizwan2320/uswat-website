import type { DisciplineProfile } from '../../types'
import { year } from '../core'

import { FACULTY, ahFaq, pictures } from './core'

/* Doctor of Physical Therapy (DPT), listed under the Centre for Pharmaceutical and Rehabilitation Sciences (see ahs.ts). A professional
   doctorate, so the study plan runs five years. The text below is illustrative: `status: 'draft'`. */
export const dpt: DisciplineProfile = {
  slug: 'doctor-of-physical-therapy',
  department: FACULTY,
  status: 'draft',
  name: 'Doctor of Physical Therapy (DPT)',
  centre: 'Centre for Pharmaceutical and Rehabilitation Sciences',
  shortName: 'DPT',
  badge: 'DPT',
  level: 'Doctorate',
  duration: '5 years',
  curriculumLede:
    'The first two years build the basic and movement sciences. Clinical practice grows each year, and the fifth year is a hospital internship.',
  tagline: 'Restore movement, reduce pain and help people live well after injury or illness.',
  summary: 'A five-year professional doctorate in assessing, treating and preventing problems of movement and function.',
  ...pictures(
    'doctor-of-physical-therapy',
    'Doctor of Physical Therapy (DPT). Faculty of Allied Health Sciences, University of Swat.',
    'Illustration for Doctor of Physical Therapy',
  ),
  about: [
    'The Doctor of Physical Therapy trains physical therapists: professionals who assess how a person moves and treat problems of the muscles, bones, nerves, heart and lungs with exercise, manual therapy and physical agents such as heat, ice and electrical stimulation.',
    'The first two years cover the basic and movement sciences. From the third year students treat patients under supervision in teaching clinics and hospital departments, and the final year is a full-time clinical internship.',
  ],
  whyStudy: [
    { icon: 'users', title: 'Patients from the start of clinical years', text: 'Supervised practice begins in the third year and grows every semester.' },
    { icon: 'spark', title: 'Many fields to choose from', text: 'Orthopaedic, neurological, paediatric, sports, women’s health and cardiopulmonary physical therapy are all taught.' },
    { icon: 'search', title: 'Evidence-based practice', text: 'Students learn to read research and to choose treatments by the evidence.' },
    { icon: 'cap', title: 'A doctorate and a licence route', text: 'The degree prepares graduates for professional registration and for MS or PhD study.' },
  ],
  outcomes: [
    'Take a patient history, examine movement and function, and reach a physical therapy diagnosis.',
    'Plan and deliver exercise, manual therapy and electrotherapy treatments safely.',
    'Treat people with musculoskeletal, neurological, cardiopulmonary and paediatric conditions.',
    'Read research critically and apply the evidence to treatment decisions.',
    'Communicate with patients, families and the wider health team, and follow professional ethics.',
  ],
  years: [
    year(1, ['Anatomy I', 'Physiology I', 'Biochemistry', 'Functional English', 'Islamic Studies'], ['Anatomy II', 'Physiology II', 'Kinesiology and Biomechanics I', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Neuroanatomy', 'Pathology and Microbiology', 'Biomechanics II', 'Behavioural Sciences', 'Computer Skills for Health Sciences'], ['Exercise Physiology', 'Electrotherapy', 'Physical Agents', 'Pharmacology', 'Biostatistics']),
    year(3, ['Therapeutic Exercise', 'Musculoskeletal Physical Therapy I', 'Neurological Physical Therapy I', 'Medicine for Physical Therapists', 'Research Methods'], ['Musculoskeletal Physical Therapy II', 'Neurological Physical Therapy II', 'Cardiopulmonary Physical Therapy', 'Surgery for Physical Therapists', 'Clinical Practice I']),
    year(4, ['Paediatric Physical Therapy', 'Geriatric Physical Therapy', 'Sports Physical Therapy', 'Orthotics and Prosthetics', 'Clinical Practice II'], ['Women’s Health Physical Therapy', 'Community-Based Rehabilitation', 'Differential Diagnosis', 'Health Management and Ethics', 'Clinical Practice III']),
    year(5, ['Clinical Internship I', 'Evidence-Based Practice', 'Research Project I'], ['Clinical Internship II', 'Professional Practice and Entrepreneurship', 'Research Project II']),
  ],
  tracks: [
    { icon: 'gear', title: 'Musculoskeletal and sports', text: 'Joints, muscles and the return to sport or work after injury.' },
    { icon: 'brain', title: 'Neurological rehabilitation', text: 'Stroke, spinal injury and other conditions of the nervous system.' },
    { icon: 'users', title: 'Paediatric and geriatric care', text: 'Therapy for children and for older adults.' },
    { icon: 'globe', title: 'Community-based rehabilitation', text: 'Taking therapy to people in villages and homes.' },
  ],
  skills: [
    { group: 'Clinical', items: ['Patient assessment', 'Manual therapy', 'Therapeutic exercise', 'Electrotherapy'] },
    { group: 'Analysis', items: ['Movement analysis', 'Evidence appraisal', 'Biostatistics'] },
    { group: 'Professional', items: ['Communication', 'Documentation', 'Ethics', 'Teamwork'] },
  ],
  careers: [
    { icon: 'users', title: 'Physical therapist', text: 'Hospitals, rehabilitation centres and private clinics.' },
    { icon: 'trophy', title: 'Sports physical therapist', text: 'Teams, academies and sports medicine clinics.' },
    { icon: 'globe', title: 'Community rehabilitation worker', text: 'Programmes for people with disabilities and for older adults.' },
    { icon: 'briefcase', title: 'Clinic owner', text: 'Opening and running a physical therapy practice.' },
    { icon: 'cap', title: 'Lecturer or researcher', text: 'Further study, then teaching and research in rehabilitation.' },
  ],
  faq: ahFaq('Doctor of Physical Therapy', 5),
}
