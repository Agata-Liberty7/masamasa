import pizza from "../profiles/pizza.json";
import bread from "../profiles/bread.json";
import baguette from "../profiles/baguette.json";
import focaccia from "../profiles/focaccia.json";
import ciabatta from "../profiles/ciabatta.json";
import bagel from "../profiles/bagel.json";
import pita from "../profiles/pita.json";
import brioche from "../profiles/brioche.json";
import cinnabon from "../profiles/cinnabon.json";
import donuts from "../profiles/donuts.json";
import enriched from "../profiles/enriched.json";
import ensaimada from "../profiles/ensaimada.json";
import belyashi from "../profiles/belyashi.json";
import chebureki from "../profiles/chebureki.json";
import empanada from "../profiles/empanada.json";
import baked_pirozhki from "../profiles/baked_pirozhki.json";
import sourdough from "../profiles/sourdough.json";
import sponge from "../profiles/sponge.json";
import shortcrust from "../profiles/shortcrust.json";
import choux from "../profiles/choux.json";

import levain from "../profiles/levain.json";
import poolish from "../profiles/poolish.json";
import none from "../profiles/none.json";
import yeasted_sponge from "../profiles/yeasted_sponge.json";
import biga from "../profiles/biga.json";
import enriched_pref from "../profiles/enriched.json";

import {
  computeYeastPercent,
  type FlourType,
  type YeastForm,
} from "./fermentationModel";

const profiles: Record<string, any> = {
  pizza,
  bread,
  baguette,
  focaccia,
  ciabatta,
  bagel,
  pita,
  brioche,
  cinnabon,
  donuts,
  enriched,
  ensaimada,
  belyashi,
  chebureki,
  empanada,
  baked_pirozhki,
  sourdough,
  sponge,
  shortcrust,
  choux,
};

