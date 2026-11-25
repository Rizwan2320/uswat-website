import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/research-group/'

/* The books and papers on the group’s page, shortened to first author (then “et al.”), year where the page gives one, title and journal. The full author lists are on the university’s page. */
const PUBLICATIONS = [
  'Khan, K., et al. (2014). Environmental Concentrations of Heavy Metals and Their Health Impacts (book). LAP Lambert, Saarbrücken.',
  'Baninla, Y., et al. (2020). Material use and resource efficiency of African sub-regions. Journal of Cleaner Production 247.',
  'Zhang, M., et al. (2020). Bioaccumulation and human exposure of perfluoroalkyl acids (PFAAs) in vegetables from the largest vegetable production base of China. Environment International 135.',
  'Cao, X., et al. (2019). Hydrogeochemistry and quality of surface water and groundwater in the drinking water source area of an urbanizing region. Ecotoxicology and Environmental Safety 186.',
  'Ahmad, R., et al. (2019). LCA of Hospital Solid Waste Treatment Alternatives in a Developing Country: The Case of District Swat, Pakistan. Sustainability 11(13).',
  'Cao, X., et al. (2019). Occurrence, sources and health risk of polyfluoroalkyl substances (PFASs) in soil, water and sediment from a drinking water source area. Ecotoxicology and Environmental Safety 174.',
  'Sharif, H.M.A., et al. (2019). NO removal with efficient recovery of N2O by using recyclable Fe3O4@EDTA@Fe(II) complex: a novel approach towards resource recovery from flue gas. Environmental Science & Technology.',
  'Wang, C., et al. (2019). Simulating transport, flux, and ecological risk of perfluorooctanoate in a river affected by a major fluorochemical manufacturer in northern China. Science of the Total Environment 657.',
  'Baninla, Y., et al. A transitional perspective of global and regional mineral material flows. Resources, Conservation and Recycling 140.',
  'Lu, X., et al. Climate change induced eutrophication of cold-water lake in an ecologically fragile nature reserve. Journal of Environmental Sciences 75.',
  'Ilyas, M., et al. (2018). Plastic waste as a significant threat to environment: a systematic literature review. Reviews on Environmental Health.',
  'Su, C., et al. Multimedia fate and transport simulation of Perfluorooctanoic Acid/Perfluorooctanoate in an urbanizing area. Science of the Total Environment 643.',
  'Shuai, S., et al. (2018). Spatio-temporal Characteristics of the Extreme Climate Events and Their Potential Effects on Crop Yield in Ethiopia. Journal of Resources and Ecology 9(3).',
  'Liang, R., et al. (2018). Toxicological effects on earthworms (Eisenia fetida) exposed to sub-lethal concentrations of BDE-47 and BDE-209 from a metabolic point. Environmental Pollution 240.',
  'Li, Q., et al. Risk ranking of environmental contaminants in Xiaoqing River, a heavily polluted river along urbanizing Bohai Rim. Chemosphere 204.',
  'Li, Q., et al. Distribution, source, and risk of organochlorine pesticides (OCPs) and polychlorinated biphenyls (PCBs) in urban and rural soils around the Yellow and Bohai Seas, China. Environmental Pollution 239.',
  'Zhou, Y., et al. (2018). Spatial and vertical variations of perfluoroalkyl acids (PFAAs) in the Bohai and Yellow Seas: Bridging the gap between riverine sources and marine sinks. Environmental Pollution 238.',
  'Cao, X., et al. (2018). An overview of hexabromocyclododecane (HBCDs) in environmental media with focus on their potential risk and management in China. Environmental Pollution 236.',
  'Su, C., et al. (2018). Dynamic multimedia fate simulation of Perfluorooctane Sulfonate (PFOS) from 1981 to 2050 in the urbanizing Bohai Rim of China. Environmental Pollution 235.',
  'Khan, K., et al. (2017). Prevalent fecal contamination in drinking water resources and potential health risks in Swat, Pakistan. Journal of Environmental Sciences 72.',
  'Uwizeyimana, H., et al. (2018). Ecotoxicological effects of binary mixtures of siduron and Cd on mRNA expression in the earthworm Eisenia fetida. Science of the Total Environment 610–611.',
  'Uwizeyimana, H., et al. (2017). The eco-toxic effects of pesticide and heavy metal mixtures towards earthworms in soil. Environmental Toxicology and Pharmacology 55.',
  'Liu, Z., et al. Crop bioaccumulation and human exposure of perfluoroalkyl acids through multi-media transport from a mega fluorochemical industrial park, China. Environment International 106.',
  'Ali, J., et al. (2017). Insight into ecofriendly fabrication of silver nanoparticles by Pseudomonas aeruginosa and its potential impacts. Journal of Environmental Chemical Engineering 5(4).',
  'Nawab, J., et al. (2016). Health risk assessment of heavy metals and bacterial contamination in drinking water sources: a case study of Malakand Agency, Pakistan. Environmental Monitoring and Assessment 188(5).',
  'Maryam, A., & Khan, S. (2017). Effects of Climate Change on Temperature Precipitation and Season’s Pattern as Perceived by the Locals in District Swat Pakistan. SF Journal of Global Warming 1(4).',
  'Nawab, J., et al. (2016). Heavy metals bioaccumulation in native plants in chromite impacted sites: a search for effective remediating plant species. Clean – Soil, Air, Water 44(1).',
  'Shah, N.S., et al. Kinetic and mechanism investigation on the gamma irradiation induced degradation of endosulfan sulfate. Chemosphere 121.',
  'Shamshad, I., et al. (2015). Removal and bioaccumulation of heavy metals from aqueous solutions using freshwater algae. Water Science and Technology 71(1).',
  'Nawab, J., et al. (2015). Quantification of Heavy Metals in Mining Affected Soil and Their Bioaccumulation in Native Plant Species. International Journal of Phytoremediation 17(9).',
  'Khan, K., et al. (2014). Evaluation of toxicological risk of foodstuffs contaminated with heavy metals in Swat, Pakistan. Ecotoxicology and Environmental Safety 108(1).',
  'Maryam, A., et al. (2015). The Perception of Local Community about the Effects of Climate Change in Upper Swat, Khyber Pakhtunkhwa, Pakistan. Earth Science & Climatic Change 5(3).',
  'Ishtiaq, M., et al. (2014). Prevalence of Pneumoconiosis among coal miners of Cherat, district Nowshera, Pakistan. Journal of Postgraduate Medical Institute 28(2).',
  'Waqas, M., et al. (2014). Quantification of PAHs and health risk via ingestion of vegetable in Khyber Pakhtunkhwa Province, Pakistan. Science of the Total Environment 497–498.',
  'Naz, R., Maryam, A., & Shabnam, A.M. (2014). Population dynamics of mosquitoes in various breeding habitats at university of Peshawar campus, Khyber Pukhtunkhwa Pakistan. Journal of Entomology and Zoology Studies 2(2).',
  'Khan, K., et al. (2013). Heavy metals in agricultural soils and crops and their health risks in Swat District, northern Pakistan. Food and Chemical Toxicology 58(7).',
  'Khan, K., et al. (2013). Health risks associated with heavy metals in the drinking water of Swat, northern Pakistan. Journal of Environmental Sciences 25(10).'
]

