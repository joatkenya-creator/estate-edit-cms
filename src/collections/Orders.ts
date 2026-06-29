import type { CollectionConfig } from 'payload'

import { isAdmin, isAuthenticated } from '../access/roles'
import { orderComputed } from '../hooks/orderComputed'
import { notifyOrderStatus } from '../hooks/notifyOrderStatus'
import {
  marketOptions,
  orderStatusOptions,
  paymentMethodOptions,
  paymentStatusOptions,
} from '../fields/options'

/**
 * Orders — the self-checkout sales inbox (Phase 2). Like Inquiries, rows are
 * CREATED by the public site directly via Supabase (anon key + RLS insert),
 * NOT through Payload: the shopper builds a cart and places an order, which
 * lands here as `pending`. There is no online payment gateway — customers pay
 * after delivery (cash / M-Pesa), and staff RECORD each payment in the
 * `payments` ledger below, which drives amount_paid + payment_status.
 *
 * No drafts: operational sales data, not published content.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  admin: {
    useAsTitle: 'order_number',
    defaultColumns: ['order_number', 'full_name', 'total', 'status', 'payment_status', 'createdAt'],
    group: 'Sales',
    listSearchableFields: ['order_number', 'full_name', 'email', 'phone'],
    pagination: { defaultLimit: 50 },
  },
  access: {
    read: isAuthenticated,
    // Orders are created by the public site (anon insert). In the CMS only
    // admins create/delete manually; any staff can fulfil + record payments.
    create: isAdmin,
    update: isAuthenticated,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [orderComputed],
    afterChange: [notifyOrderStatus],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'order_number',
          type: 'text',
          unique: true,
          admin: { readOnly: true, description: 'Auto-generated (EE-XXXXXX).' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: orderStatusOptions,
          admin: { description: 'Fulfilment stage.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Customer',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'full_name', type: 'text', required: true, label: 'Full name' },
            { name: 'phone', type: 'text', required: true },
            { name: 'email', type: 'email' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Delivery',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'county',
              type: 'text',
              admin: { description: 'County (Kenya) or locality (Virginia). Used to price delivery.' },
            },
            { name: 'town', type: 'text', label: 'Town / city' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'state', type: 'text', label: 'State (US)', admin: { description: 'US orders only.' } },
            { name: 'postal_code', type: 'text', label: 'ZIP / postal code' },
            { name: 'country', type: 'text', admin: { description: 'KE or US.' } },
          ],
        },
        { name: 'address', type: 'textarea' },
        { name: 'delivery_notes', type: 'textarea', label: 'Delivery notes' },
        {
          name: 'delivery_quote_pending',
          type: 'checkbox',
          label: 'Shipping quote pending',
          defaultValue: false,
          admin: {
            description:
              'Set at checkout for destinations outside Virginia: no delivery fee was charged; staff to quote shipping.',
          },
        },
      ],
    },
    {
      name: 'items',
      type: 'json',
      admin: {
        description: 'Cart lines: [{ title, slug, price, quantity, image_url }]. Written at checkout.',
      },
    },
    // ----- Money (sidebar) -----
    {
      name: 'subtotal',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Sum of item lines.' },
    },
    {
      name: 'delivery_fee',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Countrywide delivery charge.' },
    },
    {
      name: 'total',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'subtotal + delivery.' },
    },
    {
      name: 'market',
      type: 'select',
      defaultValue: 'kenya',
      options: marketOptions,
      admin: { position: 'sidebar', readOnly: true, description: 'Storefront the order came from (set at checkout).' },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'KES',
      admin: { position: 'sidebar', readOnly: true, width: '120px', description: 'Native to the market (KES / USD).' },
    },
    // ----- Payment ledger -----
    {
      name: 'payment_status',
      type: 'select',
      defaultValue: 'unpaid',
      options: paymentStatusOptions,
      admin: { position: 'sidebar', readOnly: true, description: 'Derived from payments below.' },
    },
    {
      name: 'amount_paid',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'payments',
      type: 'array',
      label: 'Payments received',
      labels: { singular: 'Payment', plural: 'Payments' },
      admin: {
        description: 'Record each payment received after delivery. Updates amount paid + status.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'amount', type: 'number', required: true },
            { name: 'method', type: 'select', defaultValue: 'mpesa', options: paymentMethodOptions },
            { name: 'paid_at', type: 'date', label: 'Date', admin: { date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
        { name: 'reference', type: 'text', admin: { description: 'M-Pesa code / receipt no.' } },
        { name: 'note', type: 'text' },
      ],
    },
    {
      name: 'paid_at',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, description: 'When fully paid.' },
    },
    {
      name: 'source',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Page / CTA the order came from.' },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