const preferments: Record<string, any> = {
  levain,
  poolish,
  none,
  yeasted_sponge,
  biga,
  enriched: enriched_pref,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function detectType(profile: any) {
  const sugar = profile.base?.sugar ?? 0;
  const fat = profile.base?.fat ?? 0;
  const eggs = profile.base?.eggs ?? 0;
  const yeast = profile.base?.yeast?.percent ?? 0;

  return {
    isEnriched: sugar > 5 || fat > 5 || eggs > 0,
    isLean: sugar <= 5 && fat <= 5 && eggs === 0 && yeast > 0,
    isSourdough: yeast === 0 && profile.prefermentId === "levain",
    isFried:
      profile.category === "fried" || profile.category === "fried_enriched",
    isBoiled: profile.category === "boiled_bread",
    isPastry: profile.category === "pastry",
  };
}

function detectDefaultPreferment(profile: any) {
  if (profile.prefermentId) return profile.prefermentId;
  if (profile.preferment?.enabled && profile.preferment?.type) {
    return profile.preferment.type;
  }

  if (profile.category === "bread") return "poolish";
  if (profile.category === "enriched") return "yeasted_sponge";
  if (profile.category === "sourdough") return "levain";

  return "none";
}

export function loadProfile(
  profileId: string,
  climate: string,
  mixing: string,
  opts?: {
    productionMode?: "home" | "professional";
    coldHours?: number;
    warmHours?: number;
    flourType?: FlourType;
    yeastForm?: YeastForm;
    roomTemp?: number;
  }
) {
  const raw = profiles[profileId];
  if (!raw) throw new Error(`Профиль ${profileId} не найден`);

  const profile = JSON.parse(JSON.stringify(raw));
  const base = profile.base ?? {};
  const limits = profile.limits ?? {};

  const flags = detectType(profile);

  // Новый формат профиля: состав рецепта определяет расчётные показатели.
  // Старый hydration остаётся временно только для legacy-профилей.
  const usesRecipeComposition =
    typeof base.liquidPct === "number";

  // -----------------------------
  // 1. Климатические поправки
  // -----------------------------
  const climateAdj = profile.climateAdjustments?.[climate];
  if (climateAdj) {
    if (usesRecipeComposition) {
      base.liquidPct =
        (base.liquidPct ?? 0) + (climateAdj.hydrationDelta || 0);
    } else {
      base.hydration =
        (base.hydration ?? 0) + (climateAdj.hydrationDelta || 0);
    }

    if (base.yeast) {
      base.yeast.percent =
        (base.yeast.percent ?? 0) + (climateAdj.yeastDeltaPercent || 0);
    }
  }

  // -----------------------------
  // 2. Поправки на замес
  // -----------------------------
  const mixingAdj = profile.mixingAdjustments?.[mixing];
  if (mixingAdj) {
    if (usesRecipeComposition) {
      base.liquidPct =
        (base.liquidPct ?? 0) + (mixingAdj.hydrationDelta || 0);
    } else {
      base.hydration =
        (base.hydration ?? 0) + (mixingAdj.hydrationDelta || 0);
    }

    if (base.yeast) {
      base.yeast.percent =
        (base.yeast.percent ?? 0) + (mixingAdj.yeastPercentDelta || 0);
    }
  }

  // -----------------------------
  // 3. Умная модель
  // -----------------------------
  const productionMode = opts?.productionMode ?? "home";
  const coldHours = opts?.coldHours ?? 0;
  const warmHours = opts?.warmHours ?? 0;
  const flourType = opts?.flourType ?? "normal";
  const yeastForm = opts?.yeastForm ?? (base.yeast?.type ?? "instant");
  const roomTemp = opts?.roomTemp ?? 24;
  const originalYeastForm: YeastForm = base.yeast?.type === "fresh" ? "fresh" : "instant";

  // 3.1 Гидратация
  // Здесь НЕ вызываем computeHydration(), потому что на этапе загрузки профиля
  // у нас ещё нет реальных пользовательских выборов по жидкости / жиру / яйцам / сахару.
  // Оставляем профильную базу + climate/mixing adjustments.
  // Динамический пересчёт гидратации должен происходить позже, на этапе RecipeInput.

  // 3.2 Дрожжи
  // Профиль остаётся источником истины.
  // Модель используем только как fallback, если в профиле не задан yeast.percent.
  // Но flourType уже учитываем реально.
  if (base.yeast && profile.prefermentId !== "levain") {
    const modelYeastPercent = computeYeastPercent({
      coldHours,
      warmHours,
      doughType: flags.isEnriched ? "enriched" : "lean",
      yeastForm,
      productionMode,
      roomTemp,
      mainFlour: flourType,
      extraFlour1: "normal",
      extraPct1: 0,
      extraFlour2: "normal",
      extraPct2: 0,
    });

    const baselineYeastPercent = computeYeastPercent({
      coldHours: 0,
      warmHours: 1,
      doughType: flags.isEnriched ? "enriched" : "lean",
      yeastForm,
      productionMode: "home",
      roomTemp: 24,
      mainFlour: flourType,
      extraFlour1: "normal",
      extraPct1: 0,
      extraFlour2: "normal",
      extraPct2: 0,
    });

    if (
      typeof base.yeast.percent === "number" &&
      Number.isFinite(base.yeast.percent) &&
      baselineYeastPercent > 0
    ) {
      base.yeast.percent *= modelYeastPercent / baselineYeastPercent;
      if (yeastForm !== originalYeastForm) {
        base.yeast.percent *= yeastForm === "fresh" ? 3 : 1 / 3;
      }
    } else {
      base.yeast.percent = modelYeastPercent * 100;
    }
  }

  // -----------------------------
  // 4. Ограничения профиля
  // -----------------------------
  if (limits.hydration) {
    if (usesRecipeComposition) {
      base.liquidPct = clamp(
        base.liquidPct,
        limits.hydration.min,
        limits.hydration.max
      );
    } else if (typeof base.hydration === "number") {
      base.hydration = clamp(
        base.hydration,
        limits.hydration.min,
        limits.hydration.max
      );
    }
  }

  if (limits.salt) {
    base.salt = clamp(base.salt, limits.salt.min, limits.salt.max);
  }

  if (limits.sugar) {
    base.sugar = clamp(base.sugar, limits.sugar.min, limits.sugar.max);
  }

  if (limits.fat) {
    base.fat = clamp(base.fat, limits.fat.min, limits.fat.max);
  }

  if (base.yeast && limits.yeastPercent) {
    base.yeast.percent = clamp(
      base.yeast.percent,
      limits.yeastPercent.min,
      limits.yeastPercent.max
    );
  }

  // -----------------------------
  // 5. Предфермент
  // -----------------------------
  const defaultPrefermentType = detectDefaultPreferment(profile);
  const prefType = profile.preferment?.type || profile.prefermentId || "none";
  const prefData = preferments[prefType] || preferments.none;

  return {
    id: profile.id,
    name: profile.name,
    category: profile.category,
    subtype: profile.subtype || profile.id,

    base,
    limits: profile.limits,
    process: profile.process,
    schedule: profile.schedule,
    bake: profile.bake,
    uiHints: profile.uiHints,

    preferment: {
      enabled: profile.preferment?.enabled || prefType !== "none",
      type: prefType,
      percentOfFlour: profile.preferment?.percentOfFlour || 0,
      hydration: profile.preferment?.hydration || 100,
      yeastPercentInPreferment:
        profile.preferment?.yeastPercentInPreferment || 0,
      data: prefData,
    },

    ...flags,
    defaultPrefermentType,
  };
}