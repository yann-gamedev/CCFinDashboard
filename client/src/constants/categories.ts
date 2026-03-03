export const CATEGORIES = [
    'Makanan',
    'Transportasi',
    'Hiburan',
    'Gaji',
    'Tagihan',
    'Belanja',
    'Investasi',
    'Lainnya',
] as const

export type CategoryType = (typeof CATEGORIES)[number]
