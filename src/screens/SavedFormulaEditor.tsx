import { useEffect, useMemo, useState } from "react";
import UiIcon from "../components/UiIcon";
import { useTranslation } from "react-i18next";
import NotebookRecipeEditor, { type NotebookRecipe } from "./NotebookRecipeEditor";
import { notebookIngredients } from "../logic/notebookIngredients";
import { formulaAsNotebook, ingredientKey, updateSavedFormula, type FormulaResolver } from "../logic/savedFormulaNotebook";

export default function SavedFormulaEditor({ entry, onSave, onCancel, onPreview }: {
  entry: any;
  onSave: (entry: any, expectedTimestamp: number) => boolean | string;
  onCancel: () => void;
  onPreview: (entry: any, expectedTimestamp: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("es") ? "es" : i18n.language.startsWith("en") ? "en" : "ru";
  const text = {
    ru: { preview: "Техкарта", save: "Сохранить изменения", invalid: "Проверьте названия и количества ингредиентов.", preferment: "Для сохранённого предфермента недостаточно муки, основной жидкости или дрожжей. Изменения не сохранены.", empty: "Не удалось открыть состав этого рецепта. Сохранённые данные не изменены." },
    en: { preview: "Process card", save: "Save changes", invalid: "Check ingredient names and amounts.", preferment: "The saved preferment requires more flour, primary liquid or yeast than this formula contains. Changes were not saved.", empty: "Could not open this formula. Saved data was not changed." },
    es: { preview: "Ficha técnica", save: "Guardar cambios", invalid: "Revisa los nombres y las cantidades de los ingredientes.", preferment: "No hay suficiente harina, líquido principal o levadura para el prefermento guardado. No se han guardado los cambios.", empty: "No se pudo abrir esta receta. Los datos guardados no han cambiado." },
  }[lang];
  const recipe = useMemo(() => {
    try {
      return formulaAsNotebook(entry, (group, value) => group === "simple" ? t(`recipeInput.${value}`) : group === "additives" ? t(`additives.${value}`, { defaultValue: value }) : group === "processFat" ? `${t("processFat.spreading")}: ${t(`processFat.ingredients.${value}`, { defaultValue: value })}` : t(`ingredients.${group}.${value}`, { defaultValue: value }));
    } catch { return null; }
  }, [entry.id, entry.timestamp, lang, t]);
  const resolve = useMemo<FormulaResolver>(() => {
    const aliases = new Map<string, { role: "flour" | "liquid" | "salt" | "sugar" | "fat" | "eggs" | "yeast" | "additive"; type: string }>();
    const groups = { flour: ["normal", "strong", "integral", "rye", "buckwheat", "corn", "rice", "oat", "flax"], liquid: ["water", "milk", "kefir", "whey", "plant_milk"], fat: ["butter", "oil", "ghee", "margarine"], egg: ["whole", "yolk", "white", "powder"], sugar: ["white", "brown", "panela"], yeast: ["instant", "fresh", "active"] };
    for (const language of ["en", "es", "ru"]) {
      aliases.set(ingredientKey(t("recipeInput.salt", { lng: language })), { role: "salt", type: "salt" });
      for (const [group, types] of Object.entries(groups)) for (const type of types) aliases.set(ingredientKey(t(`ingredients.${group}.${type}`, { lng: language })), { role: group === "egg" ? "eggs" : group as "flour" | "liquid" | "fat" | "sugar" | "yeast", type });
    }
    for (const ingredient of notebookIngredients) {
      const [group, type] = ingredient.id.split(".");
      const role = group === "egg" ? "eggs" : ["flour", "liquid", "fat", "sugar", "yeast"].includes(group) ? group : ingredient.base ? "flour" : null;
      if (role) for (const name of Object.values(ingredient.labels)) aliases.set(ingredientKey(name), { role: role as "flour" | "liquid" | "fat" | "eggs" | "sugar" | "yeast", type: group === "extra" ? "normal" : type });
    }
    return name => aliases.get(ingredientKey(name));
  }, [t]);
  const settingsKey = `masamasa:formulaSettingsDraft:v1:${entry.id}`;
  const [settings, setSettings] = useState(() => {
    try { const saved = JSON.parse(sessionStorage.getItem(settingsKey) ?? "null"); if (saved?.timestamp === entry.timestamp && saved.settings?.conditions && saved.settings?.preferment) return saved.settings as {conditions: any; preferment: any}; } catch { /* Optional draft. */ }
    return { conditions: { ...entry.conditions }, preferment: { type: entry.recipe.prefermentType ?? entry.recipe.preferment?.type ?? "none", flour: entry.recipe.prefermentFlourPct ?? (entry.recipe.flour > 0 ? (entry.recipe.preferment?.flour ?? 0) / entry.recipe.flour * 100 : 0), hydration: entry.recipe.prefermentHydrationPct ?? (entry.recipe.preferment?.flour > 0 ? entry.recipe.preferment.liquid / entry.recipe.preferment.flour * 100 : 100), yeast: entry.recipe.prefermentYeastPct ?? (entry.recipe.preferment?.flour > 0 ? entry.recipe.preferment.yeast / entry.recipe.preferment.flour * 100 : 0) } };
  });
  useEffect(() => { try { sessionStorage.setItem(settingsKey, JSON.stringify({ timestamp: entry.timestamp, settings })); } catch { /* Optional draft. */ } }, [settingsKey, entry.timestamp, settings]);
  const clearSettings = () => { try { sessionStorage.removeItem(settingsKey); } catch { /* Optional draft. */ } };
  const settingLabels = {
    ru: { title: "Условия и предфермент", temp: "Температура помещения, °C", warm: "Тёплая ферментация, ч", cold: "Холодная ферментация, ч", climate: "Климат", mixing: "Замес", mode: "Режим", home: "Домашний", professional: "Производственный", pref: "Предфермент", flour: "Мука в предферменте, % от всей муки", hydration: "Гидратация предфермента, %", yeast: "Дрожжи в предферменте, % от его муки" },
    en: { title: "Conditions and preferment", temp: "Room temperature, °C", warm: "Warm fermentation, h", cold: "Cold fermentation, h", climate: "Climate", mixing: "Mixing", mode: "Mode", home: "Home", professional: "Professional", pref: "Preferment", flour: "Prefermented flour, % of total flour", hydration: "Preferment hydration, %", yeast: "Preferment yeast, % of its flour" },
    es: { title: "Condiciones y prefermento", temp: "Temperatura ambiente, °C", warm: "Fermentación templada, h", cold: "Fermentación en frío, h", climate: "Clima", mixing: "Amasado", mode: "Modo", home: "Doméstico", professional: "Profesional", pref: "Prefermento", flour: "Harina del prefermento, % de la harina total", hydration: "Hidratación del prefermento, %", yeast: "Levadura del prefermento, % de su harina" },
  }[lang];
  const convert = (candidate: NotebookRecipe) => updateSavedFormula({ ...entry, conditions: settings.conditions, recipe: { ...entry.recipe, prefermentType: settings.preferment.type, prefermentFlourPct: settings.preferment.flour, prefermentHydrationPct: settings.preferment.hydration, prefermentYeastPct: settings.preferment.yeast } }, candidate, resolve);
  const conditionField = (key: string, label: string, max: number) => <label className="mm-blank-field"><span>{label}</span><input aria-label={label} type="number" min="0" max={max} step="any" inputMode="decimal" value={settings.conditions[key] ?? ""} onChange={event => setSettings(current => ({ ...current, conditions: { ...current.conditions, [key]: Number(event.target.value) } }))}/></label>;
  const preferenceField = (key: string, label: string) => <label className="mm-blank-field"><span>{label}</span><input aria-label={label} type="number" min="0" step="any" inputMode="decimal" value={settings.preferment[key]} onChange={event => setSettings(current => ({ ...current, preferment: { ...current.preferment, [key]: Number(event.target.value) } }))}/></label>;
  const extraContent = <details className="mm-scale-panel mm-saved-settings"><summary><span>{settingLabels.title}</span><UiIcon name="chevron-down" className="mm-disclosure-icon"/></summary><div className="mm-saved-settings-grid">
    {conditionField("roomTemp", settingLabels.temp, 45)}{conditionField("warmFermentationHours", settingLabels.warm, 168)}{conditionField("coldFermentationHours", settingLabels.cold, 168)}
    {([ ["climate",settingLabels.climate,["dry","moderate","humid"]], ["mixing",settingLabels.mixing,["manual","planetary","spiral"]] ] as const).map(([key,label,options]) => <label key={key} className="mm-blank-field"><span>{label}</span><select aria-label={label} value={settings.conditions[key] ?? (key === "climate" ? "moderate" : "manual")} onChange={event=>setSettings(current=>({...current,conditions:{...current.conditions,[key]:event.target.value}}))}>{options.map(option=><option key={option} value={option}>{t(`ingredients.${key}.${option}`)}</option>)}</select></label>)}
    <label className="mm-blank-field"><span>{settingLabels.mode}</span><select aria-label={settingLabels.mode} value={settings.conditions.productionMode ?? "home"} onChange={event=>setSettings(current=>({...current,conditions:{...current.conditions,productionMode:event.target.value}}))}><option value="home">{settingLabels.home}</option><option value="professional">{settingLabels.professional}</option></select></label>
    <label className="mm-blank-field"><span>{settingLabels.pref}</span><select aria-label={settingLabels.pref} value={settings.preferment.type} onChange={event=>setSettings(current=>({...current,preferment:{...current.preferment,type:event.target.value}}))}>{["none","poolish","biga","levain","yeasted_sponge","enriched"].map(type=><option key={type} value={type}>{t(`ingredients.preferment.${type}`)}</option>)}</select></label>
    {settings.preferment.type !== "none" && <>{preferenceField("flour",settingLabels.flour)}{preferenceField("hydration",settingLabels.hydration)}{preferenceField("yeast",settingLabels.yeast)}</>}
  </div></details>;
  const errorText = (error: unknown) => {
    if (error instanceof Error && error.message === "preferment") return text.preferment;
    if (error instanceof Error && error.message === "conditions") return {ru:"Проверьте температуру и время ферментации.",en:"Check the temperature and fermentation times.",es:"Revisa la temperatura y los tiempos de fermentación."}[lang];
    if (error instanceof Error && error.message === "prefermentSettings") return {ru:"Проверьте проценты предфермента.",en:"Check the preferment percentages.",es:"Revisa los porcentajes del prefermento."}[lang];
    return text.invalid;
  };
  if (!recipe) return <p role="alert">{text.empty}</p>;
  return <NotebookRecipeEditor
    lang={lang}
    recipe={recipe}
    extraContent={extraContent}
    saveLabel={text.save}
    previewLabel={text.preview}
    onSave={candidate => { try { const result = onSave(convert(candidate), entry.timestamp); if (result === true) clearSettings(); return result; } catch (error) { return errorText(error); } }}
    onPreview={candidate => { try { onPreview(convert(candidate), entry.timestamp); return true; } catch (error) { return errorText(error); } }}
    onCancel={() => { clearSettings(); onCancel(); }}
  />;
}
