import type { NotebookIngredient, NotebookRecipe } from "../screens/NotebookRecipeEditor";
import { getLiquidWaterContent } from "./liquidWaterContent";
import { FAT_WATER_CONTENT } from "./fatWaterContent";
import { EGG_WEIGHTS } from "./eggWeights";

type Role = "flour" | "liquid" | "salt" | "sugar" | "fat" | "eggs" | "yeast" | "processFat" | "additive";
type Identity = { role: Role; type: string; originalName: string; additiveId?: string };
export type FormulaIngredient = NotebookIngredient & { formula?: Identity };
type Labels = (group: string, value: string) => string;
export type FormulaResolver = (name: string) => { role: Role; type: string } | undefined;
const finite = (value: unknown, fallback = 0): number => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const ingredientKey = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/ё/g, "е").trim();

export function formulaAsNotebook(entry: any, label: Labels): NotebookRecipe {
  if (entry.editorRecipe?.version === 1 && Array.isArray(entry.editorRecipe.ingredients)) {
    return { ...structuredClone(entry.editorRecipe), id: `formula:${entry.id}`, title: entry.name, updatedAt: entry.timestamp };
  }
  const r = entry.recipe ?? {};
  const ingredients: FormulaIngredient[] = [];
  const add = (id: string, role: Role, type: string, name: string, grams: unknown, additiveId?: string) => {
    const amount = finite(grams);
    if (amount > 0) ingredients.push({ id, name, grams: amount, isFlour: role === "flour", formula: { role, type, originalName: name, additiveId } });
  };
  const extra1 = finite(r.extraFlour1Gr), extra2 = finite(r.extraFlour2Gr);
  add("formula-main-flour", "flour", r.mainFlour ?? "normal", label("flour", r.mainFlour ?? "normal"), finite(r.flour) - extra1 - extra2);
  add("formula-extra-flour-1", "flour", r.extraFlour1 ?? "normal", label("flour", r.extraFlour1 ?? "normal"), extra1);
  add("formula-extra-flour-2", "flour", r.extraFlour2 ?? "normal", label("flour", r.extraFlour2 ?? "normal"), extra2);
  add("formula-liquid", "liquid", r.liquidType ?? "water", label("liquid", r.liquidType ?? "water"), r.liquid);
  add("formula-salt", "salt", "salt", label("simple", "salt"), r.salt);
  add("formula-sugar", "sugar", r.sugarType ?? "white", label("sugar", r.sugarType ?? "white"), r.sugar);
  add("formula-fat", "fat", r.fatType ?? "butter", label("fat", r.fatType ?? "butter"), r.fat);
  add("formula-eggs", "eggs", r.eggType ?? "whole", label("egg", r.eggType ?? "whole"), r.eggsGr);
  add("formula-yeast", "yeast", r.yeastForm ?? "instant", label("yeast", r.yeastForm ?? "instant"), r.yeast);
  (r.additives ?? []).forEach((item: any, index: number) => add(`formula-additive-${index}`, "additive", "", label("additives", item.id), item.grams, item.id));
  if (finite(r.processFat?.grams) > 0) add("formula-process-fat", "processFat", r.processFat.ingredient, label("processFat", r.processFat.ingredient), r.processFat.grams);
  if (!ingredients.length) throw new Error("empty");
  return { version: 1, id: `formula:${entry.id}`, title: entry.name, ingredients, notes: typeof entry.notes === "string" ? entry.notes : typeof r.notes === "string" ? r.notes : "", createdAt: entry.timestamp, updatedAt: entry.timestamp };
}

function identifiedRows(edit: NotebookRecipe, resolve: FormulaResolver): FormulaIngredient[] {
  return edit.ingredients.map((item: FormulaIngredient) => {
    if (!item.id || !item.name.trim() || !Number.isFinite(item.grams) || item.grams <= 0) throw new Error("invalid");
    const existing = item.formula;
    const identity = existing && (existing.role === "processFat" || ingredientKey(existing.originalName) === ingredientKey(item.name))
      ? existing : resolve(item.name) ?? { role: item.isFlour ? "flour" as const : "additive" as const, type: item.isFlour ? "normal" : "" };
    return { ...item, formula: { ...identity, originalName: item.name } };
  });
}

