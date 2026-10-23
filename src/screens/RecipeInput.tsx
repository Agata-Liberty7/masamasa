import React from "react";
import { useTranslation } from "react-i18next";
import "./RecipeInput.css";
import NumberInput from "../components/NumberInput";
import type { PrefermentType } from "../logic/preferment";

import type {
  FlourType,
  LiquidType,
  FatType,
  EggType,
  SugarType,
  YeastForm,
} from "../logic/fermentationModel";

type RecipeInputProps = {
  profileId: string;
  profile: any;
  initialValues: any;
  onBack: () => void;
  onCalculate: (data: any) => void;
};

const FLOUR_TYPES: FlourType[] = [
  "normal",
  "strong",
  "integral",
  "rye",
  "buckwheat",
  "corn",
  "rice",
  "oat",
  "flax",
];

const LIQUID_TYPES: LiquidType[] = [
  "water",
  "milk",
  "kefir",
  "whey",
  "plant_milk",
];

const FAT_TYPES: FatType[] = ["butter", "oil", "ghee", "margarine"];
const EGG_TYPES: EggType[] = ["whole", "yolk", "white", "powder"];
const SUGAR_TYPES: SugarType[] = ["white", "brown", "panela"];
const YEAST_FORMS: YeastForm[] = ["instant", "fresh"];

const n = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};


const IngredientIcon = ({
  name,
}: {
  name: string;
}) => (
  <img
    className="ingredient-icon"
    src={`/images/ingredients/${name}.png`}
    alt=""
    aria-hidden="true"
  />
);

