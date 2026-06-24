import type { Option } from 'payload'

/**
 * Select options whose `value`s are IDENTICAL to the existing Postgres enum
 * values in the public site's schema. This is deliberate: the Cloudflare site
 * compares these strings directly (e.g. `status === 'reserved'`), so the
 * values must not change even though Payload creates its own enum types.
 *
 * Mirrors: supabase/migrations/20260606111604_estate_edit_initial_schema.sql
 */

const o = (value: string, label: string): Option => ({ value, label })

export const serviceDivisionOptions: Option[] = [
  o('estate_sales', 'Estate Sales'),
  o('commercial_liquidation', 'Commercial Liquidation'),
  o('concierge', 'Concierge Transition'),
  o('expat_services', 'Expat Services'),
]

export const assetCategoryOptions: Option[] = [
  o('furniture', 'Furniture'),
  o('fine_art', 'Artwork'),
  o('jewelry', 'Jewellery'),
  o('vehicles', 'Vehicles'),
  o('collectibles', 'Collectibles'),
  o('designer', 'Designer'),
  o('lighting', 'Lighting'),
  o('rugs', 'Rugs'),
  o('antiques', 'Antiques'),
  o('equipment', 'Equipment'),
  o('fleet', 'Fleet'),
  o('inventory', 'Inventory'),
  o('office', 'Office'),
  o('other', 'Other'),
]

export const assetStatusOptions: Option[] = [
  o('available', 'Available'),
  o('reserved', 'Reserved'),
  o('pending', 'Pending'),
  o('sold', 'Sold'),
  o('withdrawn', 'Withdrawn'),
]

export const assetConditionOptions: Option[] = [
  o('new', 'New'),
  o('excellent', 'Excellent'),
  o('very_good', 'Very good'),
  o('good', 'Good'),
  o('fair', 'Fair'),
]

export const eventTypeOptions: Option[] = [
  o('estate_sale', 'Estate Sale'),
  o('online_auction', 'Online Auction'),
  o('liquidation', 'Liquidation'),
  o('private_event', 'Private Event'),
]

export const eventStatusOptions: Option[] = [
  o('upcoming', 'Upcoming'),
  o('live', 'Live'),
  o('ended', 'Ended'),
  o('cancelled', 'Cancelled'),
]

export const inquiryTypeOptions: Option[] = [
  o('consultation', 'Consultation'),
  o('asset_review', 'Asset Review'),
]

export const inquiryStatusOptions: Option[] = [
  o('new', 'New'),
  o('contacted', 'Contacted'),
  o('qualified', 'Qualified'),
  o('won', 'Won'),
  o('lost', 'Lost'),
  o('archived', 'Archived'),
]

// ----- Delivery handling (Phase 2) -----

export const deliveryTierOptions: Option[] = [
  o('standard', 'Standard (small / light)'),
  o('medium', 'Medium'),
  o('large', 'Large'),
  o('bulky', 'Bulky (appliance / furniture)'),
]

// ----- Orders (Phase 2) -----

export const orderStatusOptions: Option[] = [
  o('pending', 'Pending'),
  o('confirmed', 'Confirmed'),
  o('dispatched', 'Dispatched'),
  o('delivered', 'Delivered'),
  o('cancelled', 'Cancelled'),
]

export const paymentStatusOptions: Option[] = [
  o('unpaid', 'Unpaid'),
  o('partial', 'Part-paid'),
  o('paid', 'Paid'),
]

export const paymentMethodOptions: Option[] = [
  o('pay_on_delivery', 'Pay on delivery (cash)'),
  o('mpesa', 'M-Pesa'),
  o('cash', 'Cash'),
  o('bank_transfer', 'Bank transfer'),
]

export const clientSegmentOptions: Option[] = [
  o('individual', 'Individual'),
  o('family', 'Family'),
  o('estate_executor', 'Estate Executor'),
  o('business_owner', 'Business Owner'),
  o('expat', 'Expat'),
  o('embassy', 'Embassy'),
  o('corporation', 'Corporation'),
]