// Manual formulas are stored as exact gram rows; changing their batch size is arithmetic.
// The source profile, conditions, process times and saved ID are retained by the caller.
export function updateSavedFormula(entry: any, edit: NotebookRecipe, resolve: FormulaResolver) {
  const rows = identifiedRows(edit, resolve);
  if (!edit.title.trim() || !rows.length) throw new Error("invalid");
  const ids = new Set(rows.map(row => row.id));
  if (ids.size !== rows.length) throw new Error("invalid");
  const original = entry.recipe ?? {};
  const sum = (role: Role) => rows.filter(row => row.formula?.role === role).reduce((total, row) => total + row.grams, 0);
  const firstType = (role: Role, fallback: string) => rows.find(row => row.formula?.role === role)?.formula?.type || fallback;
  const flour = sum("flour"), liquid = sum("liquid"), salt = sum("salt"), sugar = sum("sugar"), fat = sum("fat"), eggsGr = sum("eggs"), yeast = sum("yeast"), processFatGr = sum("processFat");
  const percent = (amount: number) => flour > 0 ? amount / flour * 100 : 0;
  const liquidType = firstType("liquid", original.liquidType ?? "water");
  const yeastForm = firstType("yeast", original.yeastForm ?? "instant");
  const fatType = firstType("fat", original.fatType ?? "butter");
  const eggType = firstType("eggs", original.eggType ?? "whole");
  const prefFlourPct = finite(original.prefermentFlourPct, flour > 0 ? finite(original.preferment?.flour) / finite(original.flour, 1) * 100 : 0);
  const prefHydration = finite(original.prefermentHydrationPct, finite(original.preferment?.flour) > 0 ? finite(original.preferment?.liquid) / original.preferment.flour * 100 : 100);
  const prefYeastPct = finite(original.prefermentYeastPct, finite(original.preferment?.flour) > 0 ? finite(original.preferment?.yeast) / original.preferment.flour * 100 : 0);
  if (prefFlourPct < 0 || prefFlourPct > 100 || prefHydration < 0 || prefYeastPct < 0) throw new Error("prefermentSettings");
  for (const [key, maximum] of [["roomTemp",45],["warmFermentationHours",168],["coldFermentationHours",168]] as const) {
    const value = entry.conditions?.[key];
    if (value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > maximum)) throw new Error("conditions");
  }
  const prefType = original.prefermentType ?? original.preferment?.type ?? "none";
  const hasPref = prefType !== "none" && prefFlourPct > 0;
  const prefFlour = hasPref ? flour * prefFlourPct / 100 : 0;
  const prefLiquid = prefFlour * prefHydration / 100, prefYeast = prefFlour * prefYeastPct / 100;
  const eligibleLiquid = rows.filter(row => row.formula?.role === "liquid" && row.formula.type === liquidType).reduce((total, row) => total + row.grams, 0);
  const eligibleYeast = rows.filter(row => row.formula?.role === "yeast" && row.formula.type === yeastForm).reduce((total, row) => total + row.grams, 0);
  if (hasPref && (flour <= 0 || prefFlour > flour + 1e-7 || prefLiquid > eligibleLiquid + 1e-7 || prefYeast > eligibleYeast + 1e-7)) throw new Error("preferment");
  const totalDough = rows.reduce((total, row) => total + row.grams, 0);
  if (!Number.isFinite(totalDough) || totalDough <= 0) throw new Error("invalid");
  const liquidWater = rows.filter(row => row.formula?.role === "liquid").reduce((total, row) => total + row.grams * getLiquidWaterContent(row.formula!.type), 0);
  const eggWater: Record<string, number> = { whole: .76, yolk: .48, white: .88, powder: .05, none: 0 };
  const effectiveWaterGr = liquidWater + rows.reduce((total, row) => total + (row.formula?.role === "eggs" ? row.grams * (eggWater[row.formula.type] ?? 0) : row.formula?.role === "fat" ? row.grams * (FAT_WATER_CONTENT[row.formula.type as keyof typeof FAT_WATER_CONTENT] ?? 0) : 0), 0);
  const flours = rows.filter(row => row.formula?.role === "flour");
  const extra1 = flours[1]?.grams ?? 0, extra2 = flours[2]?.grams ?? 0;
  const additives = rows.filter(row => row.formula?.role === "additive").map(row => ({ id: row.formula?.additiveId ?? row.name, grams: row.grams, percent: percent(row.grams) }));
  const preferment = { type: prefType, flour: prefFlour, liquid: prefLiquid, water: prefLiquid * getLiquidWaterContent(liquidType), yeast: prefYeast, total: prefFlour + prefLiquid + prefYeast };
  const processFat = { ...(original.processFat ?? {}), ingredient: firstType("processFat", original.processFat?.ingredient ?? ""), grams: processFatGr, percent: percent(processFatGr) };
  const input = { ...(original._input ?? {}), mode: "flour", targetDoughWeight: 0, flour, liquidPct: percent(liquid), salt: percent(salt), sugar: percent(sugar), fat: percent(fat), eggsPct: percent(eggsGr), yeastPct: percent(yeast), processFatPct: percent(processFatGr), liquidType, fatType, eggType, yeastForm, additives: additives.map(({ id, percent }) => ({ id, percent })) };
  const recipe = {
    ...structuredClone(original), flour, liquid, salt, sugar, fat, eggsGr, yeast, liquidType, fatType, eggType, yeastForm,
    sugarType: firstType("sugar", original.sugarType ?? "white"),
    mainFlour: flours[0]?.formula?.type ?? "normal", mainFlourGr: flour - extra1 - extra2,
    extraFlour1: flours[1]?.formula?.type ?? "normal", extraFlour1Gr: extra1, extraPct1: percent(extra1),
    extraFlour2: flours[2]?.formula?.type ?? "normal", extraFlour2Gr: extra2, extraPct2: percent(extra2),
    liquidPct: percent(liquid), eggsPct: percent(eggsGr), yeastPct: percent(yeast),
    liquidWater, effectiveWaterGr, effectiveWaterPct: percent(effectiveWaterGr),
    approxEggCount: rows.filter(row => row.formula?.role === "eggs").reduce((total, row) => total + row.grams / Math.max(1, EGG_WEIGHTS[row.formula!.type as keyof typeof EGG_WEIGHTS] ?? 50), 0),
    additives, processFat, preferment, prefermentType: prefType, prefermentFlourPct: prefFlourPct, prefermentHydrationPct: prefHydration, prefermentYeastPct: prefYeastPct,
    finalFlour: flour - prefFlour, finalLiquid: liquid - prefLiquid, finalWater: liquidWater - preferment.water, finalYeast: yeast - prefYeast,
    finalDough: totalDough - processFatGr - preferment.total, totalDough,
    prefFlour, prefLiquid, prefWater: preferment.water, prefYeast, prefermentTotal: preferment.total,
    _input: input, _calculated: true,
    formulaIngredients: rows, notes: edit.notes,
  };
  Object.assign(input, { mainFlour: recipe.mainFlour, extraFlour1: recipe.extraFlour1, extraPct1: recipe.extraPct1, extraFlour2: recipe.extraFlour2, extraPct2: recipe.extraPct2, sugarType: recipe.sugarType, processFatIngredient: processFat.ingredient, prefermentType: prefType, prefermentFlourPct: prefFlourPct, prefermentHydrationPct: prefHydration, prefermentYeastPct: prefYeastPct });
  return { ...entry, name: edit.title.trim(), notes: edit.notes, recipe, editorRecipe: { ...edit, ingredients: rows }, timestamp: edit.updatedAt };
}

export function formulaDisplayRows(recipe: any, finalMix = false): Array<[string, number, string]> | null {
  const rows: FormulaIngredient[] | undefined = recipe.formulaIngredients;
  if (!Array.isArray(rows)) return null;
  const eligible = (role: Role, type?: string) => rows.filter(row => row.formula?.role === role && (!type || row.formula.type === type)).reduce((sum, row) => sum + row.grams, 0);
  const pref = recipe.preferment ?? {};
  return rows.filter(row => row.formula?.role !== "processFat").map(row => {
    let amount = row.grams;
    const role = row.formula?.role;
    if (finalMix && role === "flour" && eligible("flour") > 0) amount -= finite(pref.flour) * row.grams / eligible("flour");
    if (finalMix && role === "liquid" && row.formula?.type === recipe.liquidType && eligible("liquid", recipe.liquidType) > 0) amount -= finite(pref.liquid) * row.grams / eligible("liquid", recipe.liquidType);
    if (finalMix && role === "yeast" && row.formula?.type === recipe.yeastForm && eligible("yeast", recipe.yeastForm) > 0) amount -= finite(pref.yeast) * row.grams / eligible("yeast", recipe.yeastForm);
    return [row.name, Math.max(0, amount), row.id];
  });
}
