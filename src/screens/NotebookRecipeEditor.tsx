import UiIcon from "../components/UiIcon";
import IngredientNameInput from "../components/IngredientNameInput";
import { readNotebookDraft, writeNotebookDraft, clearNotebookDraft } from "../logic/notebookDraft";
// MASAMASA_INGREDIENT_SUGGESTIONS_V1
import { useEffect, useMemo, useState, type ReactNode } from "react";
import "./NotebookRecipeEditor.css";
import { notebookIngredients } from "../logic/notebookIngredients";

export type NotebookIngredient = {
  id: string;
  name: string;
  grams: number;
  isFlour: boolean;
};

export type NotebookRecipe = {
  version: 1;
  id: string;
  title: string;
  ingredients: NotebookIngredient[];
  notes: string;
  createdAt: number;
  updatedAt: number;
};

type Lang = "ru" | "en" | "es";
const translations = {
  ru: {
    heading: "Новый рецепт", edit: "Редактировать рецепт", name: "Название рецепта", nameHint: "Например, бабушкин пирог",
    ingredient: "Ингредиент", grams: "Количество, г", flour: "Мука", percent: "% от основы", add: "+ Добавить ингредиент",
    notes: "Мои заметки", notesHint: "Особенности приготовления, наблюдения, результат...", save: "Сохранить рецепт", cancel: "Отмена",
    required: "Введите название рецепта и хотя бы один ингредиент с положительным количеством.",
    duplicate: "У ингредиентов с положительным количеством должны быть заполнены названия.",
    helper: "Технологический помощник", flourInfo: "Сумма ингредиентов основы принята за 100%. Состав основы можно изменить под таблицей.",
    totalFlour: "Мучная основа", total: "Масса теста", noFlour: "Основа не выбрана: проценты не рассчитываются.",
    noStandards: "Это арифметические пекарские проценты, не оценка правильности рецептуры. Рекомендации по технологии добавим отдельно.",
    remove: "Удалить ингредиент", error: "Не удалось сохранить рецепт в браузере. Данные не изменены.",
  },
  en: {
    heading: "New recipe", edit: "Edit recipe", name: "Recipe name", nameHint: "For example, family apple cake",
    ingredient: "Ingredient", grams: "Amount, g", flour: "Flour", percent: "% of basis", add: "+ Add ingredient",
    notes: "My notes", notesHint: "Method, observations, results...", save: "Save recipe", cancel: "Cancel",
    required: "Enter a recipe name and at least one ingredient with a positive amount.",
    duplicate: "Every ingredient with a positive amount must have a name.",
    helper: "Technology helper", flourInfo: "Percentages are based on the combined flour weight selected under Percentage basis. Without flour, percentages are not calculated.",
    totalFlour: "Flour basis", total: "Dough weight", noFlour: "No basis selected: percentages are not calculated.",
    noStandards: "These are mathematical baker's percentages, not a judgment of your recipe. Technology suggestions will be added separately.",
    remove: "Remove ingredient", error: "Could not save this recipe in your browser. No data was changed.",
  },
  es: {
    heading: "Nueva receta", edit: "Editar receta", name: "Nombre de la receta", nameHint: "Por ejemplo, tarta de la abuela",
    ingredient: "Ingrediente", grams: "Cantidad, g", flour: "Harina", percent: "% de la base", add: "+ Añadir ingrediente",
    notes: "Mis notas", notesHint: "Elaboración, observaciones, resultado...", save: "Guardar receta", cancel: "Cancelar",
    required: "Introduce el nombre y al menos un ingrediente con una cantidad positiva.",
    duplicate: "Cada ingrediente con cantidad positiva necesita un nombre.",
    helper: "Asistente tecnológico", flourInfo: "Los porcentajes se calculan sobre el peso de la harina seleccionada en Base de los porcentajes. Sin harina, no se calculan.",
    totalFlour: "Base de harina", total: "Peso de la masa", noFlour: "Sin base seleccionada: no se calculan porcentajes.",
    noStandards: "Son porcentajes matemáticos, no una evaluación de tu receta. Las sugerencias tecnológicas se añadirán después.",
    remove: "Eliminar ingrediente", error: "No se ha podido guardar la receta en este navegador. No se han modificado los datos.",
  },
} as const;