const RecipeInput: React.FC<RecipeInputProps> = ({
  profileId,
  profile,
  initialValues,
  onBack,
  onCalculate,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("es") ? "es" : i18n.language.startsWith("en") ? "en" : "ru";
  const yeastHelp = {
    ru: "Процент дрожжей указан для выбранного вида. При переключении свежие/мгновенные количество автоматически пересчитывается (1:3). Вы можете изменить его вручную.",
    en: "Yeast percentage applies to the selected type. Switching fresh/instant converts the amount automatically (3:1). You can edit it manually.",
    es: "El porcentaje corresponde al tipo de levadura elegido. Al cambiar entre fresca e instantánea se convierte automáticamente (3:1). Puedes editarlo manualmente.",
  }[lang];

  const base = profile?.base ?? {};
  const pref = profile?.preferment ?? {};

  const [mode, setMode] = React.useState<"flour" | "dough">(
    initialValues.mode ?? "flour"
  );

  const [flour, setFlour] = React.useState(
    initialValues.flour ?? base.flour ?? 1000
  );

  const [targetDoughWeight, setTargetDoughWeight] = React.useState(
    initialValues.targetDoughWeight ?? 0
  );

  const [liquidPct, setLiquidPct] = React.useState(
    initialValues.liquidPct ??
      initialValues.hydration ??
      base.liquidPct ??
      base.hydration ??
      0
  );

  const [salt, setSalt] = React.useState(
    initialValues.salt ?? base.salt ?? 2
  );

  const [sugar, setSugar] = React.useState(
    initialValues.sugar ?? base.sugar ?? 0
  );

  const [fat, setFat] = React.useState(
    initialValues.fat ?? base.fat ?? 0
  );

  const [eggsPct, setEggsPct] = React.useState(
    initialValues.eggsPct ?? base.eggs ?? 0
  );

  const [yeastPct, setYeastPct] = React.useState(
    initialValues.yeastPct ?? base.yeast?.percent ?? 1
  );

  const [mainFlour, setMainFlour] = React.useState<FlourType>(
    initialValues.mainFlour ?? "normal"
  );

  const [extraFlour1, setExtraFlour1] = React.useState<FlourType>(
    initialValues.extraFlour1 ?? "normal"
  );

  const [extraPct1, setExtraPct1] = React.useState(
    initialValues.extraPct1 ?? 0
  );

  const [extraFlour2, setExtraFlour2] = React.useState<FlourType>(
    initialValues.extraFlour2 ?? "normal"
  );

  const [extraPct2, setExtraPct2] = React.useState(
    initialValues.extraPct2 ?? 0
  );

  const [liquidType, setLiquidType] = React.useState<LiquidType>(
    initialValues.liquidType ?? base.liquidType ?? "water"
  );

  const [fatType, setFatType] = React.useState<FatType>(
    initialValues.fatType ?? "butter"
  );

  const [eggType, setEggType] = React.useState<EggType>(
    initialValues.eggType ?? "whole"
  );

  const [sugarType, setSugarType] = React.useState<SugarType>(
    initialValues.sugarType ?? "white"
  );

  const [yeastForm, setYeastForm] = React.useState<YeastForm>(
    initialValues.yeastForm ?? base.yeast?.type ?? "instant"
  );

  const [prefermentType, setPrefermentType] = React.useState<PrefermentType>(
    initialValues.prefermentType ??
      pref.type ??
      profile?.prefermentId ??
      "none"
  );

  const [prefermentFlourPct, setPrefermentFlourPct] = React.useState(
    initialValues.prefermentFlourPct ?? pref.percentOfFlour ?? 0
  );

  const [prefermentHydrationPct, setPrefermentHydrationPct] = React.useState(
    initialValues.prefermentHydrationPct ?? pref.hydration ?? 100
  );

  const [prefermentYeastPct, setPrefermentYeastPct] = React.useState(
    initialValues.prefermentYeastPct ?? pref.yeastPercentInPreferment ?? 0
  );

  React.useEffect(() => {
    const nextBase = profile?.base ?? {};
    const nextPref = profile?.preferment ?? {};

    setMode(initialValues.mode ?? "flour");

    setFlour(initialValues.flour ?? nextBase.flour ?? 1000);
    setTargetDoughWeight(initialValues.targetDoughWeight ?? 0);

    setLiquidPct(
      initialValues.liquidPct ??
        initialValues.hydration ??
        nextBase.liquidPct ??
        nextBase.hydration ??
        0
    );
    setSalt(initialValues.salt ?? nextBase.salt ?? 2);
    setSugar(initialValues.sugar ?? nextBase.sugar ?? 0);
    setFat(initialValues.fat ?? nextBase.fat ?? 0);
    setEggsPct(initialValues.eggsPct ?? nextBase.eggs ?? 0);
    setYeastPct(initialValues.yeastPct ?? nextBase.yeast?.percent ?? 1);

    setMainFlour(initialValues.mainFlour ?? "normal");
    setExtraFlour1(initialValues.extraFlour1 ?? "normal");
    setExtraPct1(initialValues.extraPct1 ?? 0);
    setExtraFlour2(initialValues.extraFlour2 ?? "normal");
    setExtraPct2(initialValues.extraPct2 ?? 0);

    setLiquidType(
      initialValues.liquidType ?? nextBase.liquidType ?? "water"
    );
    setFatType(
      initialValues.fatType ?? nextBase.fatType ?? "butter"
    );
    setEggType(
      initialValues.eggType ?? nextBase.eggType ?? "whole"
    );
    setSugarType(
      initialValues.sugarType ?? nextBase.sugarType ?? "white"
    );
    setYeastForm(initialValues.yeastForm ?? nextBase.yeast?.type ?? "instant");

    setPrefermentType(
      initialValues.prefermentType ??
        nextPref.type ??
        profile?.prefermentId ??
        "none"
    );
    setPrefermentFlourPct(
      initialValues.prefermentFlourPct ?? nextPref.percentOfFlour ?? 0
    );
    setPrefermentHydrationPct(
      initialValues.prefermentHydrationPct ?? nextPref.hydration ?? 100
    );
    setPrefermentYeastPct(
      initialValues.prefermentYeastPct ??
        nextPref.yeastPercentInPreferment ??
        0
    );
  }, [initialValues, profile]);

  React.useEffect(() => {
    const total = n(extraPct1, 0) + n(extraPct2, 0);
    if (total <= 100) return;

    const k = 100 / total;
    setExtraPct1(Math.round(n(extraPct1, 0) * k));
    setExtraPct2(Math.round(n(extraPct2, 0) * k));
  }, [extraPct1, extraPct2]);

  const handleSubmit = () => {
    const flourSafe = n(flour, 0);
    const liquidPctSafe = n(liquidPct, 0);
    const saltSafe = n(salt, 0);
    const sugarSafe = n(sugar, 0);
    const fatSafe = n(fat, 0);
    const eggsPctSafe = n(eggsPct, 0);
    const yeastPctSafe = n(yeastPct, 0);
    const targetDoughWeightSafe = n(targetDoughWeight, 0);

    let finalFlour = flourSafe;

    if (mode === "dough" && targetDoughWeightSafe > 0) {
      const liquidPercent = liquidPctSafe;

      const liquidGr = (flourSafe * liquidPercent) / 100;
      const saltGr = (flourSafe * saltSafe) / 100;
      const sugarGr = (flourSafe * sugarSafe) / 100;
      const fatGr = (flourSafe * fatSafe) / 100;
      const eggsGr = (flourSafe * eggsPctSafe) / 100;
      const yeastGr = (flourSafe * yeastPctSafe) / 100;

      const totalNow =
        flourSafe +
        liquidGr +
        saltGr +
        sugarGr +
        fatGr +
        eggsGr +
        yeastGr;

      if (totalNow > 0) {
        const ratio = targetDoughWeightSafe / totalNow;
        finalFlour = Math.round(flourSafe * ratio);
      }
    }

    // Validate the allocation before calculating, without silently
    // changing the requested hydration or preferment percentage.
    if (prefermentType !== "none" && n(prefermentFlourPct, 0) > 0) {
      const pFlourPct = n(prefermentFlourPct, 0);
      const pHydration = n(prefermentHydrationPct, 100);
      const pYeastPct = n(prefermentYeastPct, 0);
      const pFlour = Math.round((finalFlour * pFlourPct) / 100);
      const pLiquid = Math.round((pFlour * pHydration) / 100);
      const pYeast = (pFlour * pYeastPct) / 100;
      const totalLiquid = Math.round((finalFlour * liquidPctSafe) / 100);
      const totalYeast = (finalFlour * yeastPctSafe) / 100;

      if (
        pFlourPct > 100 ||
        pHydration < 0 || pYeastPct < 0 ||
        pLiquid > totalLiquid || pYeast > totalYeast + 0.0001
      ) {
        window.alert(t("recipeInput.prefermentInvalid"));
        return;
      }
    }

    onCalculate({
      mode,
      targetDoughWeight: targetDoughWeightSafe,

      flour: finalFlour,

      // Единая модель основной жидкости.
      liquidPct: liquidPctSafe,

      salt: saltSafe,
      sugar: sugarSafe,
      fat: fatSafe,
      eggsPct: eggsPctSafe,
      yeastPct: yeastPctSafe,

      mainFlour,
      extraFlour1,
      extraPct1: n(extraPct1, 0),
      extraFlour2,
      extraPct2: n(extraPct2, 0),

      liquidType,
      fatType,
      eggType,
      sugarType,
      yeastForm,

      prefermentType,
      prefermentFlourPct: n(prefermentFlourPct, 0),
      prefermentHydrationPct: n(prefermentHydrationPct, 100),
      prefermentYeastPct: n(prefermentYeastPct, 0),
    });
  };

  return (
    <div className="recipe-input-page">
      <div className="recipe-input-shell">
        <button onClick={onBack} className="recipe-back">
          {t("common.back")}
        </button>

        <div className="recipe-language">
          <button
            type="button"
            className={i18n.language.startsWith("ru") ? "active" : ""}
            onClick={() => i18n.changeLanguage("ru")}
          >
            RU
          </button>

          <button
            type="button"
            className={i18n.language.startsWith("en") ? "active" : ""}
            onClick={() => i18n.changeLanguage("en")}
          >
            EN
          </button>

          <button
            type="button"
            className={i18n.language.startsWith("es") ? "active" : ""}
            onClick={() => i18n.changeLanguage("es")}
          >
            ES
          </button>
        </div>

        <header className="recipe-header">
          {profileId === "brioche" && (
            <img
              className="recipe-photo"
              src="/images/recipes/brioche.png"
              alt=""
              aria-hidden="true"
            />
          )}
          <h1 className="recipe-title">
            {t(`profiles.${profileId}`, {
              defaultValue: profile?.name ?? profileId,
            })}
          </h1>
          <p className="recipe-subtitle">
            {t("recipeInput.subtitle")}
          </p>
        </header>

        <section className="recipe-card">
          <h2 className="recipe-card-title">{t("recipeInput.calculation")}</h2>

          <div className="recipe-mode">
            <button
              type="button"
              className={mode === "flour" ? "active" : ""}
              onClick={() => setMode("flour")}
            >
              {t("recipeInput.byFlour")}
            </button>

            <button
              type="button"
              className={mode === "dough" ? "active" : ""}
              onClick={() => setMode("dough")}
            >
              {t("recipeInput.byDough")}
            </button>
          </div>

          {mode === "flour" ? (
            <div className="recipe-row simple">
              <span className="recipe-label">{t("recipeInput.flourAmount")}</span>
              <div className="recipe-percent-wrap">
                <input
                  className="recipe-number"
                  type="number"
                  value={flour}
                  onChange={(e) => setFlour(e.target.value)}
                />
                <span className="recipe-unit">{t("units.g")}</span>
              </div>
            </div>
          ) : (
            <div className="recipe-row simple">
              <span className="recipe-label">{t("recipeInput.doughWeight")}</span>
              <div className="recipe-percent-wrap">
                <input
                  className="recipe-number"
                  type="number"
                  value={targetDoughWeight}
                  onChange={(e) => setTargetDoughWeight(e.target.value)}
                />
                <span className="recipe-unit">{t("units.g")}</span>
              </div>
            </div>
          )}
        </section>

        <section className="recipe-card">
          <h2 className="recipe-card-title">{t("recipeInput.composition")}</h2>

            <div className="recipe-row">
              <span className="recipe-label">{liquidType === "milk" ? <IngredientIcon name="milk" /> : <IngredientIcon name="water" />}{t("recipeInput.primaryLiquid")}</span>
              <select
                className="recipe-select"
                value={liquidType}
                onChange={(e) =>
                  setLiquidType(e.target.value as LiquidType)
                }
              >
                {LIQUID_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`ingredients.liquid.${type}`)}
                  </option>
                ))}
              </select>

              <div className="recipe-percent-wrap">
                <input
                  className="recipe-number"
                  type="number"
                  value={liquidPct}
                  onChange={(e) => setLiquidPct(e.target.value)}
                />
                <span className="recipe-unit">%</span>
              </div>
            </div>


          <div className="recipe-row">
            <span className="recipe-label"><IngredientIcon name="egg" />{t("recipeInput.eggs")}</span>
            <select
              className="recipe-select"
              value={eggType}
              onChange={(e) =>
                setEggType(e.target.value as EggType)
              }
            >
              {EGG_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`ingredients.egg.${type}`)}
                </option>
              ))}
            </select>

            <div className="recipe-percent-wrap">
              <input
                className="recipe-number"
                type="number"
                value={eggsPct}
                onChange={(e) => setEggsPct(e.target.value)}
              />
              <span className="recipe-unit">%</span>
            </div>
          </div>

          <div className="recipe-row">
            <span className="recipe-label">{fatType === "oil" ? <IngredientIcon name="oil" /> : <IngredientIcon name="butter" />}{t("recipeInput.fat")}</span>
            <select
              className="recipe-select"
              value={fatType}
              onChange={(e) =>
                setFatType(e.target.value as FatType)
              }
            >
              {FAT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`ingredients.fat.${type}`)}
                </option>
              ))}
            </select>

            <div className="recipe-percent-wrap">
              <input
                className="recipe-number"
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
              <span className="recipe-unit">%</span>
            </div>
          </div>

          <div className="recipe-row">
            <span className="recipe-label"><IngredientIcon name="sugar" />{t("recipeInput.sugar")}</span>
            <select
              className="recipe-select"
              value={sugarType}
              onChange={(e) =>
                setSugarType(e.target.value as SugarType)
              }
            >
              {SUGAR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`ingredients.sugar.${type}`)}
                </option>
              ))}
            </select>

            <div className="recipe-percent-wrap">
              <input
                className="recipe-number"
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
              />
              <span className="recipe-unit">%</span>
            </div>
          </div>

          <div className="recipe-row simple">
            <span className="recipe-label"><IngredientIcon name="salt" />{t("recipeInput.salt")}</span>
            <div className="recipe-percent-wrap">
              <input
                className="recipe-number"
                type="number"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
              />
              <span className="recipe-unit">%</span>
            </div>
          </div>

          <div className="recipe-row">
            <span className="recipe-label"><IngredientIcon name="yeast" />{t("recipeInput.yeast")}</span>
            <select
              className="recipe-select"
              value={yeastForm}
                onChange={(e) => {
                  const nextForm = e.target.value as YeastForm;
                  if (nextForm !== yeastForm) {
                    setYeastPct((previous: number | string) => {
                      const value = n(previous, 0);
                      return Math.round((value * (nextForm === "fresh" ? 3 : 1 / 3)) * 10000) / 10000;
                    });
                    setYeastForm(nextForm);
                  }
                }}
            >
              {YEAST_FORMS.map((type) => (
                <option key={type} value={type}>
                  {t(`ingredients.yeast.${type}`)}
                </option>
              ))}
            </select>

            <div className="recipe-percent-wrap">
              <input
                className="recipe-number"
                type="number"
                value={yeastPct}
                onChange={(e) => setYeastPct(e.target.value)}
              />
              <span className="recipe-unit">%</span>
            </div>
          </div>
          <p style={{ fontSize: "0.82rem", opacity: 0.75, margin: "8px 0 0" }}>{yeastHelp}</p>
        </section>

        <section className="recipe-card">
          <h2 className="recipe-card-title">{t("recipeInput.flourSection")}</h2>

          <div className="recipe-row simple">
            <span className="recipe-label"><IngredientIcon name="flour" />{t("recipeInput.mainFlour")}</span>
            <select
              className="recipe-select recipe-flour-select"
              value={mainFlour}
              onChange={(e) =>
                setMainFlour(e.target.value as FlourType)
              }
            >
              {FLOUR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`ingredients.flour.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {n(extraPct1, 0) > 0 && (
            <div className="recipe-row">
              <span className="recipe-label">{t("recipeInput.extraFlour")}</span>
              <select
                className="recipe-select"
                value={extraFlour1}
                onChange={(e) =>
                  setExtraFlour1(e.target.value as FlourType)
                }
              >
                {FLOUR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`ingredients.flour.${type}`)}
                  </option>
                ))}
              </select>

              <div className="recipe-percent-wrap">
                <input
                  className="recipe-number"
                  type="number"
                  value={extraPct1}
                  onChange={(e) => setExtraPct1(e.target.value)}
                />
                <span className="recipe-unit">%</span>
              </div>
            </div>
          )}

          {n(extraPct2, 0) > 0 && (
            <div className="recipe-row">
              <span className="recipe-label">{t("recipeInput.extraFlour2")}</span>
              <select
                className="recipe-select"
                value={extraFlour2}
                onChange={(e) =>
                  setExtraFlour2(e.target.value as FlourType)
                }
              >
                {FLOUR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`ingredients.flour.${type}`)}
                  </option>
                ))}
              </select>

              <div className="recipe-percent-wrap">
                <input
                  className="recipe-number"
                  type="number"
                  value={extraPct2}
                  onChange={(e) => setExtraPct2(e.target.value)}
                />
                <span className="recipe-unit">%</span>
              </div>
            </div>
          )}

          {n(extraPct1, 0) === 0 && (
            <button
              type="button"
              className="recipe-add"
              onClick={() => setExtraPct1(10)}
            >
              + {t("recipeInput.addFlour")}
            </button>
          )}

          {n(extraPct1, 0) > 0 && n(extraPct2, 0) === 0 && (
            <button
              type="button"
              className="recipe-add"
              onClick={() => setExtraPct2(10)}
            >
              + {t("recipeInput.addAnotherFlour")}
            </button>
          )}
        </section>

        <section className="recipe-card">
          <h2 className="recipe-card-title">{t("recipeInput.preferment")}</h2>

          <select
            className="recipe-select"
            value={prefermentType}
            onChange={(e) =>
              setPrefermentType(e.target.value as PrefermentType)
            }
          >
            <option value="none">{t("ingredients.preferment.none")}</option>
            <option value="poolish">{t("ingredients.preferment.poolish")}</option>
            <option value="biga">{t("ingredients.preferment.biga")}</option>
            <option value="levain">{t("ingredients.preferment.levain")}</option>
            <option value="yeasted_sponge">{t("ingredients.preferment.yeasted_sponge")}</option>
            <option value="enriched">{t("ingredients.preferment.enriched")}</option>
          </select>

          {prefermentType !== "none" && (
            <div className="recipe-preferment-details">
              <NumberInput
                label={t("input.prefermentFlourPct")}
                value={prefermentFlourPct}
                onChange={setPrefermentFlourPct}
              />

              <NumberInput
                label={t("input.prefermentHydration")}
                value={prefermentHydrationPct}
                onChange={setPrefermentHydrationPct}
              />

              <NumberInput
                label={t("input.prefermentYeastPct")}
                value={prefermentYeastPct}
                onChange={setPrefermentYeastPct}
              />
            </div>
          )}
        </section>

        <button
          type="button"
          className="recipe-submit"
          onClick={handleSubmit}
        >
          {t("common.calculate")}
        </button>
      </div>
    </div>
  );
};

export default RecipeInput;