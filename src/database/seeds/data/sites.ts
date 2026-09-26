interface SiteSeed {
  id: string;
  name: string;
  code: string;
  region: string;
  latitude: number;
  longitude: number;
}

export const siteIds = {
  north: '6c80a525-9be1-4fc2-b437-962de8db4eb3',
  south: '4f9e8eb5-926c-4799-80ee-0dc25a6ce434',
  central: 'dc244d28-9d1f-45d7-ace2-326e466ced39',
} as const;

export const siteSeeds: SiteSeed[] = [
  {
    id: siteIds.north,
    name: 'Северная площадка',
    code: 'SITE-NORTH',
    region: 'Мурманская область',
    latitude: 68.9707,
    longitude: 33.0749,
  },
  {
    id: siteIds.south,
    name: 'Южная площадка',
    code: 'SITE-SOUTH',
    region: 'Ставропольский край',
    latitude: 45.0448,
    longitude: 41.9692,
  },
  {
    id: siteIds.central,
    name: 'Центральная площадка',
    code: 'SITE-CENTRAL',
    region: 'Московская область',
    latitude: 55.9116,
    longitude: 37.7308,
  },
];