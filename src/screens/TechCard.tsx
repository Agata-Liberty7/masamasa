import React from "react";
import { makeTechnologyPdf } from "../utils/technologyPdf";
import { technologyProtocolFor } from "../logic/technologyProtocols";
import { useTranslation } from "react-i18next";
import "./TechCard.css";
import { translateProfileText } from "./techCardProfileText";
import { buildProductionTimeline, planProductionTimeline, stageDefaultMinutes, type StageId, type StageTimeEdits } from "../logic/processTimeline";

type Conditions = {
  climate: string;
  mixing: string;
  productionMode: string;
  roomTemp: number;
  warmFermentationHours: number;
  coldFermentationHours: number;
};

type Props = {
  profile: any;
  recipe: any;
  conditions: Conditions;
  onBack: () => void;
  initialDurationEdits?: StageTimeEdits;
  onSave?: (durationEdits: StageTimeEdits) => void;
  savedCard?: boolean;
  savedTitle?: string;
  saveNotice?: string | null;
  onStageEdit?: () => void;
};

type Locale = "ru" | "en" | "es";

const editingText = {
  ru: {
    editable: "Плановое время по операции можно изменить. Это не меняет рецепт и расчёт дрожжей.",
    hours: "ч", minutes: "мин", profileRange: "Ориентир профиля", provisional: "Предварительная оценка для партии, уточните по своему производству.",
    reset: "Вернуть времена из профиля", edited: "Изменено вручную", settings: "Меняется в условиях производства",
    proofWarning: "После изменения окончательной расстойки необходимо проверить дозировку дрожжей. Она не пересчитывается автоматически.",
    outOfRange: "Минуты: 0–59; часы: 0–168", noSave: "Изменения действуют для открытой карты и попадут в печать/PDF; пока не сохраняются как новый профиль.",
  },
  en: {
    editable: "Edit planned stage times here. This does not change the formula or yeast calculation.",
    hours: "h", minutes: "min", profileRange: "Profile guide", provisional: "Preliminary batch estimate; confirm for your production.",
    reset: "Restore profile durations", edited: "Edited manually", settings: "Change in production settings",
    proofWarning: "Changes to the final proof require yeast dosage review. Yeast is not recalculated automatically.",
    outOfRange: "Minutes: 0–59; hours: 0–168", noSave: "Edits apply to this open card and print/PDF; they are not yet saved as a new profile.",
  },
  es: {
    editable: "Edita los tiempos previstos por etapa. No cambia la fórmula ni el cálculo de levadura.",
    hours: "h", minutes: "min", profileRange: "Referencia del perfil", provisional: "Estimación preliminar por lote; validar en producción.",
    reset: "Restaurar tiempos del perfil", edited: "Modificado manualmente", settings: "Modificar en condiciones de producción",
    proofWarning: "Cambiar la fermentación final exige revisar la dosis de levadura. No se recalcula automáticamente.",
    outOfRange: "Minutos: 0–59; horas: 0–168", noSave: "Los cambios se aplican a esta ficha y a impresión/PDF; todavía no se guardan como perfil.",
  },
} as const;


