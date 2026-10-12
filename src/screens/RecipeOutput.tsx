import React from "react";
import { useTranslation } from "react-i18next";
import "./RecipeOutput.css";

type RecipeOutputProps = {
  profileId: string;
  profile: any;
  data: any;

  onBack: () => void;
  onRestart: () => void;
  onShowTechCard: (recipe: any) => void;
  onSaveAsCustom: (calculatedRecipe: any) => void;
};

const safeNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const safeText = (value: any, fallback = "none") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
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
  const { t, i18n } = useTranslation();

  const flour = safeNum(data?.flour);

  const liquid = safeNum(data?.liquid);
  const liquidType = safeText(data?.liquidType, "water");

  const salt = safeNum(data?.salt);
  const sugar = safeNum(data?.sugar);
  const fat = safeNum(data?.fat);

  const eggsPct = safeNum(data?.eggsPct);
  const eggsGr = safeNum(data?.eggsGr);
  const approxEggCount = safeNum(data?.approxEggCount);

  const yeast = safeNum(data?.yeast);

  const liquidPct = safeNum(
    data?.liquidPct ?? data?.hydration
  );

  const effectiveWaterPct = safeNum(
    data?.effectiveWaterPct ?? data?.trueHydration
  );

  const effectiveWaterGr = safeNum(
    data?.effectiveWaterGr ??
      (flour > 0
        ? (flour * effectiveWaterPct) / 100
        : 0)
  );

  const mainFlour = safeText(data?.mainFlour, "normal");
  const extraFlour1 = safeText(data?.extraFlour1, "normal");
  const extraPct1 = safeNum(data?.extraPct1);
  const extraFlour2 = safeText(data?.extraFlour2, "normal");
  const extraPct2 = safeNum(data?.extraPct2);

  const mainFlourGr = safeNum(data?.mainFlourGr);
  const extraFlour1Gr = safeNum(data?.extraFlour1Gr);
  const extraFlour2Gr = safeNum(data?.extraFlour2Gr);

  const fatType = safeText(data?.fatType, "butter");
  const eggType = safeText(data?.eggType, "whole");
  const sugarType = safeText(data?.sugarType, "white");
  const yeastForm = safeText(data?.yeastForm, "instant");

  const preferment = data?.preferment ?? {
    type: "none",
    flour: 0,
    liquid: 0,
    water: 0,
    yeast: 0,
    total: 0,
  };

  const prefermentType = safeText(
    preferment?.type,
    "none"
  );

  const totalDough = safeNum(data?.totalDough);

  const ingredientName = (
    group:
      | "liquid"
      | "fat"
      | "egg"
      | "sugar"
      | "yeast"
      | "preferment"
      | "flour",
    value: string
  ) =>
    t(`ingredients.${group}.${value}`, {
      defaultValue: value,
    });

  const numberFormatter = new Intl.NumberFormat(
    i18n.language.startsWith("en") ? "en" : "ru",
    {
      maximumFractionDigits: 1,
    }
  );

  const formatNumber = (value: number) =>
    numberFormatter.format(value);

  const formatGr = (value: number) =>
    `${formatNumber(value)} ${t("units.g")}`;

  const profileName = t(`profiles.${profileId}`, {
    defaultValue: profile?.name ?? profileId,
  });

  return (
    <div className="recipe-output-page">
      <div className="recipe-output-shell">
        <div className="recipe-output-topbar">
          <button
            type="button"
            onClick={onBack}
            className="recipe-output-back"
          >
            {t("common.back")}
          </button>

          <div className="recipe-output-language">
            <button
              type="button"
              className={
                i18n.language.startsWith("ru")
                  ? "active"
                  : ""
              }
              onClick={() => i18n.changeLanguage("ru")}
            >
              RU
            </button>

            <button
              type="button"
              className={
                i18n.language.startsWith("en")
                  ? "active"
                  : ""
              }
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </button>
          </div>
        </div>

        <header className="recipe-output-header">
          <p className="recipe-output-kicker">
            {t("recipeOutput.title")}
          </p>

          <h1 className="recipe-output-title">
            {profileName}
          </h1>
        </header>

        <section className="recipe-output-card">
          <h2 className="recipe-output-card-title">
            {t("recipeOutput.composition")}
          </h2>

          <div className="recipe-output-list">
            <div className="recipe-output-row">
              <span>{t("recipeOutput.flourTotal")}</span>
              <strong>{formatGr(flour)}</strong>
            </div>

            <div className="recipe-output-row">
              <span>
                {t("recipeOutput.primaryLiquid")}
                <small className="recipe-output-type">
                  {ingredientName("liquid", liquidType)}
                </small>
              </span>
              <strong>{formatGr(liquid)}</strong>
            </div>

            {eggsGr > 0 && eggType !== "none" && (
              <div className="recipe-output-row">
                <span>
                  {t("recipeOutput.eggs")}
                  <small className="recipe-output-type">
                    {ingredientName("egg", eggType)}
                  </small>
                </span>

                <strong>
                  {formatGr(eggsGr)}
                  <small>
                    {eggsPct}% {t("recipeOutput.ofFlour")}
                    {approxEggCount > 0
                      ? ` · ${t("recipeOutput.approx")} ${formatNumber(
                          approxEggCount
                        )} ${t("recipeOutput.pcs")}`
                      : ""}
                  </small>
                </strong>
              </div>
            )}

            {fat > 0 && (
              <div className="recipe-output-row">
                <span>
                  {t("recipeOutput.fat")}
                  <small className="recipe-output-type">
                    {ingredientName("fat", fatType)}
                  </small>
                </span>
                <strong>{formatGr(fat)}</strong>
              </div>
            )}

            {sugar > 0 && (
              <div className="recipe-output-row">
                <span>
                  {t("recipeOutput.sugar")}
                  <small className="recipe-output-type">
                    {ingredientName("sugar", sugarType)}
                  </small>
                </span>
                <strong>{formatGr(sugar)}</strong>
              </div>
            )}

            {salt > 0 && (
              <div className="recipe-output-row">
                <span>{t("recipeOutput.salt")}</span>
                <strong>{formatGr(salt)}</strong>
              </div>
            )}

            {yeast > 0 && (
              <div className="recipe-output-row">
                <span>
                  {t("recipeOutput.yeast")}
                  <small className="recipe-output-type">
                    {ingredientName("yeast", yeastForm)}
                  </small>
                </span>
                <strong>{formatGr(yeast)}</strong>
              </div>
            )}
          </div>
        </section>

        <section className="recipe-output-card">
          <h2 className="recipe-output-card-title">
            {t("recipeOutput.analytics")}
          </h2>

          <div className="recipe-output-metrics">
            <div className="recipe-output-metric">
              <span>
                {t("recipeOutput.primaryLiquid")}
              </span>
              <strong>{formatNumber(liquidPct)}%</strong>
            </div>

            <div className="recipe-output-metric">
              <span>
                {t("recipeOutput.effectiveWater")}
              </span>
              <strong>
                {formatNumber(effectiveWaterPct)}%
              </strong>
              <small>
                {formatGr(
                  Math.round(effectiveWaterGr)
                )}
              </small>
            </div>

            <div className="recipe-output-metric">
              <span>
                {t("recipeOutput.doughWeight")}
              </span>
              <strong>{formatGr(totalDough)}</strong>
            </div>
          </div>
        </section>

        <section className="recipe-output-card">
          <h2 className="recipe-output-card-title">
            {t("recipeOutput.flour")}
          </h2>

          <div className="recipe-output-list">
            <div className="recipe-output-row">
              <span>
                {t("recipeOutput.mainFlour")}
              </span>

              <strong>
                {formatGr(mainFlourGr)}
                <small>
                  {ingredientName(
                    "flour",
                    mainFlour
                  )}
                </small>
              </strong>
            </div>

            {extraPct1 > 0 && (
              <div className="recipe-output-row">
                <span>
                  {t("recipeOutput.extraFlour")}
                </span>

                <strong>
                  {formatGr(extraFlour1Gr)}
                  <small>
                    {ingredientName(
                      "flour",
                      extraFlour1
                    )}{" "}
                    · {formatNumber(extraPct1)}%
                  </small>
                </strong>
              </div>
            )}

            {extraPct2 > 0 && (
              <div className="recipe-output-row">
                <span>
                  {t("recipeOutput.extraFlour2")}
                </span>

                <strong>
                  {formatGr(extraFlour2Gr)}
                  <small>
                    {ingredientName(
                      "flour",
                      extraFlour2
                    )}{" "}
                    · {formatNumber(extraPct2)}%
                  </small>
                </strong>
              </div>
            )}
          </div>
        </section>

        <section className="recipe-output-card">
          <h2 className="recipe-output-card-title">
            {t("recipeOutput.preferment")}
          </h2>

          {prefermentType === "none" ||
          safeNum(preferment?.flour) <= 0 ? (
            <div className="recipe-output-empty">
              {ingredientName(
                "preferment",
                "none"
              )}
            </div>
          ) : (
            <>
              <div className="recipe-output-preferment-name">
                {ingredientName(
                  "preferment",
                  prefermentType
                )}
              </div>

              <div className="recipe-output-list">
                <div className="recipe-output-row">
                  <span>
                    {t(
                      "recipeOutput.prefermentFlour"
                    )}
                  </span>
                  <strong>
                    {formatGr(
                      safeNum(preferment?.flour)
                    )}
                  </strong>
                </div>

                <div className="recipe-output-row">
                  <span>
                    {t(
                      "recipeOutput.prefermentLiquid"
                    )}
                  </span>
                  <strong>
                    {formatGr(
                      safeNum(preferment?.liquid)
                    )}
                    <small>
                      {ingredientName(
                        "liquid",
                        liquidType
                      )}
                    </small>
                  </strong>
                </div>

                <div className="recipe-output-row">
                  <span>
                    {t(
                      "recipeOutput.prefermentWater"
                    )}
                  </span>
                  <strong>
                    {formatGr(
                      safeNum(preferment?.water)
                    )}
                  </strong>
                </div>

                <div className="recipe-output-row">
                  <span>
                    {t(
                      "recipeOutput.prefermentYeast"
                    )}
                  </span>
                  <strong>
                    {formatGr(
                      safeNum(preferment?.yeast)
                    )}
                  </strong>
                </div>

                <div className="recipe-output-row">
                  <span>
                    {t(
                      "recipeOutput.prefermentWeight"
                    )}
                  </span>
                  <strong>
                    {formatGr(
                      safeNum(preferment?.total)
                    )}
                  </strong>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="recipe-output-actions">
          <button
            type="button"
            className="recipe-output-secondary"
            onClick={() => onShowTechCard(data)}
          >
            {t("common.techcard")}
          </button>

          <button
            type="button"
            className="recipe-output-secondary"
            onClick={() => onSaveAsCustom(data)}
          >
            {t("common.save")}
          </button>

          <button
            type="button"
            className="recipe-output-primary"
            onClick={onRestart}
          >
            {t("common.restart")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeOutput;
