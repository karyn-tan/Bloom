export type SeasonalFlower = {
  name: string;
  note: string;
  accent: 'accent-red' | 'accent-gold' | 'accent-teal';
};

export const SPRING_FLOWERS: readonly SeasonalFlower[] = [
  {
    name: 'Tulips',
    note: 'Keep stems trimmed at an angle',
    accent: 'accent-red',
  },
  {
    name: 'Peonies',
    note: 'Best in lukewarm water',
    accent: 'accent-gold',
  },
  {
    name: 'Ranunculus',
    note: 'Remove leaves below waterline',
    accent: 'accent-teal',
  },
  {
    name: 'Daffodils',
    note: 'Condition separately before mixing',
    accent: 'accent-gold',
  },
] as const;