// MASAMASA_AUTO_FLOUR_V1: name-based suggestion; saved flags are preserved.
const normalizeIngredient = (name: string) => name.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/ё/g,"е").trim();
const detectFlour = (name: string): boolean => {
 const key=normalizeIngredient(name);
 const entry=notebookIngredients.find(x => Object.values(x.labels).some(label=>normalizeIngredient(label)===key));
 if(entry) return entry.base;
 if(["тапиока","tapioca","маизена","maicena"].includes(key)) return true;
 return /(^|\s)(мука|flour|harina|крахмал|starch|almidon|fecula)(\s|$)/u.test(key);
};
const createIngredient = (): NotebookIngredient => ({ id: crypto.randomUUID(), name: "", grams: 0, isFlour: false });
const format = (value: number, lang: Lang) => value.toLocaleString(lang === "ru" ? "ru-RU" : lang === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: 2 });

export default function NotebookRecipeEditor({ lang, recipe, onSave, onCancel, onPreview, previewLabel, saveLabel, extraContent }: {
  lang: Lang;
  recipe: NotebookRecipe | null;
  onSave: (recipe: NotebookRecipe) => boolean | string;
  onPreview?: (recipe: NotebookRecipe) => boolean | string;
  previewLabel?: string;
  saveLabel?: string;
  extraContent?: ReactNode;
  onCancel: () => void;
}) {
  const t = translations[lang];
  const [draft] = useState(()=>{const saved=readNotebookDraft(recipe?.id ?? null);return saved?.recipeId === (recipe?.id ?? null) && saved?.recipeUpdatedAt === (recipe?.updatedAt ?? null) ? saved : null;});
  const [title, setTitle] = useState(draft?.title ?? recipe?.title ?? "");
  const [notes, setNotes] = useState(draft?.notes ?? recipe?.notes ?? "");
  const [ingredients, setIngredients] = useState<NotebookIngredient[]>(() => draft?.ingredients.map(x=>({...x})) ?? recipe?.ingredients.map(x => ({...x})) ?? [
    createIngredient(), createIngredient(), createIngredient(),
  ]);
  useEffect(()=>{writeNotebookDraft({recipeId:recipe?.id ?? null,recipeUpdatedAt:recipe?.updatedAt ?? null,title,notes,ingredients});},[title,notes,ingredients,recipe?.id,recipe?.updatedAt]);
  const [remembered, setRemembered] = useState<Array<{name:string;isFlour:boolean}>>(() => {
    try {const v=JSON.parse(localStorage.getItem("masamasa.notebook.ingredients.v1") ?? "[]");return Array.isArray(v)?v.filter(x=>typeof x?.name==="string" && typeof x?.isFlour==="boolean"):[];} catch {return [];}
  });
  const suggestions = useMemo(() => {
    const all = [...notebookIngredients.map(x=>({name:x.labels[lang] as string,isFlour:x.base as boolean})),...remembered,...(recipe?.ingredients ?? [])];
    return Array.from(new Map(all.map(x=>[normalizeIngredient(x.name),x])).values()).filter(x=>x.name.trim());
  },[lang,remembered,recipe]);
  const detectBasis = (name:string) => suggestions.find(x=>normalizeIngredient(x.name)===normalizeIngredient(name))?.isFlour ?? detectFlour(name);

  const [basisVisible, setBasisVisible] = useState(false);
  const basisText = lang === "ru" ? "Основа процентов" : lang === "es" ? "Base de los porcentajes" : "Percentage basis";
  const changeText = lang === "ru" ? "Выбрать основу" : lang === "es" ? "Elegir la base" : "Select basis";
  const emptyBasis = lang === "ru" ? "не выбрана" : lang === "es" ? "sin seleccionar" : "not selected";
  const basisHelp = lang === "ru" ? "Мука и крахмалы предлагаются как основа. Отметьте все ингредиенты, суммарную массу которых нужно принять за 100%." : lang === "es" ? "Las harinas y los almidones se proponen como base. Selecciona los ingredientes cuya suma debe equivaler al 100%." : "Flours and starches are suggested as the basis. Select all ingredients whose combined weight should equal 100%.";
  const [error, setError] = useState("");
  const flourGrams = useMemo(() => ingredients.reduce((sum, x) => sum + (x.isFlour ? Number(x.grams) || 0 : 0), 0), [ingredients]);
  const totalGrams = useMemo(() => ingredients.reduce((sum, x) => sum + (Number(x.grams) || 0), 0), [ingredients]);
  const update = (id: string, change: Partial<NotebookIngredient>) => setIngredients(prev => prev.map(x => x.id === id ? { ...x, ...change } : x));
  // MASAMASA_NOTEBOOK_SCALE_V1
  const [targetMass, setTargetMass] = useState("");
  const [scaleError, setScaleError] = useState("");
  const [beforeScale, setBeforeScale] = useState<NotebookIngredient[] | null>(null);
  const scaleText = {
    ru: { title: "Пересчитать рецепт", mass: "Требуемая масса теста, г", apply: "Рассчитать", undo: "Отменить пересчёт", help: "Все количества изменятся пропорционально. Для записи результата нажмите «Сохранить рецепт».", invalid: "Введите положительную массу и заполните количества ингредиентов.", applied: "Количества пересчитаны." },
    en: { title: "Scale the recipe", mass: "Target dough weight, g", apply: "Scale", undo: "Undo scaling", help: "All quantities will change proportionally. Choose Save recipe to store the result.", invalid: "Enter a positive target weight and ingredient quantities.", applied: "Quantities updated." },
    es: { title: "Recalcular la receta", mass: "Peso deseado de la masa, g", apply: "Recalcular", undo: "Deshacer el cálculo", help: "Todas las cantidades cambiarán proporcionalmente. Pulsa Guardar receta para guardar el resultado.", invalid: "Introduce un peso positivo y las cantidades de los ingredientes.", applied: "Cantidades recalculadas." },
  }[lang];
  const scaleRecipe = () => {
    const target = Number(targetMass.trim().replace(",", "."));
    if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(totalGrams) || totalGrams <= 0 || ingredients.some(x => !Number.isFinite(x.grams) || x.grams < 0)) {
      setScaleError(scaleText.invalid); return;
    }
    const scaled = ingredients.map(x => ({...x, grams: x.grams / totalGrams * target}));
    if (scaled.some((x,i) => !Number.isFinite(x.grams) || (ingredients[i].grams > 0 && x.grams <= 0))) {setScaleError(scaleText.invalid);return;}
    setBeforeScale(ingredients.map(x => ({...x})));
    setIngredients(scaled);
    setScaleError("");
    setError("");
  };
  const candidate = (): NotebookRecipe | null => {
    const valid = ingredients.filter(x => x.grams > 0);
    if (!title.trim() || valid.length === 0) { setError(t.required); return null; }
    if (valid.some(x => !x.name.trim())) { setError(t.duplicate); return null; }
    if (ingredients.some(item => !Number.isFinite(item.grams) || item.grams < 0)) { setError(t.required); return null; }
    const now = Date.now();
    return {
      version: 1, id: recipe?.id ?? crypto.randomUUID(), title: title.trim(),
      ingredients: valid.map(x => ({ ...x, name: x.name.trim() })), notes,
      createdAt: recipe?.createdAt ?? now, updatedAt: now,
    };
  };
  const save = () => {
    const next = candidate();
    if (!next) return;
    const result = onSave(next);
    if (result !== true) { setError(typeof result === "string" ? result : t.error); return; }
    clearNotebookDraft(recipe?.id ?? null);
    const valid = next.ingredients;
    try {
      const previous=JSON.parse(localStorage.getItem("masamasa.notebook.ingredients.v1") ?? "[]");
      const entries=[...(Array.isArray(previous)?previous.filter(x=>typeof x?.name==="string" && typeof x?.isFlour==="boolean"):[]),...valid.map(x=>({name:x.name.trim(),isFlour:x.isFlour}))];
      const next=Array.from(new Map(entries.map(x=>[normalizeIngredient(x.name),x])).values());
      localStorage.setItem("masamasa.notebook.ingredients.v1",JSON.stringify(next));setRemembered(next);
    } catch { /* Recipe was saved; optional suggestion history is unavailable. */ }
  };
  return (
    <section className="mm-blank-editor" aria-label={recipe ? t.edit : t.heading}>
      <h3>{recipe ? t.edit : t.heading}</h3>
      <label className="mm-blank-field"><span>{t.name}</span><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t.nameHint} maxLength={160} /></label>
      <div className="mm-blank-table-wrap"><table className="mm-blank-table"><thead><tr><th>{t.ingredient}</th><th title={t.grams}>{lang === "ru" ? "г" : "g"}</th><th title={t.percent} aria-label={t.percent}>%</th><th /></tr></thead><tbody>
        {ingredients.map(item => <tr key={item.id}>
          <td><IngredientNameInput value={item.name} suggestions={suggestions} label={t.ingredient} lang={lang} onChange={name=>update(item.id,{name,isFlour:detectBasis(name)})}/></td>
          <td><input type="number" min="0" step="any" aria-label={t.grams} value={item.grams === 0 ? "" : Number(item.grams.toPrecision(6))} onChange={e => update(item.id, {grams:Math.max(0, Number(e.target.value) || 0)})} /></td>
          <td><output className="mm-percent-output" aria-label={t.percent}>{flourGrams > 0 ? `${format(item.grams / flourGrams * 100,lang)}%` : "—"}</output></td>
          <td><button type="button" className="mm-blank-remove" title={t.remove} aria-label={t.remove} onClick={() => setIngredients(prev => prev.filter(x => x.id !== item.id))}><UiIcon name="x" /></button></td>
        </tr>)}
      </tbody></table></div>
      <div className="mm-blank-basis">
        <span>{basisText}{flourGrams > 0 ? " · 100%" : ""}: <strong>{ingredients.filter(x => x.isFlour && x.name.trim()).map(x => x.name).join(", ") || emptyBasis}</strong></span>{" "}
        <button type="button" onClick={() => setBasisVisible(v => !v)} aria-expanded={basisVisible}>{changeText}</button>
        {basisVisible && <div className="mm-blank-basis-options">
          <p>{basisHelp}</p>
          {ingredients.filter(x => x.name.trim()).map(item => <label key={item.id}>
            <input type="checkbox" checked={item.isFlour} onChange={e => update(item.id, {isFlour:e.target.checked})} />
            <span>{item.name}</span>
          </label>)}
        </div>}
      </div>
      <button className="mm-blank-add" type="button" onClick={() => setIngredients(prev => [...prev, createIngredient()])}><UiIcon name="plus" />{t.add.replace(/^\+\s*/, "")}</button>
      <div className="mm-blank-totals"><span>{t.total}: <strong>{format(totalGrams,lang)} {lang === "ru" ? "г" : "g"}</strong></span><span>{t.totalFlour}: <strong>{format(flourGrams,lang)} {lang === "ru" ? "г" : "g"}</strong></span></div>
      <details className="mm-scale-panel">
        <summary><span className="mm-heading-label"><UiIcon name="scale" />{scaleText.title}</span><UiIcon name="chevron-down" className="mm-disclosure-icon" /></summary>
        <label className="mm-blank-field"><span>{scaleText.mass}</span>
          <input type="text" inputMode="decimal" value={targetMass} onChange={e => {setTargetMass(e.target.value);setScaleError("");}} />
        </label>
        <div className="mm-blank-actions">
          <button type="button" className="mm-blank-cancel" onClick={scaleRecipe}>{scaleText.apply}</button>
          {beforeScale && <button type="button" className="mm-blank-cancel" onClick={() => {
            const previous = new Map(beforeScale.map(x => [x.id,x.grams]));
            setIngredients(current => current.map(x => previous.has(x.id) ? {...x,grams:previous.get(x.id)!} : x));
            setBeforeScale(null);setScaleError("");
          }}>{scaleText.undo}</button>}
        </div>
        <p>{scaleText.help}</p>
        {beforeScale && <p role="status">{scaleText.applied}</p>}
        {scaleError && <p className="mm-blank-error" role="alert">{scaleError}</p>}
      </details>
      {extraContent}
      <label className="mm-blank-field"><span className="mm-heading-label"><UiIcon name="sticky-note" />{t.notes}</span><textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.notesHint} /></label>
      {onPreview && <button type="button" className="mm-blank-cancel mm-formula-card-link" onClick={() => {
        const next = candidate();
        if (!next) return;
        const result = onPreview(next);
        if (result !== true) setError(typeof result === "string" ? result : t.error);
      }}><UiIcon name="sticky-note" />{previewLabel}</button>}
      {error && <p className="mm-blank-error" role="alert">{error}</p>}
      <div className="mm-blank-actions mm-editor-footer"><button type="button" className="mm-blank-save" onClick={save}>{saveLabel ?? (recipe ? {ru:"Сохранить изменения",en:"Save changes",es:"Guardar cambios"}[lang] : t.save)}</button><button type="button" className="mm-blank-cancel" onClick={()=>{clearNotebookDraft(recipe?.id ?? null);onCancel();}}>{t.cancel}</button></div>
    </section>
  );
}
