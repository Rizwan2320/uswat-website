import type { Access, GlobalConfig } from 'payload'

import { hiddenFromContributors } from '../../governance/adminMenu'
import {
  dateUnlessSample,
  HOME_READ_ROLES,
  ICON_LABELS,
  HOME_PORTALS,
  HOME_SLIDES,
  HOME_STATS,
  colourValidate,
  portalsCountValidate,
  homeHrefValidate,
  portalHrefValidate,
  slidesCountValidate,
  SLIDE_ICONS,
  PORTAL_ICONS,
  STAT_ICONS,
  sourceUnlessSample,
} from '../../governance/homeContent'
import { STANDARD } from '../../governance/homePalette'
import { actorFromRequest } from '../../governance/roles'
import { homeAfterChange, homeBeforeChange, homeBeforeOperation } from './hooks'

/**
 * Staff (and auditors) may read drafts. Everyone else, signed in or not, gets the published version
 * only: without this filter a request for `draft=true` returns the unpublished draft to anyone
 * (found by the test in tests/int/governance.homecontent.int.spec.ts, prediction P3z-c).
 */
const readHome: Access = ({ req }) => {
  const actor = actorFromRequest(req)
  if (actor.kind === 'user' && (HOME_READ_ROLES as readonly string[]).includes(actor.role))
    return true
  return { _status: { equals: 'published' } }
}

const iconOptions = (names: readonly string[]) =>
  names.map((value) => ({ value, label: ICON_LABELS[value] ?? value }))

const button = (name: 'primary' | 'secondary', label: string): GlobalConfig['fields'][number] => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'label', label: 'Button text', type: 'text', required: true, localized: true },
    {
      name: 'href',
      label: 'Goes to',
      type: 'text',
      required: true,
      validate: homeHrefValidate,
      admin: {
        description:
          'A page on this site, starting with / (for example /academics), or a full address starting with https://',
      },
    },
    {
      name: 'icon',
      label: 'Icon',
      type: 'select',
      options: iconOptions(SLIDE_ICONS),
      admin: { description: 'Optional. A small picture beside the button text.' },
    },
  ],
})

const colour = (
  name: 'green' | 'yellow' | 'maroon',
  label: string,
  standard: string,
  description: string,
): GlobalConfig['fields'][number] => ({
  name,
  label,
  type: 'text',
  validate: colourValidate,
  admin: {
    description,
    components: {
      Field: { path: '@/admin/ColourPicker', clientProps: { standard, label, description } },
    },
  },
})

/**
 * The home page, editable in the CMS (slice 3z onwards). The headline and the sentence under it were fixed
 * (owner decision 2026-11-07) until the owner asked for the whole landing page to be editable (2026-11-28). Drafts may be incomplete; the
 * rules in governance/homeContent.ts apply when it is published, by approvers and above.
 */