const timelineText = {
  ru: {
    heading: "Полный технологический маршрут",
    source: { conditions: "по условиям", profile: "по профилю" },
    stage: { panade: "Заваривание муки", cool: "Охлаждение заварной основы", preferment: "Подготовка предфермента", autolyse: "Автолиз", mix: "Замес", warm: "Тёплое брожение", cold: "Холодная ферментация", chill: "Охлаждение перед формованием", rest: "Отдых теста", stretch: "Растягивание и нанесение жира", shape: "Формование", proof: "Окончательная расстойка", bake: "Выпечка", fry: "Жарка" },
    unknown: "Продолжительность не задана", known: "Учтённое время", earliest: "Не менее", full: "Полное время", active: "Активные операции", passive: "Брожение / ожидание", thermal: "Тепловая обработка", omitted: "Полный срок пока не определён: для части обязательных операций нет продолжительности.",
    review: "Ориентир профиля, требует проверки на производстве.", working: "12 часов — рабочий режим для этой модели; это не заявление о соответствии IGP.",
    yeast: "Внимание: расчёт дрожжей пока не использует время окончательной расстойки. Для длительной расстойки дозировка требует отдельной проверки.",
    h: "ч", min: "мин",
  },
  en: {
    heading: "Complete production sequence",
    source: { conditions: "user settings", profile: "profile" },
    stage: { panade: "Cooking the panade", cool: "Cooling the panade", preferment: "Preferment preparation", autolyse: "Autolyse", mix: "Mixing", warm: "Warm bulk fermentation", cold: "Cold fermentation", chill: "Chilling before shaping", rest: "Dough rest", stretch: "Stretching and fat application", shape: "Shaping", proof: "Final proof", bake: "Baking", fry: "Frying" },
    unknown: "Duration not specified", known: "Scheduled time accounted for", earliest: "At least", full: "Complete duration", active: "Active operations", passive: "Fermentation / waiting", thermal: "Thermal processing", omitted: "Total duration is not yet available: some required operations have no timing.",
    review: "Profile estimate; validate during production.", working: "The 12-hour duration is a working assumption, not an IGP certification.",
    yeast: "Note: the yeast calculator does not yet include the final-proof duration. Validate dosage for extended proofing.",
    h: "h", min: "min",
  },
  es: {
    heading: "Secuencia completa de elaboración",
    source: { conditions: "condiciones", profile: "perfil" },
    stage: { panade: "Cocción de la panada", cool: "Enfriamiento de la panada", preferment: "Preparación del prefermento", autolyse: "Autólisis", mix: "Amasado", warm: "Fermentación inicial templada", cold: "Fermentación en frío", chill: "Enfriamiento antes del formado", rest: "Reposo de la masa", stretch: "Estirado y aplicación de manteca", shape: "Formado", proof: "Fermentación final", bake: "Horneado", fry: "Fritura" },
    unknown: "Duración no definida", known: "Tiempo contabilizado", earliest: "Como mínimo", full: "Tiempo total", active: "Operaciones activas", passive: "Fermentación / espera", thermal: "Tratamiento térmico", omitted: "No se puede calcular el tiempo total: hay operaciones obligatorias sin duración.",
    review: "Estimación del perfil; pendiente de validación en producción.", working: "Las 12 horas son un criterio de trabajo, no acreditan conformidad IGP.",
    yeast: "Atención: el cálculo de levadura todavía no incluye el tiempo de fermentación final. Verificar la dosis para fermentaciones prolongadas.",
    h: "h", min: "min",
  },
} as const;


