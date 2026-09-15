import React from "react";

type RecipeOutputProps = {
  profileId: string;
  profile: any;
  data: any;

  onBack: () => void;
  onRestart: () => void;
  onShowTechCard: (recipe: any) => void;
  onSaveAsCustom: (calculatedRecipe: any) => void;
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

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
    <span>{label}</span>
    <strong style={{ textAlign: "right" }}>{value}</strong>
  </div>
);

const safeNum = (v: any) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};

const safeText = (v: any, fallback = "—") => {
  if (v === undefined || v === null || v === "") return fallback;
  return String(v);
};

const formatGr = (v: any) => `${safeNum(v)} г`;
const formatPct = (v: any) => `${safeNum(v)}%`;

const prettify = (value: string, group?: "liquid" | "fat" | "egg" | "sugar" | "yeast" | "preferment" | "flour") => {
  const liquidNames: Record<string, string> = {
    water: "вода",
    milk: "молоко",
    kefir: "кефир",
    whey: "сыворотка",
    plant_milk: "растительное молоко",
  };

  const fatNames: Record<string, string> = {
    butter: "сливочное масло",
    oil: "растительное масло",
    ghee: "топлёное масло",
    margarine: "маргарин",
  };

  const eggNames: Record<string, string> = {
    whole: "целое яйцо",
    yolk: "желток",
    white: "белок",
    powder: "яичный порошок",
  };

  const sugarNames: Record<string, string> = {
    white: "белый сахар",
    brown: "коричневый сахар",
    panela: "панела",
  };

  const yeastNames: Record<string, string> = {
    instant: "инстантные",
    fresh: "свежие",
    active: "активные",
  };

  const prefermentNames: Record<string, string> = {
    none: "без предфермента",
    poolish: "пулиш",
    biga: "бига",
    levain: "левен",
    yeasted_sponge: "дрожжевой спонж",
    enriched: "обогащённый предфермент",
  };

  const flourNames: Record<string, string> = {
    normal: "обычная",
    strong: "сильная",
    integral: "цельнозерновая",
    rye: "ржаная",
    buckwheat: "гречневая",
    corn: "кукурузная",
    rice: "рисовая",
    oat: "овсяная",
    flax: "льняная",
  };

  if (group === "liquid") return liquidNames[value] ?? value;
  if (group === "fat") return fatNames[value] ?? value;
  if (group === "egg") return eggNames[value] ?? value;
  if (group === "sugar") return sugarNames[value] ?? value;
  if (group === "yeast") return yeastNames[value] ?? value;
  if (group === "preferment") return prefermentNames[value] ?? value;
  if (group === "flour") return flourNames[value] ?? value;

  return value;
};

