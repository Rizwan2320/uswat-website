import type { DisciplineProfile } from '../../types'
import { year } from '../core'

import { FACULTY, ahFaq, pictures } from './core'

/* BS Dental Technology. Name and listing from the university's own pages (see ahs.ts); the text below is illustrative: `status: 'draft'`. */
export const dt: DisciplineProfile = {
  slug: 'bs-dental-technology',
  department: FACULTY,
  status: 'draft',
  name: 'BS Dental Technology',
  centre: 'Centre for Medical Technologies',
  shortName: 'Dental Technology',
  tagline: 'Crafting dentures, crowns and appliances that fit and last.',
  summary: 'The craft and science of making dental prostheses, from the first impression to the finished crown.',
  ...pictures(
    'bs-dental-technology',
    'BS Dental Technology. Faculty of Allied Health Sciences, University of Swat.',
    'Illustration for BS Dental Technology',
  ),
  about: [
    'BS Dental Technology teaches students to design and make the dental prostheses and appliances that dentists prescribe: dentures, crowns, bridges and orthodontic appliances. They learn the materials, the anatomy of the mouth and the bite, and the skill of working precisely by hand and with digital tools.',
    'Students work at the bench from the first year. The later years add ceramics, implants and computer-aided design, and the final year includes attachments in dental laboratories.',
  ],
  whyStudy: [
    { icon: 'gear', title: 'Craft and technology', text: 'Bench skills with wax, metal and ceramic, together with digital design and milling.' },
    { icon: 'search', title: 'Precision matters', text: 'Every restoration must fit to a fraction of a millimetre, and students learn how to check it.' },
    { icon: 'users', title: 'Work with dentists', text: 'Students learn to read a prescription and to communicate with the clinic.' },
    { icon: 'briefcase', title: 'Room to run your own lab', text: 'Laboratory management is part of the course for graduates who want to start their own.' },
  ],
  outcomes: [
    'Describe the anatomy of the teeth and jaws and how the upper and lower teeth meet.',
    'Select and work with dental materials: waxes, plasters, acrylics, alloys and ceramics.',
    'Make complete and partial dentures, crowns and bridges to a dentist’s prescription.',
    'Use digital impressions and computer-aided design for restorations.',
    'Follow infection control and workplace safety in a dental laboratory.',
  ],
  years: [
    year(1, ['Dental Anatomy and Morphology', 'General Anatomy and Physiology I', 'Dental Materials I', 'Functional English', 'Islamic Studies'], ['General Anatomy and Physiology II', 'Oral Histology', 'Dental Materials II', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Complete Denture Technology I', 'Dental Biomaterials', 'Dental Ceramics', 'Infection Control', 'Computer Skills for Health Sciences'], ['Complete Denture Technology II', 'Removable Partial Denture Technology I', 'Dental Casting and Metal Work', 'Medical Statistics', 'Occlusion and Articulation']),
    year(3, ['Removable Partial Denture Technology II', 'Crown and Bridge Technology I', 'Orthodontic Appliance Technology I', 'Dental Laboratory Management', 'Digital Dentistry I'], ['Crown and Bridge Technology II', 'Orthodontic Appliance Technology II', 'Maxillofacial Prosthetics', 'Research Methods', 'Digital Dentistry II (CAD/CAM)']),
    year(4, ['Laboratory Attachment I', 'Advanced Ceramics and Implants', 'Elective I', 'Research Project I'], ['Laboratory Attachment II', 'Professional Ethics and Practice Management', 'Elective II', 'Research Project II']),
  ],
  tracks: [
    { icon: 'gear', title: 'Prosthodontic technology', text: 'Complete and partial dentures and the metal frameworks beneath them.' },
    { icon: 'spark', title: 'Ceramics and aesthetics', text: 'Crowns and veneers that match the colour and shape of natural teeth.' },
    { icon: 'layers', title: 'Orthodontic appliances', text: 'Braces, retainers and the appliances that move teeth.' },
    { icon: 'code', title: 'Digital dentistry', text: 'Scanning, design and milling of restorations by computer.' },
  ],
  skills: [
    { group: 'Bench work', items: ['Waxing', 'Casting', 'Ceramic layering', 'Finishing and polishing'] },
    { group: 'Digital', items: ['Intraoral scans', 'CAD/CAM design', 'Milling'] },
    { group: 'Professional', items: ['Reading a prescription', 'Infection control', 'Laboratory records'] },
  ],
  careers: [
    { icon: 'gear', title: 'Dental technologist', text: 'Dental laboratories, hospitals and dental colleges.' },
    { icon: 'briefcase', title: 'Laboratory owner or manager', text: 'Running a dental laboratory of your own.' },
    { icon: 'code', title: 'Digital dentistry specialist', text: 'Scanning and CAD/CAM design for clinics and laboratories.' },
    { icon: 'globe', title: 'Technologist abroad', text: 'Dental laboratories in other countries, subject to their registration rules.' },
    { icon: 'cap', title: 'Educator or researcher', text: 'Further study, then teaching and research in dental materials.' },
  ],
  faq: ahFaq('BS Dental Technology', 4),
}
