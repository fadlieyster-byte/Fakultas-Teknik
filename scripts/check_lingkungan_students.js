import fs from 'fs';
import { LINGKUNGAN_COHORT_2021 } from './src/data/lingkunganCohort2021';
import { LINGKUNGAN_COHORT_2022 } from './src/data/lingkunganCohort2022';
import { LINGKUNGAN_COHORT_2023 } from './src/data/lingkunganCohort2023';

const rawLingkungan = JSON.parse(fs.readFileSync('scripts/lingkungan_yudisium_data.json', 'utf8'));

const existingNims = new Set([
  ...LINGKUNGAN_COHORT_2021.map(m => m.nim),
  ...LINGKUNGAN_COHORT_2022.map(m => m.nim),
  ...LINGKUNGAN_COHORT_2023.map(m => m.nim)
]);

const missing = rawLingkungan.filter(y => !existingNims.has(y.nim));
console.log(`Missing Lingkungan students from cohorts: ${missing.length}`);
missing.forEach(m => console.log(`${m.nim} - ${m.nama} (${m.angkatan})`));