const RecipeOutput: React.FC<RecipeOutputProps> = ({
  profileId,
  profile,
  data,
  onBack,
  onRestart,
  onShowTechCard,
  onSaveAsCustom,
}) => {
  const flour = safeNum(data?.flour);
  const liquid = safeNum(data?.liquid);
  const liquidWater = safeNum(data?.liquidWater);
  const liquidType = safeText(data?.liquidType);

  const salt = safeNum(data?.salt);
  const sugar = safeNum(data?.sugar);
  const fat = safeNum(data?.fat);
  const eggsPct = safeNum(data?.eggsPct);
  const eggsGr = safeNum(data?.eggsGr);
  const approxEggCount = safeNum(data?.approxEggCount);
  const yeast = safeNum(data?.yeast);

  const hydration = safeNum(data?.hydration);
  const trueHydration = safeNum(data?.trueHydration);

  const mainFlour = safeText(data?.mainFlour, "normal");
  const extraFlour1 = safeText(data?.extraFlour1, "normal");
  const extraPct1 = safeNum(data?.extraPct1);
  const extraFlour2 = safeText(data?.extraFlour2, "normal");
  const extraPct2 = safeNum(data?.extraPct2);

  const mainFlourGr = safeNum(data?.mainFlourGr);
  const extraFlour1Gr = safeNum(data?.extraFlour1Gr);
  const extraFlour2Gr = safeNum(data?.extraFlour2Gr);

  const fatType = safeText(data?.fatType);
  const eggType = safeText(data?.eggType);
  const sugarType = safeText(data?.sugarType);
  const yeastForm = safeText(data?.yeastForm);

  const preferment = data?.preferment ?? {
    type: "none",
    flour: 0,
    liquid: 0,
    water: 0,
    yeast: 0,
    total: 0,
  };

  const finalFlour = safeNum(data?.finalFlour);
  const finalLiquid = safeNum(data?.finalLiquid);
  const finalWater = safeNum(data?.finalWater);
  const finalYeast = safeNum(data?.finalYeast);

  const finalDough = safeNum(data?.finalDough);
  const totalDough = safeNum(data?.totalDough);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <button onClick={onBack} style={{ marginBottom: "16px" }}>
        ← Назад
      </button>

      <h1 style={{ marginBottom: "8px" }}>Итоговый рецепт</h1>
      <div style={{ marginBottom: "24px", opacity: 0.75 }}>
        Профиль: {profile?.name ?? profileId}
      </div>

      <Section title="Состав муки">
        <Row
          label="Основная мука"
          value={`${mainFlourGr} г (${prettify(mainFlour, "flour")})`}
        />
        <Row
          label="Дополнительная мука 1"
          value={
            extraPct1 > 0
              ? `${extraFlour1Gr} г (${prettify(extraFlour1, "flour")}), ${extraPct1}%`
              : "—"
          }
        />
        <Row
          label="Дополнительная мука 2"
          value={
            extraPct2 > 0
              ? `${extraFlour2Gr} г (${prettify(extraFlour2, "flour")}), ${extraPct2}%`
              : "—"
          }
        />
        <Row label="Общая мука" value={formatGr(flour)} />
      </Section>

      <Section title="Типы ингредиентов">
        <Row label="Жидкость" value={prettify(liquidType, "liquid")} />
        <Row label="Жир" value={prettify(fatType, "fat")} />
        <Row label="Тип яйца" value={prettify(eggType, "egg")} />
        <Row label="Тип сахара" value={prettify(sugarType, "sugar")} />
        <Row label="Тип дрожжей" value={prettify(yeastForm, "yeast")} />
      </Section>

      <Section title="Предфермент">
        <Row label="Тип" value={prettify(safeText(preferment.type, "none"), "preferment")} />
        <Row label="Мука" value={formatGr(preferment.flour)} />
        <Row label="Жидкость" value={`${finalLiquid} г (${prettify(liquidType, "liquid")})`} />
        <Row label="Реальная вода" value={formatGr(preferment.water)} />
        <Row label="Дрожжи" value={formatGr(preferment.yeast)} />
        <Row label="Масса предфермента" value={formatGr(preferment.total)} />
      </Section>

      <Section title="Основной замес">
        <Row label="Мука" value={formatGr(finalFlour)} />
        <Row label="Жидкость" value={`${finalLiquid} г (${prettify(liquidType)})`} />
        <Row label="Реальная вода" value={formatGr(finalWater)} />
        <Row label="Соль" value={formatGr(salt)} />
        <Row label="Сахар" value={formatGr(sugar)} />
        <Row label="Жиры" value={formatGr(fat)} />
        <Row
          label="Яйца"
          value={
            eggType === "none" || eggsGr <= 0
              ? "—"
              : `${eggsGr} г (${eggsPct}% от муки, ≈ ${approxEggCount} шт., ${prettify(eggType, "egg")})`
          }
        />
        <Row label="Дрожжи" value={formatGr(finalYeast)} />
      </Section>

      <Section title="Итоговое тесто">
        <Row label="Общая мука" value={formatGr(flour)} />
        <Row label="Общая жидкость" value={`${liquid} г (${prettify(liquidType, "liquid")})`} />
        <Row label="Общая реальная вода" value={formatGr(liquidWater)} />
        <Row label="Дрожжи всего" value={formatGr(yeast)} />
        <Row label="Заданная гидратация" value={formatPct(hydration)} />
        <Row label="Истинная гидратация" value={formatPct(trueHydration)} />
        <Row label="Масса основного замеса" value={formatGr(finalDough)} />
        <Row label="Итого тесто" value={formatGr(totalDough)} />
      </Section>

      <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
        <button onClick={() => onShowTechCard(data)}>Техкарта</button>
        <button onClick={() => onSaveAsCustom(data)}>Сохранить как рецепт</button>
        <button onClick={onRestart}>Начать заново</button>
      </div>
    </div>
  );
};

export default RecipeOutput;