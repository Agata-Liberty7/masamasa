// ===============================
//   FERMENTATION + HYDRATION MODEL
//   safe + strict version
// ===============================

export type YeastForm = "instant" | "fresh";

export type FlourType =
  | "normal"
  | "strong"
  | "integral"
  | "rye"
  | "buckwheat"
  | "corn"
  | "rice"
  | "oat"
  | "flax";

export type LiquidType =
  | "water"
  | "milk"
  | "kefir"
  | "whey"
  | "plant_milk";

export type FatType =
  | "none"
  | "butter"
  | "oil"
  | "ghee"
  | "margarine";

export type EggType =
  | "none"
  | "whole"
  | "yolk"
  | "white"
  | "powder";

export type SugarType =
  | "none"
  | "white"
  | "brown"
  | "panela";

export type DoughType = "lean" | "enriched";

export type YeastModelInput = {
  coldHours: number;
  warmHours: number;
  doughType: DoughType;
  yeastForm: YeastForm;

  mainFlour: FlourType;
  extraFlour1: FlourType;
  extraPct1: number;
  extraFlour2: FlourType;
  extraPct2: number;

  productionMode: "home" | "professional";
  roomTemp?: number;
};

export type HydrationModelInput = {
  baseHydration: number;

  mainFlour: FlourType;
  extraFlour1: FlourType;
  extraPct1: number;
  extraFlour2: FlourType;
  extraPct2: number;

  liquidType: LiquidType;
  fatType: FatType;
  sugarType: SugarType;
  eggType: EggType;
};

// ===============================
//   1. Flour tables
// ===============================

const W_BY_FLOUR: Record<FlourType, number> = {
  normal: 220,
  strong: 300,
  integral: 240,
  rye: 120,
  buckwheat: 80,
  corn: 60,
  rice: 40,
  oat: 70,
  flax: 30,
};

const FLOUR_FERMENTATION_FACTOR: Record<FlourType, number> = {
  normal: 0,
  strong: -0.05,
  integral: -0.05,
  rye: 0.10,
  buckwheat: -0.10,
  corn: -0.05,
  rice: -0.05,
  oat: -0.15,
  flax: -0.20,
};

const FLOUR_HYDRATION_DELTA: Record<FlourType, number> = {
  normal: 0,
  strong: 2,
  integral: 3,
  rye: 5,
  buckwheat: 4,
  corn: 3,
  rice: 2,
  oat: 6,
  flax: 8,
};

// ===============================
//   2. Liquid tables
// ===============================

const LIQUID_WATER_EQUIVALENT: Record<LiquidType, number> = {
  water: 1.0,
  milk: 0.88,
  kefir: 0.85,
  whey: 0.90,
  plant_milk: 0.92,
};

// ===============================
//   3. Sugar tables
// ===============================

const SUGAR_WATER_DELTA: Record<SugarType, number> = {
  none: 0,
  white: 0,
  brown: 0.02,
  panela: 0.05,
};

// ===============================
//   4. Fat tables
// ===============================

const FAT_WATER_DELTA: Record<FatType, number> = {
  none: 0,
  butter: -0.02,
  oil: -0.03,
  ghee: -0.03,
  margarine: -0.02,
};

// ===============================
//   5. Egg tables
// ===============================

const EGG_WATER_EQUIVALENT: Record<EggType, number> = {
  none: 0,
  whole: 0.76,
  yolk: 0.48,
  white: 0.88,
  powder: 0.0,
};

// ===============================
//   6. Yeast tables
// ===============================

const IDY_TABLE: [number, number][] = [
  [1, 0.008],
  [2, 0.007],
  [3, 0.006],
  [4, 0.005],
  [5, 0.0042],
  [6, 0.0035],
  [8, 0.003],
  [10, 0.0028],
  [12, 0.0025],
  [16, 0.0023],
  [20, 0.002],
  [24, 0.0018],
];

const FRESH_TABLE: [number, number][] = [
  [3, 0.007],
  [4, 0.0065],
  [5, 0.0058],
  [6, 0.005],
  [8, 0.0042],
  [10, 0.0036],
  [12, 0.003],
  [16, 0.0026],
  [20, 0.0023],
  [24, 0.002],
];

// ===============================
//   Helpers
// ===============================

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeFlourShares(extraPct1: number, extraPct2: number) {
  const e1 = clamp(extraPct1, 0, 100);
  const e2 = clamp(extraPct2, 0, 100);
  const extraTotal = e1 + e2;

  if (extraTotal >= 100) {
    const scale = 100 / extraTotal;
    return {
      mainShare: 0,
      extraShare1: (e1 * scale) / 100,
      extraShare2: (e2 * scale) / 100,
    };
  }

  return {
    mainShare: 1 - extraTotal / 100,
    extraShare1: e1 / 100,
    extraShare2: e2 / 100,
  };
}

function lerpTable(hours: number, table: [number, number][]) {
  if (hours <= table[0][0]) return table[0][1];
  if (hours >= table[table.length - 1][0]) return table[table.length - 1][1];

  for (let i = 0; i < table.length - 1; i++) {
    const [h1, v1] = table[i];
    const [h2, v2] = table[i + 1];

    if (hours >= h1 && hours <= h2) {
      const t = (hours - h1) / (h2 - h1);
      return v1 + (v2 - v1) * t;
    }
  }

  return table[table.length - 1][1];
}

