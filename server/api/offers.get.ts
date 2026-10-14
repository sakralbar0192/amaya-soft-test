export type Offer = {
  id: string
  title: string
  subtitle: string
  priceLabel: string
  badge?: string
}

const offers: Offer[] = [
  {
    id: 'week',
    title: 'На неделю',
    subtitle: 'Гибко попробовать',
    priceLabel: '299 ₽',
  },
  {
    id: 'year',
    title: 'На год',
    subtitle: '≈ 166 ₽ в месяц',
    priceLabel: '1 990 ₽',
    badge: 'Выгодно',
  },
]

export default defineEventHandler((): Offer[] => offers)
