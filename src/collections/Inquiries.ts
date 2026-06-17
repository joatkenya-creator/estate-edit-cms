import type { CollectionConfig } from 'payload'

import { isAdmin, isAuthenticated } from '../access/roles'
import {
  assetCategoryOptions,
  clientSegmentOptions,
  inquiryStatusOptions,
  inquiryTypeOptions,
  serviceDivisionOptions,
} from '../fields/options'

/**
 * Inquiries — the lead inbox / lightweight CRM. Rows are CREATED by the public
 * site directly via Supabase (anon key + RLS insert policy), NOT through
 * Payload. Here, staff triage them: move status new -> contacted -> won/lost.
 *
 * No drafts: this is operational lead data, not published content.
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Inquiry', plural: 'Inquiries' },
  admin: {
    useAsTitle: 'full_name',
    defaultColumns: ['full_name', 'email', 'inquiry_type', 'status', 'createdAt'],
    group: 'Leads',
    listSearchableFields: ['full_name', 'email', 'company', 'phone'],
    pagination: { defaultLimit: 50 },
  },
  access: {
    read: isAuthenticated,
    // Editors triage (update status/notes); only admins create/delete here.
    create: isAdmin,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: inquiryStatusOptions,
          admin: { description: 'Pipeline stage.' },
        },
        {
          name: 'inquiry_type',
          type: 'select',
          required: true,
          defaultValue: 'consultation',
          options: inquiryTypeOptions,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'full_name', type: 'text', required: true, label: 'Full name' },
            { name: 'email', type: 'email', required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'phone', type: 'text' },
            { name: 'company', type: 'text' },
            { name: 'preferred_contact', type: 'text', label: 'Preferred contact' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Qualification',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'client_segment', type: 'select', options: clientSegmentOptions },
            { name: 'service_division', type: 'select', options: serviceDivisionOptions },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'location', type: 'text' },
            { name: 'expat_direction', type: 'text', label: 'Expat direction' },
          ],
        },
      ],
    },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      type: 'collapsible',
      label: 'Asset review details',
      admin: { initCollapsed: true },
      fields: [
        { name: 'asset_category', type: 'select', options: assetCategoryOptions },
        { name: 'asset_description', type: 'textarea', label: 'Asset description' },
        {
          type: 'row',
          fields: [
            { name: 'estimated_value', type: 'number' },
            { name: 'estimated_currency', type: 'text', defaultValue: 'KES', admin: { width: '120px' } },
          ],
        },
      ],
    },
    {
      name: 'consent',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true, description: 'Privacy/contact consent given on submission.' },
    },
    {
      name: 'source',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Page / CTA the lead came from.' },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