function computeWeightedFlourFermentationFactor(
  mainFlour: FlourType,
  extraFlour1: FlourType,
  extraPct1: number,
  extraFlour2: FlourType,
  extraPct2: number
) {
  const { mainShare, extraShare1, extraShare2 } = normalizeFlourShares(
    extraPct1,
    extraPct2
  );

  return (
    FLOUR_FERMENTATION_FACTOR[mainFlour] * mainShare +
    FLOUR_FERMENTATION_FACTOR[extraFlour1] * extraShare1 +
    FLOUR_FERMENTATION_FACTOR[extraFlour2] * extraShare2
  );
}

function computeWeightedFlourHydrationDelta(
  mainFlour: FlourType,
  extraFlour1: FlourType,
  extraPct1: number,
  extraFlour2: FlourType,
  extraPct2: number
) {
  const { mainShare, extraShare1, extraShare2 } = normalizeFlourShares(
    extraPct1,
    extraPct2
  );

  return (
    FLOUR_HYDRATION_DELTA[mainFlour] * mainShare +
    FLOUR_HYDRATION_DELTA[extraFlour1] * extraShare1 +
    FLOUR_HYDRATION_DELTA[extraFlour2] * extraShare2
  );
}

// ===============================
//   7. W-factor
// ===============================

function computeWFactor(
  main: FlourType,
  extra1: FlourType,
  pct1: number,
  extra2: FlourType,
  pct2: number
) {
  const { mainShare, extraShare1, extraShare2 } = normalizeFlourShares(
    pct1,
    pct2
  );

  const W_weighted =
    W_BY_FLOUR[main] * mainShare +
    W_BY_FLOUR[extra1] * extraShare1 +
    W_BY_FLOUR[extra2] * extraShare2;

  if (W_weighted < 180) return 1.05;
  if (W_weighted > 280) return 0.95;
  return 1.0;
}

// ===============================
//   8. Yeast model
// ===============================

export function computeYeastPercent(input: YeastModelInput): number {
  const {
    coldHours,
    warmHours,
    doughType,
    yeastForm,
    mainFlour,
    extraFlour1,
    extraPct1,
    extraFlour2,
    extraPct2,
    productionMode,
    roomTemp = 24,
  } = input;

  const cold = Math.max(0, coldHours);
  const warm = Math.max(0, warmHours);

  const base =
    yeastForm === "instant"
      ? lerpTable(cold, IDY_TABLE)
      : lerpTable(cold, FRESH_TABLE);

  const kDough = doughType === "enriched" ? 1.2 : 1.0;
  const kMode = productionMode === "professional" ? 0.9 : 1.0;
  const kWarm = warm <= 1 ? 1.1 : warm >= 4 ? 0.9 : 1.0;

  const kFlour = computeWeightedFlourFermentationFactor(
    mainFlour,
    extraFlour1,
    extraPct1,
    extraFlour2,
    extraPct2
  );

  const kW = computeWFactor(
    mainFlour,
    extraFlour1,
    extraPct1,
    extraFlour2,
    extraPct2
  );

  // Reference temperature is 24 C. This is a bounded planning heuristic,
  // not a prediction of actual dough temperature or fermentation endpoint.
  const safeTemp = Number.isFinite(roomTemp) ? clamp(roomTemp, 16, 32) : 24;
  const kTemp = clamp(Math.pow(1.07, 24 - safeTemp), 0.6, 1.8);
  const result = base * kDough * kMode * kWarm * (1 + kFlour) * kW * kTemp;

  return Math.max(0.0001, result);
}

// ===============================
//   9. Shared hydration base
// ===============================

function computeTargetWaterPercent(input: HydrationModelInput): number {
  const {
    baseHydration,
    mainFlour,
    extraFlour1,
    extraPct1,
    extraFlour2,
    extraPct2,
    fatType,
    sugarType,
    eggType,
  } = input;

  let targetWaterPercent =
    baseHydration +
    computeWeightedFlourHydrationDelta(
      mainFlour,
      extraFlour1,
      extraPct1,
      extraFlour2,
      extraPct2
    );

  targetWaterPercent += SUGAR_WATER_DELTA[sugarType] * 100;
  targetWaterPercent += FAT_WATER_DELTA[fatType] * 100;
  targetWaterPercent += EGG_WATER_EQUIVALENT[eggType] * 10;

  return Math.max(0, targetWaterPercent);
}

// ===============================
//   10. Compatible hydration model
//   keeps current app behavior style
// ===============================

export function computeHydration(input: HydrationModelInput): number {
  const targetWaterPercent = computeTargetWaterPercent(input);
  return Math.max(
    0,
    targetWaterPercent * LIQUID_WATER_EQUIVALENT[input.liquidType]
  );
}

// ===============================
//   11. Strict hydration model
//   effective water approach
// ===============================

export function computeHydrationStrict(input: HydrationModelInput): number {
  const targetWaterPercent = computeTargetWaterPercent(input);
  const liquidEq = LIQUID_WATER_EQUIVALENT[input.liquidType];

  if (liquidEq <= 0) return targetWaterPercent;

  // сколько жидкости нужно, чтобы получить ту же эффективную воду
  const requiredLiquidPercent = targetWaterPercent / liquidEq;

  return Math.max(0, requiredLiquidPercent);
}