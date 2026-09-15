import React from "react";
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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginBottom: "32px" }}>
    <h2 style={{ marginBottom: "12px" }}>{title}</h2>
    {children}
  </section>
);

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

const RecipeInput: React.FC<RecipeInputProps> = ({
  profileId,
  profile,
  initialValues,
  onBack,
  onCalculate,
}) => {
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

  const [hydration, setHydration] = React.useState(
    initialValues.hydration ?? base.hydration ?? 60
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
    initialValues.liquidType ?? "water"
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

    setHydration(initialValues.hydration ?? nextBase.hydration ?? 60);
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

    setLiquidType(initialValues.liquidType ?? "water");
    setFatType(initialValues.fatType ?? "butter");
    setEggType(initialValues.eggType ?? "whole");
    setSugarType(initialValues.sugarType ?? "white");
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
    const hydrationSafe = n(hydration, 0);
    const saltSafe = n(salt, 0);
    const sugarSafe = n(sugar, 0);
    const fatSafe = n(fat, 0);
    const eggsPctSafe = n(eggsPct, 0);
    const yeastPctSafe = n(yeastPct, 0);
    const targetDoughWeightSafe = n(targetDoughWeight, 0);

    let finalFlour = flourSafe;

    if (mode === "dough" && targetDoughWeightSafe > 0) {
      const water = (flourSafe * hydrationSafe) / 100;
      const saltGr = (flourSafe * saltSafe) / 100;
      const sugarGr = (flourSafe * sugarSafe) / 100;
      const fatGr = (flourSafe * fatSafe) / 100;
      const eggsGr = (flourSafe * eggsPctSafe) / 100;
      const yeastGr = (flourSafe * yeastPctSafe) / 100;

      const totalNow =
        flourSafe + water + saltGr + sugarGr + fatGr + eggsGr + yeastGr;

      if (totalNow > 0) {
        const ratio = targetDoughWeightSafe / totalNow;
        finalFlour = Math.round(flourSafe * ratio);
      }
    }

    onCalculate({
      mode,
      targetDoughWeight: targetDoughWeightSafe,

      flour: finalFlour,
      hydration: hydrationSafe,
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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <button onClick={onBack} style={{ marginBottom: "16px" }}>
        ← Назад
      </button>

      <h1 style={{ marginBottom: "24px" }}>Параметры теста: {profileId}</h1>

      <Section title="Режим расчёта">
        <div style={{ display: "flex", gap: "24px" }}>
          <label>
            <input
              type="radio"
              checked={mode === "flour"}
              onChange={() => setMode("flour")}
            />{" "}
            По муке
          </label>

          <label>
            <input
              type="radio"
              checked={mode === "dough"}
              onChange={() => setMode("dough")}
            />{" "}
            По весу теста
          </label>
        </div>
      </Section>

      <Section title="Вода и дрожжи">
        <NumberInput
          label="Гидратация (%)"
          value={hydration}
          onChange={setHydration}
        />

        <NumberInput
          label="Дрожжи (% от муки)"
          value={yeastPct}
          onChange={setYeastPct}
        />
      </Section>

      <Section title="Типы муки">
        <div style={{ display: "grid", gap: "16px" }}>
          <label>
            Основная мука:
            <select
              value={mainFlour}
              onChange={(e) => setMainFlour(e.target.value as FlourType)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {FLOUR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Дополнительная мука 1:
            <select
              value={extraFlour1}
              onChange={(e) => setExtraFlour1(e.target.value as FlourType)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {FLOUR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <NumberInput
            label="Процент доп. муки 1 (% от общей муки)"
            value={extraPct1}
            onChange={setExtraPct1}
          />

          <label>
            Дополнительная мука 2:
            <select
              value={extraFlour2}
              onChange={(e) => setExtraFlour2(e.target.value as FlourType)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {FLOUR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <NumberInput
            label="Процент доп. муки 2 (% от общей муки)"
            value={extraPct2}
            onChange={setExtraPct2}
          />
        </div>
      </Section>

      <Section title="Основные ингредиенты">
        <div style={{ display: "grid", gap: "16px" }}>
          {mode === "flour" ? (
            <NumberInput label="Мука (г)" value={flour} onChange={setFlour} />
          ) : (
            <NumberInput
              label="Целевой вес теста (г)"
              value={targetDoughWeight}
              onChange={setTargetDoughWeight}
            />
          )}

          <NumberInput label="Соль (% от муки)" value={salt} onChange={setSalt} />
          <NumberInput label="Сахар (% от муки)" value={sugar} onChange={setSugar} />
          <NumberInput label="Жиры (% от муки)" value={fat} onChange={setFat} />
          <NumberInput label="Яйца (% от муки)" value={eggsPct} onChange={setEggsPct} />
        </div>
      </Section>

      <Section title="Типы ингредиентов">
        <div style={{ display: "grid", gap: "16px" }}>
          <label>
            Жидкость:
            <select
              value={liquidType}
              onChange={(e) => setLiquidType(e.target.value as LiquidType)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {LIQUID_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Жир:
            <select
              value={fatType}
              onChange={(e) => setFatType(e.target.value as FatType)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {FAT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Тип яйца:
            <select
              value={eggType}
              onChange={(e) => setEggType(e.target.value as EggType)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {EGG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Тип сахара:
            <select
              value={sugarType}
              onChange={(e) => setSugarType(e.target.value as SugarType)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {SUGAR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Тип дрожжей:
            <select
              value={yeastForm}
              onChange={(e) => setYeastForm(e.target.value as YeastForm)}
              style={{ marginLeft: "8px", padding: "6px" }}
            >
              {YEAST_FORMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      <Section title="Предфермент">
        <label style={{ display: "block", marginBottom: "12px" }}>
          Тип:
          <select
            value={prefermentType}
            onChange={(e) =>
              setPrefermentType(e.target.value as PrefermentType)
            }
            style={{ marginLeft: "8px", padding: "6px" }}
          >
            <option value="none">Без предфермента</option>
            <option value="poolish">Пулеш</option>
            <option value="biga">Бига</option>
            <option value="levain">Левен</option>
            <option value="yeasted_sponge">Спонж (дрожжевой)</option>
            <option value="enriched">Обогащённый предфермент</option>
          </select>
        </label>

        {prefermentType !== "none" && (
          <div style={{ display: "grid", gap: "16px" }}>
            <NumberInput
              label="Мука в предферменте (% от общей муки)"
              value={prefermentFlourPct}
              onChange={setPrefermentFlourPct}
            />

            <NumberInput
              label="Гидратация предфермента (%)"
              value={prefermentHydrationPct}
              onChange={setPrefermentHydrationPct}
            />

            <NumberInput
              label="Дрожжи в предферменте (% от общей нормы)"
              value={prefermentYeastPct}
              onChange={setPrefermentYeastPct}
            />
          </div>
        )}
      </Section>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "16px",
          padding: "12px 16px",
          borderRadius: "6px",
          border: "1px solid #000",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Рассчитать рецепт
      </button>
    </div>
  );
};

export default RecipeInput;