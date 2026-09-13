// src/logic/eggWeights.ts

import type { EggType } from "./fermentationModel";

export const EGG_WEIGHTS: Record<EggType, number> = {
  whole: 50,
  yolk: 18,
  white: 32,
  powder: 50,
  none: 0,
};