const messages = {
  ru: {
    title: "Технологическая карта",
    subtitle: "Расчётная закладка ингредиентов и технологические ориентиры",
    back: "Назад к рецепту",
    print: "Печать",
    batch: "Выход теста",
    batchWithProcessFat: "Масса полуфабриката",
    spreading: "Жир для растягивания",
    spreadingStep: "Отдельная операция после замеса",
    baseDoughWeight: "Тесто до нанесения жира",
    conditions: "Условия производства",
    climate: "Климат",
    mixing: "Замес",
    mode: "Режим",
    temp: "Температура помещения",
    warm: "Заданная тёплая ферментация",
    cold: "Заданная холодная ферментация",
    hours: "ч",
    home: "Домашний",
    professional: "Производственный",
    dry: "Сухой",
    moderate: "Умеренный",
    humid: "Влажный",
    manual: "Ручной",
    planetary: "Планетарный",
    spiral: "Спиральный",
    ingredient: "Ингредиент",
    qty: "Количество",
    total: "Полная рецептура (включая предфермент)",
    formula: "Рецептура",
    flour: "Мука",
    water: "Основная жидкость",
    salt: "Соль",
    sugar: "Сахар",
    fat: "Жир",
    eggs: "Яйца",
    yeast: "Дрожжи",
    preferment: "Предфермент",
    mainMix: "Основной замес",
    mixNote: "Добавить готовый предфермент целиком. Ниже только оставшиеся ингредиенты.",
    flourTypes: "Виды муки в общей рецептуре",
    process: "Технологический процесс",
    mixingStage: "Замес",
    mixingIntensity: "Интенсивность замеса",
    mixingDuration: "Время замеса по профилю",
    bulk: "Основное брожение",
    bulkReference: "Ориентир времени в профиле",
    bulkTarget: "Целевой подъём",
    proof: "Финальная расстойка",
    proofReference: "Ориентир времени в профиле",
    proofTarget: "Критерий готовности",
    retard: "Холодная ферментация",
    retardUser: "Время, выбранное пользователем",
    bake: "Выпечка",
    minutes: "мин",
    steps: "Операции по профилю",
    fromStart: "от начала брожения",
    notes: "Примечания технолога",
    disclaimer: "Время замеса, расстойки и выпечки из профиля - технологические ориентиры. Они не пересчитаны автоматически под выбранные условия. Контролируйте состояние теста.",
    prepared: "Дата формирования",
    noPreferment: "Предфермент не задан",
  },
  en: {
    title: "Production sheet",
    subtitle: "Calculated ingredient allocations and process guidance",
    back: "Back to recipe",
    print: "Print",
    batch: "Total dough",
    batchWithProcessFat: "Shaped product mass",
    spreading: "Fat for stretching",
    spreadingStep: "Separate operation after mixing",
    baseDoughWeight: "Mixed dough before fat application",
    conditions: "Production conditions",
    climate: "Climate",
    mixing: "Mixing",
    mode: "Production mode",
    temp: "Room temperature",
    warm: "Selected warm fermentation",
    cold: "Selected cold fermentation",
    hours: "h",
    home: "Home",
    professional: "Professional",
    dry: "Dry",
    moderate: "Moderate",
    humid: "Humid",
    manual: "Hand",
    planetary: "Planetary mixer",
    spiral: "Spiral mixer",
    ingredient: "Ingredient",
    qty: "Amount",
    total: "Full formula (including preferment)",
    formula: "Formula",
    flour: "Flour",
    water: "Primary liquid",
    salt: "Salt",
    sugar: "Sugar",
    fat: "Fat",
    eggs: "Eggs",
    yeast: "Yeast",
    preferment: "Preferment",
    mainMix: "Final mix",
    mixNote: "Add all prepared preferment. Listed quantities are the remaining ingredients only.",
    flourTypes: "Flour types in the full formula",
    process: "Production process",
    mixingStage: "Mixing",
    mixingIntensity: "Mixing intensity",
    mixingDuration: "Profile mixing time",
    bulk: "Bulk fermentation",
    bulkReference: "Reference duration in profile",
    bulkTarget: "Rise target",
    proof: "Final proof",
    proofReference: "Reference duration in profile",
    proofTarget: "Readiness criterion",
    retard: "Cold fermentation",
    retardUser: "User-selected duration",
    bake: "Baking",
    minutes: "min",
    steps: "Profile instructions",
    fromStart: "from fermentation start",
    notes: "Baker's notes",
    disclaimer: "Mixing, proofing and baking times in the profile are guidelines, not automatically recalculated for selected conditions. Check the dough itself.",
    prepared: "Generated",
    noPreferment: "No preferment selected",
  },
  es: {
    title: "Ficha técnica de producción",
    subtitle: "Cantidades calculadas y orientaciones del proceso",
    back: "Volver a la receta",
    print: "Imprimir",
    batch: "Masa total",
    batchWithProcessFat: "Peso de la pieza formada",
    spreading: "Grasa para estirar",
    spreadingStep: "Operación separada después del amasado",
    baseDoughWeight: "Masa antes de aplicar la grasa",
    conditions: "Condiciones de producción",
    climate: "Clima",
    mixing: "Amasado",
    mode: "Modo",
    temp: "Temperatura ambiente",
    warm: "Fermentación templada elegida",
    cold: "Fermentación en frío elegida",
    hours: "h",
    home: "Doméstico",
    professional: "Profesional",
    dry: "Seco",
    moderate: "Moderado",
    humid: "Húmedo",
    manual: "Manual",
    planetary: "Amasadora planetaria",
    spiral: "Amasadora espiral",
    ingredient: "Ingrediente",
    qty: "Cantidad",
    total: "Fórmula completa (incluido el prefermento)",
    formula: "Receta",
    flour: "Harina",
    water: "Líquido principal",
    salt: "Sal",
    sugar: "Azúcar",
    fat: "Grasa",
    eggs: "Huevos",
    yeast: "Levadura",
    preferment: "Prefermento",
    mainMix: "Amasado final",
    mixNote: "Añadir todo el prefermento preparado. Aquí figuran solo los ingredientes restantes.",
    flourTypes: "Tipos de harina de la fórmula completa",
    process: "Proceso de elaboración",
    mixingStage: "Amasado",
    mixingIntensity: "Intensidad del amasado",
    mixingDuration: "Tiempo orientativo del perfil",
    bulk: "Fermentación en bloque",
    bulkReference: "Duración orientativa del perfil",
    bulkTarget: "Objetivo de volumen",
    proof: "Fermentación final",
    proofReference: "Duración orientativa del perfil",
    proofTarget: "Criterio de punto",
    retard: "Fermentación en frío",
    retardUser: "Duración elegida",
    bake: "Horneado",
    minutes: "min",
    steps: "Operaciones del perfil",
    fromStart: "desde el inicio de la fermentación",
    notes: "Notas de elaboración",
    disclaimer: "Los tiempos de amasado, fermentación y horneado del perfil son orientativos. No se recalculan automáticamente según las condiciones elegidas. Controle el estado real de la masa.",
    prepared: "Fecha de emisión",
    noPreferment: "Sin prefermento",
  },
};

