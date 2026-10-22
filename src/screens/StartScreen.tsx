import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./StartScreen.css";

export type ProductionMode = "home" | "professional";
export type Climate = "dry" | "moderate" | "humid";
export type MixingMethod = "manual" | "planetary" | "spiral";

type StartScreenProps = {
  climate: Climate;
  mixing: MixingMethod;
  productionMode: ProductionMode;
  roomTemp: number;

  warmFermentationHours: number;
  coldFermentationHours: number;

  onClimateChange: (value: Climate) => void;
  onMixingChange: (value: MixingMethod) => void;
  onProductionModeChange: (value: ProductionMode) => void;
  onRoomTempChange: (value: number) => void;

  onWarmFermentationChange: (value: number) => void;
  onColdFermentationChange: (value: number) => void;

  onProfileSelect: (profileId: string) => void;

  customRecipes: any[];
  onOpenCustomRecipe: (id: string) => void;
  onDeleteCustomRecipe: (id: string) => void;
};

const StartScreen: React.FC<StartScreenProps> = ({
  climate,
  mixing,
  productionMode,
  roomTemp,
  warmFermentationHours,
  coldFermentationHours,
  onClimateChange,
  onMixingChange,
  onProductionModeChange,
  onRoomTempChange,
  onWarmFermentationChange,
  onColdFermentationChange,
  onProfileSelect,
  customRecipes,
  onOpenCustomRecipe,
  onDeleteCustomRecipe,
}) => {
  const { t, i18n } = useTranslation();
  const conditionsHelp = i18n.language.startsWith("es")
    ? "La temperatura, el tiempo de fermentación y el modo de producción ajustan la cantidad inicial de levadura. El clima y el amasado también pueden ajustar la receta. Son estimaciones: comprueba siempre la fermentación real."
    : i18n.language.startsWith("en")
      ? "Temperature, fermentation time and production mode adjust the initial yeast amount. Climate and mixing may also adjust the recipe. These are estimates: always check actual fermentation."
      : "Температура, время ферментации и режим производства корректируют исходное количество дрожжей. Климат и замес также могут влиять на рецептуру. Это ориентировочный расчёт: контролируйте фактическую ферментацию.";

  const modules = import.meta.glob(
    ["../profiles/*.json", "!../profiles/profileTemplate.json"],
    { eager: true }
  );

  const indexData = useMemo(() => {
    const categories: Record<string, any> = {};
    const profileNamesById: Record<string, string> = {};

    for (const path in modules) {
      const mod = modules[path] as any;
      const profile = mod?.default ?? mod;

      if (!profile?.base) continue;

      const id = profile.id;
      const category = profile.category || "other";
      const subtype = profile.subtype || id;
      const name = profile.name || id;

      profileNamesById[id] = name;

      if (!categories[category]) {
        categories[category] = {
          subtypes: {},
        };
      }

      categories[category].subtypes[subtype] = {
        name,
        profile: id,
      };
    }

    return {
      categories,
      profileNamesById,
    };
  }, [modules]);

  const getProfileNameById = (profileId: string) =>
    t(`profiles.${profileId}`, {
      defaultValue:
        indexData.profileNamesById[profileId] ?? profileId,
    });

  const getCategoryName = (category: string) =>
    t(`categories.${category}`, {
      defaultValue: category,
    });

  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.trim().toLocaleLowerCase();
    const results: {
      category: string;
      profile: string;
      name: string;
    }[] = [];

    for (const [category, data] of Object.entries(
      indexData.categories
    )) {
      for (const item of Object.values(
        (data as any).subtypes
      ) as any[]) {
        const localizedName = t(`profiles.${item.profile}`, {
          defaultValue: item.name,
        });

        if (
          localizedName
            .toLocaleLowerCase()
            .includes(query)
        ) {
          results.push({
            category,
            profile: item.profile,
            name: localizedName,
          });
        }
      }
    }

    return results;
  }, [searchQuery, indexData, i18n.language, t]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    return JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
  });

  const toggleFavorite = (profileId: string) => {
    setFavorites((previous) => {
      const updated = previous.includes(profileId)
        ? previous.filter((id) => id !== profileId)
        : [...previous, profileId];

      localStorage.setItem(
        "favorites",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const [recent, setRecent] = useState<string[]>(() => {
    return JSON.parse(
      localStorage.getItem("recent") || "[]"
    );
  });

  const addRecent = (profileId: string) => {
    setRecent((previous) => {
      const updated = [
        profileId,
        ...previous.filter((id) => id !== profileId),
      ].slice(0, 5);

      localStorage.setItem(
        "recent",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const openProfile = (profileId: string) => {
    addRecent(profileId);
    onProfileSelect(profileId);
  };

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const locale = i18n.language.startsWith("es")
    ? "es-ES"
    : i18n.language.startsWith("en")
      ? "en-GB"
      : "ru-RU";

  return (
    <div className="start-page">
      <div className="start-shell">
        <div className="start-topbar">
          <div>
            <h1 className="start-title">
              {t("start.title")}
            </h1>
            <p className="start-subtitle">
              {t("start.subtitle")}
            </p>
          </div>

          <div className="start-language">
            <button
              type="button"
              className={
                i18n.language.startsWith("ru")
                  ? "active"
                  : ""
              }
              onClick={() =>
                i18n.changeLanguage("ru")
              }
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
              onClick={() =>
                i18n.changeLanguage("en")
              }
            >
              EN
            </button>

            <button
              type="button"
              className={
                i18n.language.startsWith("es")
                  ? "active"
                  : ""
              }
              onClick={() =>
                i18n.changeLanguage("es")
              }
            >
              ES
            </button>
          </div>
        </div>

        <section className="start-card">
          <h2 className="start-card-title">
            {t("start.conditions")}
          </h2>

          <div className="start-conditions-grid">
            <label className="start-field">
              <span>
                {t("start.roomTempShort")}
              </span>
              <div className="start-number-unit">
                <input
                  type="number"
                  value={roomTemp}
                  onChange={(event) =>
                    onRoomTempChange(
                      Number(event.target.value)
                    )
                  }
                />
                <small>°C</small>
              </div>
            </label>

            <label className="start-field">
              <span>
                {t("start.warmHoursShort")}
              </span>
              <div className="start-number-unit">
                <input
                  type="number"
                  value={warmFermentationHours}
                  onChange={(event) =>
                    onWarmFermentationChange(
                      Number(event.target.value)
                    )
                  }
                />
                <small>h</small>
              </div>
            </label>

            <label className="start-field">
              <span>
                {t("start.coldHoursShort")}
              </span>
              <div className="start-number-unit">
                <input
                  type="number"
                  value={coldFermentationHours}
                  onChange={(event) =>
                    onColdFermentationChange(
                      Number(event.target.value)
                    )
                  }
                />
                <small>h</small>
              </div>
            </label>

            <label className="start-field">
              <span>{t("start.climate")}</span>
              <select
                value={climate}
                onChange={(event) =>
                  onClimateChange(
                    event.target.value as Climate
                  )
                }
              >
                <option value="dry">
                  {t("ingredients.climate.dry")}
                </option>
                <option value="moderate">
                  {t(
                    "ingredients.climate.moderate"
                  )}
                </option>
                <option value="humid">
                  {t(
                    "ingredients.climate.humid"
                  )}
                </option>
              </select>
            </label>

            <label className="start-field">
              <span>{t("start.mixing")}</span>
              <select
                value={mixing}
                onChange={(event) =>
                  onMixingChange(
                    event.target
                      .value as MixingMethod
                  )
                }
              >
                <option value="manual">
                  {t(
                    "ingredients.mixing.manual"
                  )}
                </option>
                <option value="planetary">
                  {t(
                    "ingredients.mixing.planetary"
                  )}
                </option>
                <option value="spiral">
                  {t(
                    "ingredients.mixing.spiral"
                  )}
                </option>
              </select>
            </label>
          </div>

          <div className="start-mode">
            <button
              type="button"
              className={
                productionMode === "home"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onProductionModeChange("home")
              }
            >
              {t("start.home")}
            </button>

            <button
              type="button"
              className={
                productionMode === "professional"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onProductionModeChange(
                  "professional"
                )
              }
            >
              {t("start.professional")}
            </button>
          </div>
          <p style={{ fontSize: "0.84rem", opacity: 0.78, marginTop: 12 }}>{conditionsHelp}</p>
        </section>

        <section className="start-search-section">
          <h2 className="start-section-title">
            {t("start.searchProfiles")}
          </h2>

          <input
            className="start-search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder={t(
              "start.searchPlaceholder"
            )}
          />

          {searchQuery && (
            <div className="start-profile-grid start-search-results">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    type="button"
                    className="start-profile-card"
                    key={item.profile}
                    onClick={() =>
                      openProfile(item.profile)
                    }
                  >
                    <strong>{item.name}</strong>
                    <small>
                      {getCategoryName(
                        item.category
                      )}
                    </small>
                  </button>
                ))
              ) : (
                <div className="start-empty">
                  {t("start.noResults")}
                </div>
              )}
            </div>
          )}
        </section>

        {!searchQuery && (
          <>
            {recent.length > 0 && (
              <section className="start-section">
                <h2 className="start-section-title">
                  {t("start.recentProfiles")}
                </h2>

                <div className="start-profile-grid">
                  {recent.map((id) => (
                    <button
                      type="button"
                      className="start-profile-card"
                      key={id}
                      onClick={() =>
                        openProfile(id)
                      }
                    >
                      <strong>
                        {getProfileNameById(id)}
                      </strong>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {favorites.length > 0 && (
              <section className="start-section">
                <h2 className="start-section-title">
                  {t("start.favorites")}
                </h2>

                <div className="start-profile-grid">
                  {favorites.map((id) => (
                    <div
                      className="start-profile-wrap"
                      key={id}
                    >
                      <button
                        type="button"
                        className="start-profile-card"
                        onClick={() =>
                          openProfile(id)
                        }
                      >
                        <strong>
                          {getProfileNameById(id)}
                        </strong>
                      </button>

                      <button
                        type="button"
                        className="start-star active"
                        title={t(
                          "start.removeFavorite"
                        )}
                        onClick={() =>
                          toggleFavorite(id)
                        }
                      >
                        ★
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="start-section">
              <div className="start-section-heading">
                <h2 className="start-section-title">
                  {selectedCategory
                    ? getCategoryName(
                        selectedCategory
                      )
                    : t("start.categories")}
                </h2>

                {selectedCategory && (
                  <button
                    type="button"
                    className="start-inline-back"
                    onClick={() =>
                      setSelectedCategory(null)
                    }
                  >
                    {t("common.back")}
                  </button>
                )}
              </div>

              {!selectedCategory ? (
                <div className="start-category-grid">
                  {Object.keys(
                    indexData.categories
                  ).map((category) => (
                    <button
                      type="button"
                      className="start-category-card"
                      key={category}
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                    >
                      {getCategoryName(category)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="start-profile-grid">
                  {Object.values(
                    indexData.categories[
                      selectedCategory
                    ].subtypes
                  ).map((item: any) => (
                    <div
                      className="start-profile-wrap"
                      key={item.profile}
                    >
                      <button
                        type="button"
                        className="start-profile-card"
                        onClick={() =>
                          openProfile(item.profile)
                        }
                      >
                        <strong>
                          {getProfileNameById(
                            item.profile
                          )}
                        </strong>
                      </button>

                      <button
                        type="button"
                        className={`start-star ${
                          favorites.includes(
                            item.profile
                          )
                            ? "active"
                            : ""
                        }`}
                        title={
                          favorites.includes(
                            item.profile
                          )
                            ? t(
                                "start.removeFavorite"
                              )
                            : t(
                                "start.addFavorite"
                              )
                        }
                        onClick={() =>
                          toggleFavorite(
                            item.profile
                          )
                        }
                      >
                        {favorites.includes(
                          item.profile
                        )
                          ? "★"
                          : "☆"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {customRecipes.length > 0 && (
              <section className="start-section">
                <h2 className="start-section-title">
                  {t("start.myRecipes")}
                </h2>

                <div className="start-custom-grid">
                  {customRecipes.map((recipe) => (
                    <div
                      className="start-custom-card"
                      key={recipe.id}
                    >
                      <button
                        type="button"
                        className="start-custom-main"
                        onClick={() =>
                          onOpenCustomRecipe(
                            recipe.id
                          )
                        }
                      >
                        <strong>
                          {recipe.name}
                        </strong>
                        <small>
                          {new Date(
                            recipe.timestamp
                          ).toLocaleString(
                            locale
                          )}
                        </small>
                      </button>

                      <button
                        type="button"
                        className="start-delete"
                        title={t(
                          "start.deleteRecipe"
                        )}
                        onClick={() =>
                          onDeleteCustomRecipe(
                            recipe.id
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StartScreen;