export const researchGroup: OfficeProfile = {
  slug: 'research-group',
  lists: [],
  path: '/research-group',
  trail: [{ label: 'Research', href: '/research' }],
  group: 'Centres and associations',
  name: 'Ecological Risk Assessment and Environmental Management Group',
  shortName: 'Ecological Risk Group',
  lead: 'A research group on persistent toxic substances, ecological risk assessment and environmental management policy, with its people and the papers its page lists.',
  banner: officeBanner('research-group', 'Ecological Risk Assessment and Environmental Management Group. University of Swat.'),
  hero: officeHero('research-group'),
  stats: [
    { value: 35, label: 'papers, to 23 June 2021' },
    { value: 1213, label: 'citations, to 23 June 2021' },
    { value: 19, label: 'h-index, to 23 June 2021' },
    { value: 27, label: 'i10-index, to 23 June 2021' },
  ],
  about: [
    'This group mainly focus on the spatial diffusion, ecological effects and management policy of persistent toxic substances, the methodologies of ecological risk assessment and control strategies, the environmental policies for the innovation and commercialization of environmentally sound technologies, and the theories and methods of environmental management to meet the requirement of Pakistan.',
    'The group scientific collaborations are extensive and include those within the department and those with other departments at University of Swat, other national and international universities, industrial partners, and international research groups.',
  ],
  statements: [
    {
      title: 'Kifayatullah Khan, PhD (CAS-TWAS)',
      paragraphs: [
        'Dr. Kifayatullah Khan is Research Professor (associate) at the Department of Environmental and Conservation Sciences, University of Swat, Khyber Pakhtunkhwa, Pakistan. He received his PhD in the discipline of Environmental Sciences from the University of Peshawar in 2013 as a fellow of The World Academy of Sciences (TWAS)-Chinese Academy of Sciences (CAS). He did his Postdoctoral research in the same discipline as a fellow of the 2016 President’s International Fellowship Initiative (PIFI) at the Research Centre for Eco-Environmental Sciences (RCEES), CAS, Beijing, China. He is an active member of International Centre for Integrated Mountain Development (ICIMOD) thematic working group related to water, disaster and resilience; and climate change after successful participation in the ICIMOD International Asia-Pacific Water Leadership Programme (APLWP) held in Australia on April 8-19, 2018.',
        'Research interests: Ecological health impacts and risk assessment of conventional and emerging pollutants: Environmental matrices, Climate change, Urban ecological planning and assessment, Environmental management and policy.',
        'ORCID: 0000-0001-8107-1959 (orcid.org). Citation statistics are as of 23 June 2021, as the page dates them.',
      ],
    },
  ],
  itemLists: [
    {
      title: 'Books and papers listed on the group’s page',
      items: PUBLICATIONS,
      note: 'Shortened to first author, year (where the page gives one), title and journal. The full author lists are on the university’s page.',
    },
  ],
  people: [
    { id: 'kifayatullah-khan', name: 'Dr. Kifayatullah Khan', title: 'Research Professor (associate), Department of Environmental and Conservation Sciences' },
    { id: 'afsheen-maryam', name: 'Ms. Afsheen Maryam', title: 'Listed on the group’s page' },
  ],
  officialPage: PAGE,
  sources: [{ label: 'Research Group page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no office, telephone or group e-mail. Personal e-mail addresses on the page are not shown here.',
    'The citation figures are dated 23 June 2021 on the page and are not updated here.',
    'The page puts the books and papers under Ms. Afsheen Maryam’s name without saying whose they are; they are shown as the group’s list, and the group should confirm.',
  ],
}