function safe(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const cardSavingText = {
  ru: {
    save: "Сохранить рецепт и техкарту",
    update: "Сохранить изменения",
    hint: "Времена сохраняются вместе с рецептом в «Мои рецепты». Базовый профиль остаётся неизменным.",
  },
  en: {
    save: "Save recipe and process card",
    update: "Save changes",
    hint: "Timings are saved with this recipe under My recipes. The base profile is unchanged.",
  },
  es: {
    save: "Guardar receta y ficha técnica",
    update: "Guardar cambios",
    hint: "Los tiempos se guardan con esta receta en Mis recetas. El perfil base no cambia.",
  },
} as const;

// MASAMASA_CLIENT_PDF_V1
const pdfExportText = {
  ru: { create: "Создать PDF", busy: "Создаём PDF…", ready: "PDF готов", download: "Скачать PDF", share: "Поделиться", failed: "Не удалось создать PDF. Попробуйте ещё раз." },
  en: { create: "Create PDF", busy: "Creating PDF…", ready: "PDF ready", download: "Download PDF", share: "Share", failed: "Could not create PDF. Please try again." },
  es: { create: "Crear PDF", busy: "Generando PDF…", ready: "PDF listo", download: "Descargar PDF", share: "Compartir", failed: "No se pudo generar el PDF. Inténtalo de nuevo." },
} as const;

const TechCard: React.FC<Props> = ({ profile, recipe, conditions, onBack, initialDurationEdits, onSave, savedCard, savedTitle, saveNotice, onStageEdit }) => {
  const { t, i18n } = useTranslation();
  const lang: Locale = i18n.language.startsWith("es") ? "es" : i18n.language.startsWith("en") ? "en" : "ru";
  const m = messages[lang];
  const profileText = (value: unknown) => translateProfileText(value, lang);
  const locale = lang === "es" ? "es-ES" : lang === "en" ? "en-GB" : "ru-RU";
  const number = (v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(safe(v));
  const grams = (v: number) => `${number(v)} ${t("units.g", { defaultValue: "g" })}`;
  const hours = (v: number) => `${number(v)} ${m.hours}`;
  const term = (group: string, value: string) => t(`ingredients.${group}.${value}`, { defaultValue: value });
  const name = savedTitle || t(`profiles.${profile?.id}`, { defaultValue: profile?.name ?? "MasaMasa" });
  const pref = recipe?.preferment ?? {};
  const processFatGr = safe(recipe?.processFat?.grams);
  const processFatIngredient = recipe?.processFat?.ingredient || "lard";
  const spreadingLabel = `${m.spreading} · ${t(`processFat.ingredients.${processFatIngredient}`, {defaultValue: processFatIngredient})}`;
  const hasPref = safe(pref.flour) > 0;
  const hasFermentation = safe(recipe?.yeast) > 0 || ["levain", "poolish", "biga", "yeasted_sponge"].includes(pref.type);
  const schedule = profile?.schedule ?? {};
  const productionTimeline = buildProductionTimeline(profile, conditions, hasFermentation, hasPref);
  const [durationEdits, setDurationEdits] = React.useState<StageTimeEdits>(() => initialDurationEdits ?? {});
  const editLabels = editingText[lang];
  const saveLabels = cardSavingText[lang];
  const plannedTimeline = planProductionTimeline(productionTimeline, durationEdits);
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const pdfText = pdfExportText[lang];
  // Stale PDFs must never be offered after the operator edits a stage time.
  React.useEffect(() => { setPdfFile(null); setPdfError(null); }, [durationEdits]);

  const canSharePdf = (file: File): boolean => {
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
    try {
      return typeof nav.share === "function" &&
        (typeof nav.canShare !== "function" || nav.canShare({ files: [file] }));
    } catch { return false; }
  };

  const makePdf = async () => {
    if (pdfLoading) return;
    setPdfFile(null);
    setPdfError(null);
    setPdfLoading(true);
    try {
      const sheet = document.querySelector(".tech-card-page .tech-card-sheet");
      if (!(sheet instanceof HTMLElement)) throw new Error("Technology card not found");
      const safeName = (name || "TechCard").trim()
        .replace(/[\\/:*?"<>|%]/g, "-").replace(/\s+/g, "_").slice(0, 75);
      const fileName = `MasaMasa_${safeName || "TechCard"}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const file = await makeTechnologyPdf(sheet, fileName);
      setPdfFile(file);
    } catch (error) {
      console.error("MasaMasa PDF generation error:", error);
      setPdfError(pdfText.failed);
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfFile) return;
    const url = URL.createObjectURL(pdfFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = pdfFile.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const sharePdf = async () => {
    if (!pdfFile || !canSharePdf(pdfFile)) return;
    try {
      await navigator.share({ files: [pdfFile], title: "MasaMasa" });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.warn("MasaMasa PDF sharing error:", error);
      setPdfError(pdfText.failed);
    }
  };

  const isStandalone = typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone));


  const updateStageTime = (id: StageId, part: "hours" | "minutes", value: string) => {
    if (value !== "" && (!/^\d+$/.test(value) || Number(value) > (part === "hours" ? 168 : 59))) return;
    const stage = productionTimeline.stages.find((step) => step.id === id);
    if (!stage || stage.source !== "profile") return;
    onStageEdit?.();
    const initial = stageDefaultMinutes(stage);
    setDurationEdits((previous) => ({
      ...previous,
      [id]: {
        hours: previous[id]?.hours ?? (initial === null ? "" : String(Math.floor(initial / 60))),
        minutes: previous[id]?.minutes ?? (initial === null ? "" : String(initial % 60)),
        [part]: value,
      },
    }));
  };
  const timelineLabels = timelineText[lang];
  const durationPart = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h > 0 ? `${h} ${timelineLabels.h}` : "", m > 0 || h === 0 ? `${m} ${timelineLabels.min}` : ""].filter(Boolean).join(" ");
  };
  const durationRange = (low: number | null, high: number | null): string => {
    if (low === null || high === null) return timelineLabels.unknown;
    return low === high ? durationPart(low) : `${durationPart(low)}–${durationPart(high)}`;
  };
  const technicalProtocol = technologyProtocolFor(profile?.id);
  const fmtDate = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  const row = (label: React.ReactNode, amount: number, key: string) => (
    <tr key={key}><td>{label}</td><td className="tech-card-amount">{grams(amount)}</td></tr>
  );

  const totalRows: Array<[string, number, string]> = [
    [m.flour, safe(recipe.flour), "flour"],
    [`${m.water} · ${term("liquid", recipe.liquidType ?? "water")}`, safe(recipe.liquid), "liquid"],
    [m.salt, safe(recipe.salt), "salt"],
    [m.sugar, safe(recipe.sugar), "sugar"],
    [`${m.fat} · ${term("fat", recipe.fatType ?? "butter")}`, safe(recipe.fat), "fat"],
    [`${m.eggs} · ${term("egg", recipe.eggType ?? "whole")}`, safe(recipe.eggsGr), "eggs"],
    [`${m.yeast} · ${term("yeast", recipe.yeastForm ?? "instant")}`, safe(recipe.yeast), "yeast"],
  ];
  const additiveRows: Array<[string, number, string]> = (
    Array.isArray(recipe?.additives) ? recipe.additives : []
  ).map((item: any) => [
    t(`additives.${item.id}`, {defaultValue: item.id}), safe(item.grams), `additive-${item.id}`,
  ]);
  const finalRows: Array<[string, number, string]> = [
    [m.flour, safe(recipe.finalFlour ?? recipe.flour), "flour"],
    [`${m.water} · ${term("liquid", recipe.liquidType ?? "water")}`, safe(recipe.finalLiquid ?? recipe.liquid), "liquid"],
    [m.salt, safe(recipe.salt), "salt"],
    [m.sugar, safe(recipe.sugar), "sugar"],
    [`${m.fat} · ${term("fat", recipe.fatType ?? "butter")}`, safe(recipe.fat), "fat"],
    [`${m.eggs} · ${term("egg", recipe.eggType ?? "whole")}`, safe(recipe.eggsGr), "eggs"],
    [`${m.yeast} · ${term("yeast", recipe.yeastForm ?? "instant")}`, safe(recipe.finalYeast ?? recipe.yeast), "yeast"],
  ];

  // MASAMASA_TECHCARD_DEDUP_V1: when there is no preferment, process fat is grouped in the single formula table.
  if (hasPref && processFatGr > 0) totalRows.push([spreadingLabel, processFatGr, "processFat"]);
  totalRows.push(...additiveRows);
  finalRows.push(...additiveRows);

  return (
    <main className="tech-card-page">
      <div className="tech-card-actions">{/* MASAMASA_PDF_TOOLBAR_LAYOUT_V1 */}
        <div className="tech-card-actions-main">
          <button type="button" onClick={onBack}>{m.back}</button>
          {onSave && (
            <button type="button" className="tech-card-save" onClick={() => onSave(durationEdits)}>
              {savedCard ? saveLabels.update : saveLabels.save}
            </button>
          )}
        </div>

        <div className={`tech-card-actions-export${isStandalone ? " tech-card-actions-export--standalone" : ""}`}>
          {!isStandalone && (
            <button type="button" className="tech-card-print" onClick={() => window.print()}>
              {m.print}
            </button>
          )}
          <button type="button" className="tech-card-print" onClick={makePdf} disabled={pdfLoading}>
            {pdfLoading ? pdfText.busy : pdfText.create}
          </button>
        </div>

        {saveNotice && (
          <div className="tech-card-save-notice" role="status" aria-live="polite">
            ✓ {saveNotice}
          </div>
        )}

        {pdfFile && (
          <div className="tech-card-pdf-result">
            <span className="tech-card-pdf-ready" role="status">✓ {pdfText.ready}</span>
            <div className="tech-card-pdf-result-buttons">
              {canSharePdf(pdfFile) && (
                <button type="button" onClick={sharePdf}>{pdfText.share}</button>
              )}
              <button type="button" onClick={downloadPdf}>{pdfText.download}</button>
            </div>
          </div>
        )}
        {pdfError && <div className="tech-card-pdf-error" role="alert">{pdfError}</div>}
      </div>

      <article className="tech-card-sheet">
        <header className="tech-card-header">
          <div><div className="tech-card-brand">MasaMasa</div><p className="tech-card-overline">{m.title}</p><h1>{name}</h1><p className="tech-card-subtitle">{m.subtitle}</p></div>
          <div className="tech-card-batch"><span>{processFatGr > 0 ? m.batchWithProcessFat : m.batch}</span><strong>{grams(recipe.totalDough)}</strong><small>{m.prepared}: {fmtDate}</small></div>
        </header>

        <section className="tech-card-section">
          <h2>{m.conditions}</h2>
          <dl className="tech-card-conditions">
            <div><dt>{m.temp}</dt><dd>{number(conditions.roomTemp)} °C</dd></div>
            <div><dt>{m.climate}</dt><dd>{(m as Record<string, string>)[conditions.climate] || conditions.climate}</dd></div>
            <div><dt>{m.mixing}</dt><dd>{(m as Record<string, string>)[conditions.mixing] || conditions.mixing}</dd></div>
            <div><dt>{m.mode}</dt><dd>{(m as Record<string, string>)[conditions.productionMode] || conditions.productionMode}</dd></div>
            <div><dt>{m.warm}</dt><dd>{hours(conditions.warmFermentationHours)}</dd></div>
            <div><dt>{m.cold}</dt><dd>{hours(conditions.coldFermentationHours)}</dd></div>
          </dl>
        </section>

        <section className="tech-card-section">
          <h2>{hasPref ? m.total : m.formula}</h2>
          <table className="tech-card-table"><thead><tr><th>{m.ingredient}</th><th>{m.qty}</th></tr></thead>
            <tbody>
              {!hasPref && <tr><th colSpan={2}>{m.mainMix}</th></tr>}
              {totalRows.filter(([, amount, key]) => amount > 0 || key === "flour").map(([label, amount, key]) => row(label, amount, key))}
              {!hasPref && processFatGr > 0 && (
                <>
                  <tr><th colSpan={2}>{m.spreadingStep}</th></tr>
                  {row(spreadingLabel, processFatGr, "spread-fat")}
                </>
              )}
            </tbody>
          </table>
          {!hasPref && processFatGr > 0 && (
            <p className="tech-card-note">{m.baseDoughWeight}: {grams(safe(recipe.totalDough) - processFatGr)}</p>
          )}
          {(safe(recipe.extraFlour1Gr) > 0 || safe(recipe.extraFlour2Gr) > 0) && (
            <div className="tech-card-flours"><strong>{m.flourTypes}</strong>
              <p>{term("flour", recipe.mainFlour ?? "normal")}: {grams(recipe.mainFlourGr)}</p>
              {safe(recipe.extraFlour1Gr) > 0 && <p>{term("flour", recipe.extraFlour1 ?? "normal")}: {grams(recipe.extraFlour1Gr)}</p>}
              {safe(recipe.extraFlour2Gr) > 0 && <p>{term("flour", recipe.extraFlour2 ?? "normal")}: {grams(recipe.extraFlour2Gr)}</p>}
            </div>
          )}
        </section>

        {hasPref && <section className="tech-card-section">
          <h2>{m.preferment}: {term("preferment", pref.type ?? "none")}</h2>
          <table className="tech-card-table"><thead><tr><th>{m.ingredient}</th><th>{m.qty}</th></tr></thead>
            <tbody>
              {row(m.flour, safe(pref.flour), "pref-flour")}
              {row(`${m.water} · ${term("liquid", recipe.liquidType ?? "water")}`, safe(pref.liquid), "pref-liquid")}
              {row(`${m.yeast} · ${term("yeast", recipe.yeastForm ?? "instant")}`, safe(pref.yeast), "pref-yeast")}
            </tbody>
            <tfoot><tr><th>{m.batch}</th><th className="tech-card-amount">{grams(pref.total)}</th></tr></tfoot>
          </table>
        </section>}

        {hasPref && <section className="tech-card-section">
          <h2>{m.mainMix}</h2>
          <p className="tech-card-note">{m.mixNote}</p>
          <table className="tech-card-table"><thead><tr><th>{m.ingredient}</th><th>{m.qty}</th></tr></thead>
            <tbody>{finalRows.filter(([, amount, key]) => amount > 0 || key === "flour").map(([label, amount, key]) => row(label, amount, "final-" + key))}</tbody>
          </table>
        </section>}

        {hasPref && processFatGr > 0 && <section className="tech-card-section">
          <h2>{m.spreadingStep}</h2>
          <table className="tech-card-table"><thead><tr><th>{m.ingredient}</th><th>{m.qty}</th></tr></thead>
            <tbody>
              {row(m.baseDoughWeight, safe(recipe.totalDough) - processFatGr, "base-dough-weight")}
              {row(spreadingLabel, processFatGr, "spread-fat")}
            </tbody>
          </table>
        </section>}

        <section className="tech-card-section">
          <h2>{m.process}</h2>
          {technicalProtocol && <div className="tech-card-operations" style={{ marginBottom: 16 }}>
            <h3>{lang === "ru" ? "Порядок технологических операций" : lang === "en" ? "Process sequence" : "Secuencia tecnológica"}</h3>
            {technicalProtocol.steps[lang].length > 0 && <ol>{technicalProtocol.steps[lang].map((step, idx) => <li key={idx}>{step}</li>)}</ol>}
            {technicalProtocol.finish && <p><strong>{technicalProtocol.finish[lang]}</strong></p>}
            <p className="tech-card-note">{technicalProtocol.warning[lang]}</p>
          </div>}
          <div className="tech-card-timeline">
            <h3>{timelineLabels.heading}</h3>
            <p className="tech-card-note">{editLabels.editable}</p>
            <table className="tech-card-table tech-card-editable-table">
              <thead><tr><th>{m.steps}</th><th>{m.minutes}</th><th>{m.conditions}</th></tr></thead>
              <tbody>
                {plannedTimeline.stages.map((stage) => {
                  const baseStage = productionTimeline.stages.find((entry) => entry.id === stage.id) ?? stage;
                  const defaultMinutes = stageDefaultMinutes(baseStage);
                  const fields = durationEdits[stage.id];
                  const hoursValue = fields?.hours ?? (defaultMinutes === null ? "" : String(Math.floor(defaultMinutes / 60)));
                  const minutesValue = fields?.minutes ?? (defaultMinutes === null ? "" : String(defaultMinutes % 60));
                  return (
                    <tr key={stage.id}>
                      <td><strong>{timelineLabels.stage[stage.id]}</strong>
                        {profile?.id === "choux" && stage.id === "mix" && (
                          <small className="tech-card-timeline-note">
                            {lang === "ru" ? "После охлаждения: вводить яйца постепенно до рабочей консистенции; указанный процент ориентировочный." : lang === "en" ? "After cooling, add eggs gradually until the correct piping consistency; the egg percentage is a guide." : "Tras enfriar, incorporar los huevos poco a poco hasta obtener la consistencia adecuada; el porcentaje es orientativo."}
                          </small>
                        )}
                        {profile?.id === "choux" && (stage.id === "panade" || stage.id === "cool") && (
                          <small className="tech-card-timeline-note">
                            {lang === "ru" ? "Оценка на партию: уточните по температуре и состоянию заварной массы." : lang === "en" ? "Batch estimate: adjust to the temperature and condition of the panade." : "Estimación por lote: ajustar según la temperatura y el estado de la panada."}
                          </small>
                        )}
                        {stage.id === "mix" && profile?.process?.mixingIntensity &&
                          <small className="tech-card-timeline-note">{m.mixingIntensity}: {profileText(profile.process.mixingIntensity)}</small>}
                        {/* MASAMASA_DONUT_FRYING_V1: oil temperature and per-side guide; NOT total-batch time */}
                        {stage.id === "fry" && profile?.frying && (
                          <small className="tech-card-timeline-note">
                            {lang === "ru" ? "Температура масла" : lang === "en" ? "Oil temperature" : "Temperatura del aceite"}: {profile.frying.oilTemperatureC} °C.
                            {" "}{lang === "ru" ? "На сторону" : lang === "en" ? "Per side" : "Por lado"}: {profile.frying.perSideMinutes.min}–{profile.frying.perSideMinutes.max} {lang === "ru" ? "мин" : "min"}.
                            {" "}{lang === "ru" ? "Общее время жарки партии зависит от числа загрузок; задайте его в полях операции." : lang === "en" ? "Total batch frying time depends on fryer loads; enter it in the stage duration fields." : "El tiempo total depende del número de tandas; introdúcelo en la duración de la etapa."}
                          </small>
                        )}
                        {stage.id === "proof" && profile?.process?.finalProofTarget &&
                          <small className="tech-card-timeline-note">{m.proofTarget}: {profileText(profile.process.finalProofTarget)}</small>}
                        {stage.note === "working_proof" && <small className="tech-card-timeline-note">{timelineLabels.working}</small>}
                        {stage.source === "profile" && baseStage.minMinutes !== null && baseStage.maxMinutes !== null && baseStage.minMinutes !== baseStage.maxMinutes &&
                          <small className="tech-card-timeline-note">{editLabels.profileRange}: {durationRange(baseStage.minMinutes, baseStage.maxMinutes)}</small>}
                        {profile?.id === "ensaimada" && ["rest", "stretch", "shape"].includes(stage.id) &&
                          <small className="tech-card-timeline-note">{editLabels.provisional}</small>}
                        {durationEdits[stage.id] && <small className="tech-card-timeline-note">{editLabels.edited}</small>}
                      </td>
                      <td className="tech-card-amount tech-card-edit-duration">
                        {stage.source === "profile" ? (
                          <div className="tech-card-duration-fields">
                            <label><span>{editLabels.hours}</span>
                              <input type="number" min="0" max="168" step="1" inputMode="numeric"
                                aria-label={`${timelineLabels.stage[stage.id]}: ${editLabels.hours}`}
                                value={hoursValue}
                                onChange={(event) => updateStageTime(stage.id, "hours", event.target.value)} />
                            </label>
                            <label><span>{editLabels.minutes}</span>
                              <input type="number" min="0" max="59" step="1" inputMode="numeric"
                                aria-label={`${timelineLabels.stage[stage.id]}: ${editLabels.minutes}`}
                                value={minutesValue}
                                onChange={(event) => updateStageTime(stage.id, "minutes", event.target.value)} />
                            </label>
                          </div>
                        ) : <small className="tech-card-setting-time">{editLabels.settings}</small>}
                        <span className="tech-card-duration-for-print">{durationRange(stage.minMinutes, stage.maxMinutes)}</span>
                      </td>
                      <td>{timelineLabels.source[stage.source]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="tech-card-timeline-totals">
              <p><strong>{plannedTimeline.unknownStageIds.length ? timelineLabels.earliest : timelineLabels.full}:</strong> {durationRange(plannedTimeline.knownMinMinutes, plannedTimeline.knownMaxMinutes)}{plannedTimeline.unknownStageIds.length ? "+" : ""}</p>
              <p>{timelineLabels.active}: {durationRange(plannedTimeline.activeMinMinutes, plannedTimeline.activeMaxMinutes)} · {timelineLabels.passive}: {durationRange(plannedTimeline.passiveMinMinutes, plannedTimeline.passiveMaxMinutes)} · {timelineLabels.thermal}: {durationRange(plannedTimeline.thermalMinMinutes, plannedTimeline.thermalMaxMinutes)}</p>
              {plannedTimeline.unknownStageIds.length > 0 && <p className="tech-card-note">{timelineLabels.omitted}</p>}
              {plannedTimeline.yeastModelNeedsReview && <p className="tech-card-note">{durationEdits.proof ? editLabels.proofWarning : timelineLabels.yeast}</p>}
            </div>
            <div className="tech-card-timeline-actions">
              <button type="button" onClick={() => { onStageEdit?.(); setDurationEdits({}); }}>{editLabels.reset}</button>
              <small>{saveLabels.hint}</small>
            </div>
          </div>
          {Array.isArray(schedule.bulk?.steps) && schedule.bulk.steps.length > 0 && (
            <div className="tech-card-operations"><h3>{m.steps}</h3><ol>
              {schedule.bulk.steps.map((step: any, i: number) => (
                <li key={i}>{number(step.timeFromStartMinutes)} {m.minutes} {m.fromStart}: <strong>{profileText(step.action)}</strong>{step.comment ? ` (${profileText(step.comment)})` : ""}</li>
              ))}
            </ol></div>
          )}
        </section>

        {Array.isArray(profile?.uiHints?.notesForBaker) && profile.uiHints.notesForBaker.length > 0 && (
          <section className="tech-card-section"><h2>{m.notes}</h2><ul className="tech-card-notes">{profile.uiHints.notesForBaker.map((note: string, i: number) => <li key={i}>{profileText(note)}</li>)}</ul></section>
        )}

        <footer className="tech-card-footer">{m.disclaimer}</footer>
      </article>
    </main>
  );
};

export default TechCard;
