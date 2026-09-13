// ============================================================
//  calculateRecipe.ts — единый оркестратор расчёта рецепта
// ============================================================

import { computeYeastPercent } from "./fermentationModel";
import { calculateLiquidFromTargetWater, calculateLiquidWater } from "./liquidWaterContent";
import { EGG_WEIGHTS } from "./eggWeights";

import type {
  FlourType,
  LiquidType,
  FatType,
  EggType,
  SugarType,
  YeastForm,
  DoughType,
} from "./fermentationModel";

import type { PrefermentType } from "./preferment";

// ============================================================
//  Типы
// ============================================================

export type RecipeInput = {
  // Мука
  flour: number;
  mainFlour: FlourType;
  extraFlour1: FlourType;
  extraPct1: number;
  extraFlour2: FlourType;
  extraPct2: number;

  // Гидратация
  hydration: number;
  liquidType: LiquidType;

  // Ингредиенты (% от муки)
  salt: number;
  sugar: number;
  fat: number;
  eggs: number; // штук

  // Типы ингредиентов
  fatType: FatType;
  eggType: EggType;
  sugarType: SugarType;
  yeastForm: YeastForm;

  // Дрожжи
  yeastPct: number; // введён пользователем

  // Предфермент
  prefermentType: PrefermentType;
  prefermentFlourPct: number;
  prefermentHydrationPct: number;
  prefermentYeastPct: number;

  // Условия производства (для рекомендации дрожжей)
  roomTemp: number;
  warmFermentationHours: number;
  coldFermentationHours: number;
  productionMode: "home" | "professional";
  doughType: DoughType;
};

export type PrefermentResult = {
  type: PrefermentType;
  flour: number;
  liquid: number;
  water: number;
  yeast: number;
  total: number;
};

export type RecipeResult = {
  // Мука
  flour: number;
  mainFlourGr: number;
  extraFlour1Gr: number;
  extraFlour2Gr: number;
  mainFlour: FlourType;
  extraFlour1: FlourType;
  extraPct1: number;
  extraFlour2: FlourType;
  extraPct2: number;

  // Жидкость
  liquid: number;
  liquidWater: number;
  liquidType: LiquidType;

  // Ингредиенты в граммах
  salt: number;
  sugar: number;
  fat: number;
  eggs: number;
  eggsGr: number;
  yeast: number;

  // Типы
  fatType: FatType;
  eggType: EggType;
  sugarType: SugarType;
  yeastForm: YeastForm;

  // Гидратация
  hydration: number;
  trueHydration: number;

  // Рекомендация дрожжей от движка
  yeastRecommendedPct: number;

  // Предфермент
  preferment: PrefermentResult;
  prefermentType: PrefermentType;
  prefermentFlourPct: number;
  prefermentHydrationPct: number;
  prefermentYeastPct: number;

  // Основной замес (после вычета предфермента)
  finalFlour: number;
  finalLiquid: number;
  finalWater: number;
  finalYeast: number;

  // Итоги
  finalDough: number;
  totalDough: number;
};

// ============================================================
//  Конвертация дрожжей
// ============================================================

const YEAST_MULTIPLIER: Record<YeastForm, number> = {
  instant: 1,
  fresh: 3,
};

// ============================================================
//  Главная функция
// ============================================================

