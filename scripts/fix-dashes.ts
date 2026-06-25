/**
 * One-off: replace long dashes (em/en) in DB-driven copy with plain punctuation,
 * via the Payload Local API so version tables + hooks stay consistent and the
 * change is published (visible to the public site, which reads _status=published).
 *
 *   npx payload run scripts/fix-dashes.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const fixes = [
  {
    collection: 'assets' as const,
    id: 'fcf58cfc-2ff9-46d4-9bf2-cb91dd3cd79a',
    field: 'title',
    value: 'Hisense 12kg Washer Dryer (8kg Dry) - Auto Dosing, Wi-Fi, 1400 RPM - Black',
  },
  {
    collection: 'services' as const,
    id: 'ded905ef-7332-4452-852c-3ba810e37a69',
    field: 'summary',
    value:
      'White-glove support for major life changes: downsizing, relocation, cleanouts, and complete property preparation.',
  },
  {
    collection: 'testimonials' as const,
    id: 'bf71d930-d75d-4eb7-a957-72a2a5b74c73',
    field: 'quote',
    value:
      'They turned an overwhelming family estate into a calm, dignified process, and realised far more than we expected.',
  },
]

const payload = await getPayload({ config })

for (const f of fixes) {
  await payload.update({
    collection: f.collection,
    id: f.id,
    data: { [f.field]: f.value },
    draft: false, // publish the change so the live site picks it up
    overrideAccess: true,
  })
  console.log(`Fixed ${f.collection}.${f.field} [${f.id}]`)
}

console.log('Done.')
process.exit(0)
