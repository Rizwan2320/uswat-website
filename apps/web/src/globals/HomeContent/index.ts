import type { Access, GlobalConfig } from 'payload'

import { hiddenFromContributors } from '../../governance/adminMenu'
import {
  dateUnlessSample,
  HOME_READ_ROLES,
  ICON_LABELS,
  HOME_SLIDES,
  HOME_STATS,
  homeHrefValidate,
  slidesCountValidate,
  SLIDE_ICONS,
  STAT_ICONS,
  sourceUnlessSample,
} from '../../governance/homeContent'
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

/**
 * The home page's photograph slider and statistics bar, editable in the CMS (slice 3z). The headline
 * and the sentence under it stay fixed (owner decision 2026-11-07). Drafts may be incomplete; the
 * rules in governance/homeContent.ts apply when it is published, by approvers and above.
 */
export const HomeContent: GlobalConfig = {
  slug: 'home-content',
  label: 'Home page content',
  admin: {
    group: 'Content',
    hidden: hiddenFromContributors,
    description:
      'The photographs and the statistics at the top of the home page. The headline and the sentence under it do not change here.',
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
  ],
  hooks: {
    beforeOperation: [homeBeforeOperation],
    beforeChange: [homeBeforeChange],
    afterChange: [homeAfterChange],
  },
}
