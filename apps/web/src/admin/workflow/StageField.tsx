'use client'

import { SelectField, useAuth, useTranslation } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import React from 'react'

/**
 * The Stage box (slice 3ak). It shows where the item is. Only a platform admin may use it to move
 * an item by hand (an advanced control); everyone else moves it with the buttons in the coloured
 * box above, so there is one way to do each step, not two. The server's rules are unchanged: they
 * decide every move whichever way it arrives. The buttons set this field's value from the form
 * state, which still works while the box itself is read-only.
 */
export default function StageField(props: SelectFieldClientProps): React.ReactElement {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const isAdmin = (user as { role?: string } | null)?.role === 'platformAdmin'
  if (isAdmin) return <SelectField {...props} />
  const note =
    i18n.language === 'ur'
      ? 'یہ صرف دکھاتا ہے کہ آئٹم کہاں ہے۔ اسے آگے بڑھانے کے لیے اوپر رنگین خانے کے بٹن استعمال کریں۔'
      : 'This only shows where the item is. To move it on, use the buttons in the coloured box above.'
  return (
    <SelectField
      {...props}
      readOnly
      field={
        { ...props.field, admin: { ...props.field.admin, description: note } } as typeof props.field
      }
    />
  )
}
