// Saved results contain grams; RecipeInput expects baker's percentages.
export function savedRecipeInput(recipe: any) {
  const flour = Number(recipe?.flour ?? recipe?._input?.flour);
  if (!Number.isFinite(flour) || flour <= 0) throw new Error("Invalid saved flour weight");
  const number = (value: any, fallback = 0) => {
    if (value === null || value === undefined || value === "") return fallback;
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  };
  const percent = (grams: any) => number(grams) * 100 / flour;
  const pref = recipe.preferment ?? {};
  const source = recipe._input ?? {};
  return {
    mode: "flour", targetDoughWeight: 0,
    flour,
    liquidPct: number(recipe.liquidPct, percent(recipe.liquid)),
    salt: percent(recipe.salt), sugar: percent(recipe.sugar), fat: percent(recipe.fat),
    eggsPct: number(recipe.eggsPct, percent(recipe.eggsGr)),
    yeastPct: percent(recipe.yeast),
    processFatPct: number(recipe.processFat?.percent, percent(recipe.processFat?.grams)),
    processFatIngredient: recipe.processFat?.ingredient ?? "",
    mainFlour: recipe.mainFlour ?? "normal",
    extraFlour1: recipe.extraFlour1 ?? "normal", extraPct1: number(recipe.extraPct1, percent(recipe.extraFlour1Gr)),
    extraFlour2: recipe.extraFlour2 ?? "normal", extraPct2: number(recipe.extraPct2, percent(recipe.extraFlour2Gr)),
    liquidType: recipe.liquidType ?? "water", fatType: recipe.fatType ?? "butter",
    eggType: recipe.eggType ?? "whole", sugarType: recipe.sugarType ?? "white",
    yeastForm: recipe.yeastForm ?? "instant",
    prefermentType: recipe.prefermentType ?? pref.type ?? "none",
    prefermentFlourPct: number(recipe.prefermentFlourPct, percent(pref.flour)),
    prefermentHydrationPct: number(recipe.prefermentHydrationPct, number(pref.flour) > 0 ? number(pref.liquid) * 100 / number(pref.flour) : 100),
    prefermentYeastPct: number(recipe.prefermentYeastPct, number(pref.flour) > 0 ? number(pref.yeast) * 100 / number(pref.flour) : 0),
    // Prefer the original unrounded formula whenever it was saved.
    ...source,
    additives: (source.additives ?? recipe.additives ?? []).map((item: any) => ({
      id: item.id, percent: number(item.percent, percent(item.grams)),
    })),
    _calculated: false,
  };
}