export function calculateRecipe(input: RecipeInput): RecipeResult {

  // ----------------------------------------------------------
  //  1. Мука
  // ----------------------------------------------------------
  const extraPct1 = Math.max(0, input.extraPct1);
  const extraPct2 = Math.max(0, input.extraPct2);
  const mainPct = Math.max(0, 100 - extraPct1 - extraPct2);

  const mainFlourGr = Math.round((input.flour * mainPct) / 100);
  const extraFlour1Gr = Math.round((input.flour * extraPct1) / 100);
  const extraFlour2Gr = Math.round((input.flour * extraPct2) / 100);

  // ----------------------------------------------------------
  //  2. Жидкость
  // ----------------------------------------------------------
  const targetWater = (input.flour * input.hydration) / 100;
  const liquid = calculateLiquidFromTargetWater(targetWater, input.liquidType);
  const liquidWater = calculateLiquidWater(liquid, input.liquidType);

  // ----------------------------------------------------------
  //  3. Ингредиенты в граммах
  // ----------------------------------------------------------
  const saltGr = Math.round((input.flour * input.salt) / 100);
  const sugarGr = Math.round((input.flour * input.sugar) / 100);
  const fatGr = Math.round((input.flour * input.fat) / 100);
  const eggUnitWeight = EGG_WEIGHTS[input.eggType] ?? 50;
  const eggsGr = Math.round(input.eggs * eggUnitWeight);

  // ----------------------------------------------------------
  //  4. Дрожжи
  //  Пользователь вводит % — мы считаем граммы.
  //  Параллельно движок считает рекомендацию.
  // ----------------------------------------------------------
  const yeastMultiplier = YEAST_MULTIPLIER[input.yeastForm] ?? 1;
  const yeast = Math.round((input.flour * input.yeastPct) / 100 * yeastMultiplier);

  const yeastRecommendedPct = computeYeastPercent({
    coldHours: input.coldFermentationHours,
    warmHours: input.warmFermentationHours,
    doughType: input.doughType,
    yeastForm: input.yeastForm,
    productionMode: input.productionMode,
    mainFlour: input.mainFlour,
    extraFlour1: input.extraFlour1,
    extraPct1,
    extraFlour2: input.extraFlour2,
    extraPct2,
  });

  // ----------------------------------------------------------
  //  5. Предфермент
  // ----------------------------------------------------------
  let preferment: PrefermentResult = {
    type: "none",
    flour: 0,
    liquid: 0,
    water: 0,
    yeast: 0,
    total: 0,
  };

  if (input.prefermentType !== "none" && input.prefermentFlourPct > 0) {
    const prefFlour = Math.round((input.flour * input.prefermentFlourPct) / 100);
    const prefTargetWater = Math.round((prefFlour * input.prefermentHydrationPct) / 100);
    const prefLiquid = calculateLiquidFromTargetWater(prefTargetWater, input.liquidType);
    const prefWater = calculateLiquidWater(prefLiquid, input.liquidType);
    const prefYeast = Math.round((yeast * input.prefermentYeastPct) / 100);

    preferment = {
      type: input.prefermentType,
      flour: prefFlour,
      liquid: prefLiquid,
      water: prefWater,
      yeast: prefYeast,
      total: prefFlour + prefLiquid + prefYeast,
    };
  }

  // ----------------------------------------------------------
  //  6. Основной замес
  // ----------------------------------------------------------
  const finalFlour = Math.max(0, input.flour - preferment.flour);
  const finalLiquid = Math.max(0, liquid - preferment.liquid);
  const finalWater = Math.max(0, liquidWater - preferment.water);
  const finalYeast = Math.max(0, yeast - preferment.yeast);

  // ----------------------------------------------------------
  //  7. Истинная гидратация
  //  Учитываем воду из яиц (~76% веса целого яйца)
  // ----------------------------------------------------------
  const EGG_WATER_FRACTION: Record<EggType, number> = {
    none: 0, 
    whole: 0.76,
    yolk: 0.48,
    white: 0.88,
    powder: 0.05,
  };
  const waterFromEggs = Math.round(eggsGr * (EGG_WATER_FRACTION[input.eggType] ?? 0));
  const trueHydration = input.flour > 0
    ? Math.round(((liquidWater + waterFromEggs) / input.flour) * 100)
    : 0;

  // ----------------------------------------------------------
  //  8. Итоги
  // ----------------------------------------------------------
  const finalDough =
    finalFlour +
    finalLiquid +
    saltGr +
    sugarGr +
    fatGr +
    eggsGr +
    finalYeast;

  const totalDough = finalDough + preferment.total;

  // ----------------------------------------------------------
  //  9. Результат
  // ----------------------------------------------------------
  return {
    flour: input.flour,
    mainFlourGr,
    extraFlour1Gr,
    extraFlour2Gr,
    mainFlour: input.mainFlour,
    extraFlour1: input.extraFlour1,
    extraPct1,
    extraFlour2: input.extraFlour2,
    extraPct2,

    liquid,
    liquidWater,
    liquidType: input.liquidType,

    salt: saltGr,
    sugar: sugarGr,
    fat: fatGr,
    eggs: input.eggs,
    eggsGr,
    yeast,

    fatType: input.fatType,
    eggType: input.eggType,
    sugarType: input.sugarType,
    yeastForm: input.yeastForm,

    hydration: input.hydration,
    trueHydration,

    yeastRecommendedPct,

    preferment,
    prefermentType: input.prefermentType,
    prefermentFlourPct: input.prefermentFlourPct,
    prefermentHydrationPct: input.prefermentHydrationPct,
    prefermentYeastPct: input.prefermentYeastPct,

    finalFlour,
    finalLiquid,
    finalWater,
    finalYeast,

    finalDough,
    totalDough,
  };
}