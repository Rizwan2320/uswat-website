/**
 * SAMPLE candidate source (FP-11 stand-in). A fixed list with deliberate repeats, so the de-duplication and the claim queue
 * can be shown. DOIs use 10.5555, the prefix Crossref reserves for tests, so none of them points at a real paper.
 * The list is the same for every ORCID iD: it is dummy data, not a lookup. The real source calls OpenAlex by ORCID.
 */
import type { CandidateSource } from './types'

export const SAMPLE_WORKS = [
  { title: 'Sample paper: a study of optical fibres in rural networks', year: 2022, venue: 'Journal of Sample Results', doi: '10.5555/sample.2022.001', authors: ['A. Sample', 'B. Example'] },
  // Same work as above with the DOI written the other way (a repeat from a second index).
  { title: 'Sample paper: a study of optical fibres in rural networks', year: 2022, venue: 'Journal of Sample Results', doi: 'https://doi.org/10.5555/SAMPLE.2022.001', authors: ['A. Sample', 'B. Example'] },
  { title: 'Sample paper: laser cooling in a teaching laboratory', year: 2021, venue: 'Sample Physics Letters', doi: '10.5555/sample.2021.014', authors: ['A. Sample'] },
  // No DOI, same title and year as the one above, different punctuation and case.
  { title: 'SAMPLE PAPER — laser cooling in a teaching laboratory!', year: 2021, venue: 'Sample Physics Letters', doi: '', authors: ['A. Sample'] },
  { title: 'Sample paper: water quality of a sample river', year: 2019, venue: 'Proceedings of the Sample Conference', doi: '', authors: ['C. Another', 'A. Sample'] },
  // Probably someone else with the same name: the person is expected to answer "not me".
  { title: 'Sample paper: soil chemistry of a sample valley', year: 2020, venue: 'Journal of Sample Soil Science', doi: '10.5555/sample.2020.077', authors: ['D. Other'] },
  { title: 'نمونہ مقالہ: ایک نمونہ وادی میں پانی', year: 2023, venue: 'نمونہ جریدہ', doi: '10.5555/sample.2023.003', authors: ['اے نمونہ'] },
  // Broken records a real source might return; validation must drop them.
  { title: '', year: 2020, venue: 'x', doi: '', authors: ['A. Sample'] },
  { title: 'Sample paper: year out of range', year: 1066, venue: 'x', doi: '', authors: ['A. Sample'] },
] as const

export const sampleSource: CandidateSource = {
  sample: true,
  async fetch() {
    return SAMPLE_WORKS.map((w) => ({ ...w, authors: [...w.authors] }))
  },
}
