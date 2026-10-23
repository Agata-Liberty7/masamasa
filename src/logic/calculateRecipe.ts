// ============================================================
//  calculateRecipe.ts — единый оркестратор расчёта рецепта
// ============================================================

import { computeYeastPercent } from "./fermentationModel";
import {
  calculateLiquidWater,
} from "./liquidWaterContent";
import { EGG_WEIGHTS } from "./eggWeights";
import { calculateFatWater } from "./fatWaterContent";

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

  // Legacy: старые профили
  hydration?: number;

  // Новый composition-профиль:
  // количество основной жидкости как baker's percentage.
  liquidPct?: number;

  liquidType: LiquidType;

  // Ингредиенты (% от муки)
  salt: number;
  sugar: number;
  fat: number;
  eggsPct: number;

  // Типы ингредиентов
  fatType: FatType;
  eggType: EggType;
  sugarType: SugarType;
  yeastForm: YeastForm;

  // Дрожжи
  yeastPct: number; // % от муки, введённый пользователем / из профиля

  // Предфермент
  prefermentType: PrefermentType;
  prefermentFlourPct: number;
  prefermentHydrationPct: number;
  prefermentYeastPct: number; // % of flour within preferment

  // Условия производства
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

  // Яйца
  eggsPct: number;
  eggsGr: number;
  approxEggCount: number;

  // Дрожжи
  yeast: number;

  // Типы
  fatType: FatType;
  eggType: EggType;
  sugarType: SugarType;
  yeastForm: YeastForm;

  // Аналитика воды
  liquidPct: number;
  effectiveWaterGr: number;
  effectiveWaterPct: number;

  // Рекомендация дрожжей от движка
  yeastRecommendedPct: number;

  // Предфермент
  preferment: PrefermentResult;
  prefermentType: PrefermentType;
  prefermentFlourPct: number;
  prefermentHydrationPct: number;
  prefermentYeastPct: number; // % of flour within preferment

  // Основной замес
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

// yeastPct is already the baker's percentage of the selected yeast form.
// Conversion between forms happens in the input UI, not during gram calculation.

// ============================================================
//  Вода в яйцах
// ============================================================

