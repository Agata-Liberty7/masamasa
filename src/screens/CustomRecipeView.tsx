import React from "react";

type Props = {
  name: string;
  recipe: any;
  profile: any;
  conditions: any;
  onBack: () => void;
};

const Table: React.FC<{ rows: { label: string; value: any }[] }> = ({ rows }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
    <tbody>
      {rows
        .filter((r) => r.value !== null && r.value !== undefined && r.value !== 0)
        .map((row, i) => (
          <tr key={i}>
            <td style={{ padding: "4px 0", width: "60%" }}>{row.label}</td>
            <td style={{ padding: "4px 0", fontWeight: 600 }}>{row.value}</td>
          </tr>
        ))}
    </tbody>
  </table>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginBottom: "32px" }}>
    <h2 style={{ marginBottom: "12px" }}>{title}</h2>
    {children}
  </section>
);

const CustomRecipeView: React.FC<Props> = ({
  name,
  recipe,
  conditions,
  onBack,
}) => {
  if (!recipe) {
    return (
      <div style={{ padding: 24 }}>
        <h1>{name}</h1>
        <p>Ошибка: рецепт повреждён или пуст.</p>
        <button onClick={onBack}>← Назад</button>
      </div>
    );
  }

  const preferment = recipe.preferment ?? {
    type: "none",
    flour: 0,
    liquid: 0,
    water: 0,
    yeast: 0,
    total: 0,
  };

  const eggText =
    recipe.eggsGr > 0
      ? `${recipe.eggsGr} г (${recipe.eggsPct}% от муки, ≈ ${recipe.approxEggCount} шт.)`
      : null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>{name}</h1>

      <Section title="Условия производства">
        <Table
          rows={[
            { label: "Климат", value: conditions?.climate },
            { label: "Замес", value: conditions?.mixing },
            { label: "Режим", value: conditions?.productionMode },
            {
              label: "Температура помещения",
              value:
                conditions?.roomTemp !== undefined
                  ? `${conditions.roomTemp}°C`
                  : null,
            },
            {
              label: "Тёплая ферментация",
              value:
                conditions?.warmFermentationHours !== undefined
                  ? `${conditions.warmFermentationHours} ч`
                  : null,
            },
            {
              label: "Холодная ферментация",
              value:
                conditions?.coldFermentationHours !== undefined
                  ? `${conditions.coldFermentationHours} ч`
                  : null,
            },
          ]}
        />
      </Section>

      {preferment.type !== "none" && preferment.flour > 0 && (
        <Section title={`Предфермент (${preferment.type})`}>
          <Table
            rows={[
              { label: "Мука", value: `${preferment.flour} г` },
              { label: "Жидкость", value: `${preferment.liquid} г` },
              { label: "Реальная вода", value: `${preferment.water} г` },
              { label: "Дрожжи", value: `${preferment.yeast} г` },
              { label: "Масса предфермента", value: `${preferment.total} г` },
            ]}
          />
        </Section>
      )}

      <Section title="Основной замес">
        <Table
          rows={[
            { label: "Мука", value: `${recipe.finalFlour ?? 0} г` },
            { label: "Жидкость", value: `${recipe.finalLiquid ?? 0} г` },
            { label: "Реальная вода", value: `${recipe.finalWater ?? 0} г` },
            { label: "Соль", value: `${recipe.salt ?? 0} г` },
            { label: "Сахар", value: `${recipe.sugar ?? 0} г` },
            { label: "Жиры", value: `${recipe.fat ?? 0} г` },
            { label: "Яйца", value: eggText },
            { label: "Дрожжи", value: `${recipe.finalYeast ?? 0} г` },
          ]}
        />
      </Section>

      <Section title="Итоговое тесто">
        <Table
          rows={[
            { label: "Общая мука", value: `${recipe.flour ?? 0} г` },
            { label: "Общая жидкость", value: `${recipe.liquid ?? 0} г` },
            { label: "Общая реальная вода", value: `${recipe.liquidWater ?? 0} г` },
            {
              label: "Основная жидкость",
              value: `${
                recipe.liquidPct ??
                recipe.hydration ??
                0
              }% от муки`,
            },
            {
              label: "Эффективная вода",
              value: `${
                recipe.effectiveWaterGr ??
                Math.round(
                  ((recipe.flour ?? 0) *
                    (recipe.effectiveWaterPct ??
                      recipe.trueHydration ??
                      0)) /
                    100
                )
              } г (${
                recipe.effectiveWaterPct ??
                recipe.trueHydration ??
                0
              }% от муки)`,
            },
            { label: "Масса основного замеса", value: `${recipe.finalDough ?? 0} г` },
            { label: "Итого тесто", value: `${recipe.totalDough ?? 0} г` },
          ]}
        />
      </Section>

      <div style={{ marginTop: "32px" }}>
        <button onClick={onBack}>← Назад</button>
      </div>
    </div>
  );
};

export default CustomRecipeView;
