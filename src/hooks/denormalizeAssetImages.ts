import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Builds the public Supabase CDN URL for a stored media file.
 *   {SUPABASE_PUBLIC_URL}/storage/v1/object/public/{bucket}/{prefix}/{filename}
 * The bucket is public (see the site's storage migration) and its hostname is
 * already whitelisted in the public site's next.config.ts remotePatterns.
 */
export const mediaPublicUrl = (filename: string): string => {
  const base = (process.env.SUPABASE_PUBLIC_URL ?? '').replace(/\/$/, '')
  const bucket = process.env.SUPABASE_S3_BUCKET ?? 'asset-images'
  const prefix = process.env.SUPABASE_MEDIA_PREFIX ?? 'media'
  return `${base}/storage/v1/object/public/${bucket}/${prefix}/${encodeURIComponent(filename)}`
}

type GalleryItem = { image?: unknown; alt?: string | null; is_cover?: boolean | null }

/**
 * Denormalizes an asset's gallery (array of Media uploads) into two columns the
 * public Cloudflare site reads with simple single-column queries:
 *   - primary_image_url : text  (cover image)
 *   - gallery           : jsonb ([{ url, alt }, ...], cover first)
 *
 * Cover selection: the image ticked "Use as thumbnail" (is_cover) is used as the
 * cover and is moved to the front of the gallery so it leads the public detail
 * page too. If none is ticked, the first image is the cover — which means a
 * single-image asset is automatically its own thumbnail.
 *
 * This means the public site never has to join the Media collection or read a
 * Payload relationship table — it just reads these columns off the asset row.
 */
export const denormalizeAssetImages: CollectionBeforeChangeHook = async ({ data, req }) => {
  // Only (re)build the denormalized columns when the editable `images` array is
  // actually supplied. This lets the one-time legacy migration set `gallery` /
  // `primary_image_url` directly (it has URLs, not Media docs) without this hook
  // wiping them, and avoids clobbering them on unrelated updates.
  if (!Array.isArray(data?.images)) return data

  const gallery = data.images as GalleryItem[]
  const resolved: { url: string; alt: string }[] = []
  // Index (within `resolved`) of the image the editor flagged as the thumbnail.
  let coverIndex = -1

  for (const item of gallery) {
    if (!item?.image) continue

    let filename: string | undefined
    let mediaAlt: string | undefined

    if (typeof item.image === 'object' && item.image !== null) {
      const m = item.image as { filename?: string; alt?: string }
      filename = m.filename
      mediaAlt = m.alt
    } else {
      // image is an ID — fetch the media doc to read its filename.
      try {
        const media = await req.payload.findByID({
          collection: 'media',
          id: item.image as string,
          depth: 0,
        })
        filename = (media as { filename?: string })?.filename
        mediaAlt = (media as { alt?: string })?.alt
      } catch {
        // media not found / not yet persisted — skip this item
      }
    }

    if (!filename) continue
    // First ticked image wins if the editor flagged more than one.
    if (item.is_cover && coverIndex === -1) coverIndex = resolved.length
    resolved.push({
      url: mediaPublicUrl(filename),
      alt: item.alt || mediaAlt || (data?.title as string) || '',
    })
  }

  // Move the chosen cover (if any) to the front so it leads both the card
  // thumbnail and the detail-page gallery.
  if (coverIndex > 0) {
    const [cover] = resolved.splice(coverIndex, 1)
    resolved.unshift(cover)
  }

  return {
    ...data,
    primary_image_url: resolved[0]?.url ?? data?.primary_image_url ?? null,
    gallery: resolved,
  }
}