const EGG_WATER_FRACTION: Record<EggType, number> = {
  none: 0,
  whole: 0.76,
  yolk: 0.48,
  white: 0.88,
  powder: 0.05,
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

  const mainFlourGr = Math.round(
    (input.flour * mainPct) / 100
  );

  const extraFlour1Gr = Math.round(
    (input.flour * extraPct1) / 100
  );

  const extraFlour2Gr = Math.round(
    (input.flour * extraPct2) / 100
  );

  // ----------------------------------------------------------
  //  2. Жидкость
  // ----------------------------------------------------------

  // Для новых профилей источником количества основной жидкости
  // является liquidPct.
  // hydration здесь используется только как fallback для legacy-профилей.
  const primaryLiquidPct =
    typeof input.liquidPct === "number"
      ? input.liquidPct
      : input.hydration ?? 0;

  const liquid = Math.round(
    (input.flour * primaryLiquidPct) / 100
  );

  const liquidWater = calculateLiquidWater(
    liquid,
    input.liquidType
  );

  // ----------------------------------------------------------
  //  3. Ингредиенты
  // ----------------------------------------------------------

  const saltGr = Math.round(
    (input.flour * input.salt) / 100
  );

  const sugarGr = Math.round(
    (input.flour * input.sugar) / 100
  );

  const fatGr = Math.round(
    (input.flour * input.fat) / 100
  );

  // ----------------------------------------------------------
  //  4. Яйца
  //
  //  В рецептуре яйца хранятся как baker's percentage.
  //
  //  Например:
  //  flour = 1000 г
  //  eggsPct = 20
  //  => eggsGr = 200 г
  //
  //  Количество яиц — только ориентировочная справка.
  // ----------------------------------------------------------

  const eggsGr = Math.round(
    (input.flour * input.eggsPct) / 100
  );

  const referenceEggWeight =
    input.eggType === "none"
      ? 0
      : EGG_WEIGHTS[input.eggType] ?? 50;

  const approxEggCount =
    referenceEggWeight > 0
      ? Math.round((eggsGr / referenceEggWeight) * 10) / 10
      : 0;

  // ----------------------------------------------------------
  //  5. Дрожжи
  //
  //  Пока сохраняем текущую схему:
  //  пользователь / профиль задаёт процент,
  //  движок отдельно рассчитывает рекомендацию.
  // ----------------------------------------------------------

  const yeast = Math.round(((input.flour * input.yeastPct) / 100) * 1000) / 1000;

  const yeastRecommendedPct = 100 * computeYeastPercent({
    coldHours: input.coldFermentationHours,
    warmHours: input.warmFermentationHours,
    doughType: input.doughType,
    yeastForm: input.yeastForm,
    productionMode: input.productionMode,
    roomTemp: input.roomTemp,

    mainFlour: input.mainFlour,
    extraFlour1: input.extraFlour1,
    extraPct1,

    extraFlour2: input.extraFlour2,
    extraPct2,
  });

  // ----------------------------------------------------------
  //  6. Предфермент
  // ----------------------------------------------------------

  let preferment: PrefermentResult = {
    type: "none",
    flour: 0,
    liquid: 0,
    water: 0,
    yeast: 0,
    total: 0,
  };

  if (
    input.prefermentType !== "none" &&
    input.prefermentFlourPct > 0
  ) {
    const prefFlour = Math.round(
      (input.flour * input.prefermentFlourPct) / 100
    );

    const prefLiquid = Math.round(
      (prefFlour * input.prefermentHydrationPct) / 100
    );

    const prefWater = calculateLiquidWater(
      prefLiquid,
      input.liquidType
    );

    // Yeast in preferment uses baker's % of preferment flour, NOT
    // percent of the total yeast mass. Keep sub-gram precision.
    const prefYeast = Math.round(
      ((prefFlour * input.prefermentYeastPct) / 100) * 1000
    ) / 1000;

    if (
      input.prefermentFlourPct > 100 ||
      prefLiquid > liquid ||
      prefYeast > yeast + 0.0001
    ) {
      throw new Error("Preferment needs more flour, liquid, or yeast than the total recipe contains.");
    }

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
  //  7. Основной замес
  // ----------------------------------------------------------

  const finalFlour = Math.max(
    0,
    input.flour - preferment.flour
  );

  const finalLiquid = Math.max(
    0,
    liquid - preferment.liquid
  );

  const finalWater = Math.max(
    0,
    liquidWater - preferment.water
  );

  const finalYeast = Math.max(
    0,
    Math.round((yeast - preferment.yeast) * 1000) / 1000
  );

  // ----------------------------------------------------------
  //  8. Истинная гидратация
  //
  //  Сейчас учитываем:
  //  - реальную воду основной жидкости
  //  - воду из яиц
  //
  //  Другие источники воды позже можно добавить отдельно.
  // ----------------------------------------------------------

  const waterFromEggs = Math.round(
    eggsGr *
      (EGG_WATER_FRACTION[input.eggType] ?? 0)
  );

  const waterFromFat = calculateFatWater(
    fatGr,
    input.fatType
  );

  const effectiveWaterGr =
    liquidWater + waterFromEggs + waterFromFat;

  const effectiveWaterPct =
    input.flour > 0
      ? Math.round(
          (effectiveWaterGr / input.flour) * 100
        )
      : 0;

  // ----------------------------------------------------------
  //  9. Итоги
  // ----------------------------------------------------------

  const finalDough =
    finalFlour +
    finalLiquid +
    saltGr +
    sugarGr +
    fatGr +
    eggsGr +
    finalYeast;

  const totalDough =
    finalDough + preferment.total;

  // ----------------------------------------------------------
  //  10. Результат
  // ----------------------------------------------------------

  return {
    // Мука
    flour: input.flour,

    mainFlourGr,
    extraFlour1Gr,
    extraFlour2Gr,

    mainFlour: input.mainFlour,

    extraFlour1: input.extraFlour1,
    extraPct1,

    extraFlour2: input.extraFlour2,
    extraPct2,

    // Жидкость
    liquid,
    liquidWater,
    liquidType: input.liquidType,

    // Ингредиенты
    salt: saltGr,
    sugar: sugarGr,
    fat: fatGr,

    // Яйца
    eggsPct: input.eggsPct,
    eggsGr,
    approxEggCount,

    // Дрожжи
    yeast,

    // Типы
    fatType: input.fatType,
    eggType: input.eggType,
    sugarType: input.sugarType,
    yeastForm: input.yeastForm,

    // Аналитика воды
    liquidPct: primaryLiquidPct,
    effectiveWaterGr,
    effectiveWaterPct,

    // Дрожжи — рекомендация модели
    yeastRecommendedPct,

    // Предфермент
    preferment,

    prefermentType: input.prefermentType,
    prefermentFlourPct: input.prefermentFlourPct,
    prefermentHydrationPct:
      input.prefermentHydrationPct,
    prefermentYeastPct:
      input.prefermentYeastPct,

    // Основной замес
    finalFlour,
    finalLiquid,
    finalWater,
    finalYeast,

    // Итоги
    finalDough,
    totalDough,
  };
}