export type HealthState = {
  hearts: 0 | 1 | 2 | 3;
  droplets: 0 | 1 | 2 | 3 | 4 | 5;
  status: 'healthy' | 'thirsty' | 'struggling' | 'past_peak';
};
