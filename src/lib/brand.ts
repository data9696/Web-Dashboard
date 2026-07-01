// Brand is determined by listing_sku prefix, NOT sku_code (sku_code is just an internal id
// that doesn't differentiate brands) and NOT the `company` field (that's the legal selling
// entity — Arete Fashion / Fashion 1972NE — which can sell either brand's products).
//
// CC-     -> Cocoon Care
// BB-     -> The Boo Boo Club (current naming)
// TBBC-   -> The Boo Boo Club (legacy/discontinued naming, rolled into Boo Boo Club historically)
// anything else (TT- etc.) -> Other / Discontinued (excluded from brand-level reporting by default)

export type Brand = 'Cocoon Care' | 'The Boo Boo Club' | 'Other'

export function brandFromListingSku(listingSku: string | null | undefined): Brand {
  if (!listingSku) return 'Other'
  const sku = listingSku.toUpperCase()
  if (sku.startsWith('CC-')) return 'Cocoon Care'
  if (sku.startsWith('BB-') || sku.startsWith('TBBC-')) return 'The Boo Boo Club'
  return 'Other'
}

export const BRAND_COLORS: Record<Brand, string> = {
  'Cocoon Care': '#7c9070', // sage
  'The Boo Boo Club': '#e3a9a0', // dusty pink
  Other: '#8a8680', // muted
}