export const HomeContent: GlobalConfig = {
  slug: 'home-content',
  label: 'Home page content',
  admin: {
    group: 'Content',
    hidden: hiddenFromContributors,
    description:
      'The home page: photographs, statistics, admissions bar, portal cards, the Vice Chancellor’s message, the headline text and colours.',
  },
  access: { read: readHome },
  versions: { max: 25, drafts: true },
  fields: [
    {
      name: 'slides',
      label: 'Slides',
      type: 'array',
      labels: { singular: 'Slide', plural: 'Slides' },
      maxRows: HOME_SLIDES.max,
      validate: slidesCountValidate,
      admin: {
        initCollapsed: true,
        description: `The photographs at the top of the home page, in this order. Each photograph shows with its two buttons. ${HOME_SLIDES.min} to ${HOME_SLIDES.max} slides, or none to keep the standard photographs.`,
      },
      fields: [
        {
          name: 'image',
          label: 'Photograph',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description:
              'A landscape photograph at least 1600 pixels wide and under 4 MB. It needs alt text and a recorded rights status in the Media library before you can publish.',
          },
        },
        button('primary', 'First button'),
        button('secondary', 'Second button'),
      ],
    },
    {
      name: 'stats',
      label: 'Statistics',
      type: 'array',
      labels: { singular: 'Statistic', plural: 'Statistics' },
      minRows: HOME_STATS.min,
      maxRows: HOME_STATS.max,
      admin: {
        initCollapsed: true,
        description: `The figures in the statistics bar. ${HOME_STATS.min} to ${HOME_STATS.max}. Every figure needs a source and the date it was checked, or must be ticked as a sample.`,
      },
      fields: [
        { name: 'value', label: 'Number', type: 'number', required: true, min: 0 },
        {
          name: 'suffix',
          label: 'After the number',
          type: 'text',
          maxLength: 4,
          admin: { description: 'For example + . Optional.' },
        },
        { name: 'label', label: 'Label', type: 'text', required: true, localized: true },
        {
          name: 'icon',
          label: 'Icon',
          type: 'select',
          required: true,
          options: iconOptions(STAT_ICONS),
        },
        { name: 'sample', label: 'This is a sample figure', type: 'checkbox', defaultValue: false },
        {
          name: 'source',
          label: 'Where the figure comes from',
          type: 'text',
          validate: sourceUnlessSample,
        },
        {
          name: 'verifiedAt',
          label: 'Checked on',
          type: 'date',
          validate: dateUnlessSample,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      name: 'admissions',
      label: 'Admissions banner',
      type: 'group',
      admin: {
        description:
          'The green bar under the statistics. It shows "Admissions Open" until the last date has passed, then "Closed" with the message below. Leave a field empty to keep the standard text.',
      },
      fields: [
        {
          name: 'session',
          label: 'Intake',
          type: 'text',
          maxLength: 40,
          admin: { description: 'For example: Fall 2026.' },
        },
        {
          name: 'deadline',
          label: 'Last day to apply',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayOnly' },
            description:
              'The bar says Open until the end of this day (Pakistan time) and Closed after it. Empty means Closed.',
          },
        },
        {
          name: 'applyUrl',
          label: 'Apply Online link',
          type: 'text',
          validate: homeHrefValidate,
          admin: { description: 'Where the button goes while admissions are open.' },
        },
        {
          name: 'closedUrl',
          label: 'Link while closed',
          type: 'text',
          validate: homeHrefValidate,
          admin: {
            description: 'Where the "View Admissions" button goes while admissions are closed.',
          },
        },
        {
          name: 'closedDetail',
          label: 'Message while closed',
          type: 'text',
          localized: true,
          maxLength: 160,
        },
        {
          name: 'servicesHeading',
          label: 'Middle heading',
          type: 'text',
          localized: true,
          maxLength: 60,
          admin: { description: 'Shown above Undergraduate · Graduate · Postgraduate.' },
        },
      ],
    },
    {
      name: 'portals',
      label: 'Portal cards',
      type: 'array',
      maxRows: HOME_PORTALS.max,
      validate: portalsCountValidate,
      admin: {
        initCollapsed: true,
        description: `The cards under "University Portals and Services", in this order. ${HOME_PORTALS.min} to ${HOME_PORTALS.max} cards, or none to keep the standard cards.`,
      },
      labels: { singular: 'Card', plural: 'Cards' },
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          localized: true,
          maxLength: 60,
        },
        {
          name: 'description',
          label: 'One line under the title',
          type: 'text',
          required: true,
          localized: true,
          maxLength: 120,
        },
        { name: 'href', label: 'Link', type: 'text', required: true, validate: portalHrefValidate },
        {
          name: 'icon',
          label: 'Icon',
          type: 'select',
          required: true,
          options: iconOptions(PORTAL_ICONS),
        },
      ],
    },
    {
      name: 'leadership',
      label: 'Vice Chancellor’s message',
      type: 'group',
      admin: {
        description:
          'The Vice Chancellor’s section on the home page and the full message in the window that opens from "Read Full Message". Leave a field empty to keep the standard text or photograph.',
      },
      fields: [
        {
          name: 'photo',
          label: 'Photograph',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'A portrait cut out from its background (PNG or WebP with a transparent background) looks best on the home page. It needs alt text and a recorded rights status in the Media library before you can publish. Leave it empty to keep the standard photograph.',
          },
        },
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          maxLength: 80,
          admin: { description: 'For example: Prof. Dr. Husnul Amin.' },
        },
        {
          name: 'role',
          label: 'Job title',
          type: 'text',
          maxLength: 120,
          admin: { description: 'For example: Vice Chancellor, University of Swat.' },
        },
        {
          name: 'quote',
          label: 'Opening shown on the page',
          type: 'textarea',
          maxLength: 700,
          admin: {
            description: 'The short passage in quotation marks next to the photograph. Usually the first lines of the message.',
          },
        },
        {
          name: 'paragraphs',
          label: 'Full message',
          type: 'array',
          labels: { singular: 'Paragraph', plural: 'Paragraphs' },
          maxRows: 40,
          admin: {
            initCollapsed: true,
            description:
              'The full message, one paragraph per row, in order. Leave it empty to keep the standard full message.',
          },
          fields: [
            { name: 'text', label: 'Paragraph', type: 'textarea', required: true, maxLength: 4000 },
          ],
        },
        {
          name: 'closing',
          label: 'Closing words',
          type: 'text',
          maxLength: 60,
          admin: { description: 'Shown above the name at the end. For example: With best regards,' },
        },
      ],
    },
    {
      name: 'hero',
      label: 'Headline text',
      type: 'group',
      admin: {
        description:
          'The words beside the photographs at the top of the home page. Leave a field empty to keep the standard words.',
      },
      fields: [
        {
          name: 'eyebrow',
          label: 'Small line above the headline',
          type: 'text',
          maxLength: 40,
          admin: { description: 'Capital letters work best. For example: UNIVERSITY OF SWAT.' },
        },
        {
          name: 'lineOne',
          label: 'Headline, first line',
          type: 'text',
          maxLength: 40,
          admin: { description: 'For example: Aspiring for' },
        },
        {
          name: 'lineTwo',
          label: 'Headline, second line',
          type: 'text',
          maxLength: 40,
          admin: { description: 'For example: Quality Education' },
        },
        {
          name: 'lineThree',
          label: 'Headline, third line',
          type: 'text',
          maxLength: 40,
          admin: { description: 'The words before the highlighted word. For example: with' },
        },
        {
          name: 'accent',
          label: 'Highlighted word',
          type: 'text',
          maxLength: 30,
          admin: {
            description: 'Shown in the gold colour at the end of the third line. For example: Relevance',
          },
        },
        {
          name: 'sub',
          label: 'Sentence under the headline',
          type: 'textarea',
          maxLength: 220,
        },
      ],
    },
    {
      name: 'colours',
      label: 'Colours',
      type: 'group',
      admin: {
        description:
          'Change the colours of the home page only. Leave a colour empty to keep the standard one. The darker and lighter shades are worked out for you.',
      },
      fields: [
        colour(
          'green',
          'Green',
          STANDARD.green,
          'The deep green: headings, the top bar, the footer and the page text.',
        ),
        colour(
          'yellow',
          'Yellow',
          STANDARD.yellow,
          'The gold: buttons, highlights and the accent words on green.',
        ),
        colour(
          'maroon',
          'Maroon',
          STANDARD.maroon,
          'The crest maroon: the Apply button, dates and small accents. Use a dark colour.',
        ),
      ],
    },
  ],
  hooks: {
    beforeOperation: [homeBeforeOperation],
    beforeChange: [homeBeforeChange],
    afterChange: [homeAfterChange],
  },
}
