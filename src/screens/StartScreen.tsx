import WorkspaceTabs, { type WorkspaceView } from "../components/WorkspaceTabs";
import { readNotebookDraft } from "../logic/notebookDraft";
import AppearanceControls from "../components/AppearanceControls";
import UiIcon from "../components/UiIcon";
import RecipeThumbnail from "../components/RecipeThumbnail";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./StartScreen.css";
import NotebookRecipeEditor, { type NotebookRecipe } from "./NotebookRecipeEditor";

export type ProductionMode = "home" | "professional";
export type Climate = "dry" | "moderate" | "humid";
export type MixingMethod = "manual" | "planetary" | "spiral";

type StartScreenProps = {
  formulaEditor?: React.ReactNode;
  editingCustomRecipeId?: string;
  onCloseFormulaEditor?: () => void;
  initialWorkspaceView?: WorkspaceView;
  startEditorRequested?: boolean;
  onWorkspaceChange?: (view:WorkspaceView)=>void;
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
  focusMyRecipes?: boolean;
  onMyRecipesFocused?: () => void;
  onOpenCustomRecipe: (id: string) => void;
  onDeleteCustomRecipe: (id: string) => void;
};

// Visual catalog taxonomy. Recipe JSON categories and calculation logic remain unchanged.
const DOUGH_GROUP_ORDER = [
  "bread",
  "yeast_lean",
  "enriched",
  "laminated",
  "shortcrust",
  "choux",
  "unleavened",
  "sponge",
  "cake_batter",
] as const;

const doughIcons: Record<string,string> = {bread:"wheat",yeast_lean:"package",enriched:"croissant",laminated:"layers",shortcrust:"cookie",choux:"cooking-pot",unleavened:"chef-hat",sponge:"cake-slice",cake_batter:"cake"};

const PROFILE_DOUGH_GROUP: Record<string, string> = {
  "bread": "bread",
  "challah": "bread",
  "baguette": "bread",
  "ciabatta": "bread",
  "focaccia": "bread",
  "pita": "bread",
  "bagel": "bread",
  "sourdough": "bread",
  "pizza": "bread",
  "baked_pirozhki": "enriched",
  "belyashi": "yeast_lean",
  "enriched": "enriched",
  "swedish_enriched": "enriched",
  "brioche": "enriched",
  "cinnabon": "enriched",
  "ensaimada": "enriched",
  "donuts": "enriched",
  "shortcrust": "shortcrust",
  "choux": "choux",
  "chebureki": "unleavened",
  "empanada": "unleavened",
  "sponge": "sponge",
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
  focusMyRecipes,
  onMyRecipesFocused,
  onOpenCustomRecipe,
  onDeleteCustomRecipe,
  formulaEditor,
  editingCustomRecipeId,
  onCloseFormulaEditor,
  initialWorkspaceView="notebook",
  startEditorRequested=false,
  onWorkspaceChange,
}) => {
  const { t, i18n } = useTranslation();
  // MASAMASA_BLANK_RECIPE_V1: independent storage, preserving legacy saved cards.
  const storageKey = "masamasa:notebookRecipes:v1";
  const [notebookRecipes, setNotebookRecipes] = useState<NotebookRecipe[]>(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(value) ? value.filter((x): x is NotebookRecipe => x?.version === 1 && typeof x?.id === "string" && Array.isArray(x?.ingredients)) : [];
    } catch { return []; }
  });
  const [rememberedDraft] = useState(()=>{const draft=readNotebookDraft();return draft && (draft.recipeId===null || notebookRecipes.some(x=>x.id===draft.recipeId)) && (draft.title.trim()||draft.notes.trim()||draft.ingredients.some(x=>x.name.trim()||x.grams>0)) ? draft : null;});
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(rememberedDraft?.recipeId ?? null);
  const [notebookEditorOpen, setNotebookEditorOpen] = useState(Boolean(rememberedDraft)||startEditorRequested);
  const [libraryOpen,setLibraryOpen]=useState(initialWorkspaceView==="library");
  const selectWorkspace=(view:WorkspaceView)=>{
    setLibraryOpen(view==="library");
    if(view==="notebook"&&!notebookEditorOpen&&!formulaEditor){setEditingNotebookId(null);setNotebookEditorOpen(true);}
    onWorkspaceChange?.(view);
    requestAnimationFrame(()=>document.querySelector(view==="library"?"#masamasa-library-title":"#masamasa-my-recipes")?.scrollIntoView({block:"start",behavior:"auto"}));
  };
  React.useEffect(()=>{setLibraryOpen(initialWorkspaceView==="library");},[initialWorkspaceView]);
  const notebookLanguage = i18n.language.startsWith("es") ? "es" : i18n.language.startsWith("en") ? "en" : "ru";
  const notebookText = {
    ru: { create: "Записать рецепт", personal: "С чистого листа", delete: "Удалить рецепт? Это действие нельзя отменить.", storage: "Не удалось сохранить изменения в этом браузере.", edit: "Изменить", remove: "Удалить" },
    en: { create: "Write a recipe", personal: "From scratch", delete: "Delete this recipe? This cannot be undone.", storage: "Could not save changes in this browser.", edit: "Edit", remove: "Delete" },
    es: { create: "Anotar una receta", personal: "Desde cero", delete: "¿Eliminar esta receta? No se puede deshacer.", storage: "No se pudieron guardar los cambios en este navegador.", edit: "Editar", remove: "Eliminar" },
  }[notebookLanguage];
  const persistNotebook = (items: NotebookRecipe[]): boolean => {
    try { localStorage.setItem(storageKey, JSON.stringify(items)); setNotebookRecipes(items); return true; }
    catch { window.alert(notebookText.storage); return false; }
  };
  const saveNotebook = (recipe: NotebookRecipe): boolean => {
    const updated = notebookRecipes.some(x => x.id === recipe.id)
      ? notebookRecipes.map(x => x.id === recipe.id ? recipe : x)
      : [recipe, ...notebookRecipes];
    if (!persistNotebook(updated)) return false;
    setEditingNotebookId(null);
    setNotebookEditorOpen(false);
    return true;
  };
  const removeNotebook = (id: string) => {
    if (!window.confirm(notebookText.delete)) return;
    persistNotebook(notebookRecipes.filter(x => x.id !== id));
  };

  React.useEffect(() => {
    if (!focusMyRecipes) return;
    setLibraryOpen(false);
    document.getElementById('masamasa-my-recipes')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    onMyRecipesFocused?.();
  }, [focusMyRecipes, onMyRecipesFocused]);
  React.useEffect(()=>{if(libraryOpen)document.getElementById("masamasa-library-title")?.focus();},[libraryOpen]);
  const libraryText={ru:{title:"Базовые рецепты",open:"Подсмотреть базовый рецепт",back:"К моей записной книжке",empty:"Запишите свой рецепт: введите ингредиенты и количества, чтобы рассчитать пропорции или другую массу теста."},en:{title:"Base recipes",open:"Look up a base recipe",back:"Back to my notebook",empty:"Write your recipe: enter ingredients and amounts to calculate percentages or scale your dough."},es:{title:"Recetas base",open:"Consultar una receta base",back:"Volver a mi cuaderno",empty:"Anota tu receta: introduce los ingredientes y las cantidades para calcular porcentajes o ajustar la cantidad de masa."}}[notebookLanguage];
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
    const categories: Record<string, any> = Object.fromEntries(
      DOUGH_GROUP_ORDER.map((group) => [group, { subtypes: {} }])
    );
    const profileNamesById: Record<string, string> = {};

    for (const path in modules) {
      const mod = modules[path] as any;
      const profile = mod?.default ?? mod;

      if (!profile?.base) continue;

      const id = profile.id;
      const category = PROFILE_DOUGH_GROUP[id] ?? "other";
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
        <AppearanceControls />
        <WorkspaceTabs active={libraryOpen?"library":"notebook"} onChange={selectWorkspace}/>
        <div className="start-topbar">
          <div>
            <h1 className="start-title">
              {t("start.title")}
            </h1>
            <p className="start-subtitle">
              {i18n.language.startsWith("es") ? "Tu cuaderno personal de panadería: guarda tus recetas, adapta las cantidades y calcula tus masas." : i18n.language.startsWith("en") ? "Your personal baking notebook: save recipes, adjust quantities and calculate your dough." : "Личная записная книжка пекаря: сохраняйте рецепты, меняйте количество ингредиентов и рассчитывайте тесто."}
            </p>
            {/* MASAMASA_ABOUT_NAV_V1 */}
            <a
              className="start-about-link"
              href={
                i18n.language.startsWith("es")
                  ? "/about/es/index.html"
                  : i18n.language.startsWith("en")
                    ? "/about/en/index.html"
                    : "/about/ru/index.html"
              }
            >
              {i18n.language.startsWith("es")
                ? "Acerca de MasaMasa"
                : i18n.language.startsWith("en")
                  ? "About MasaMasa"
                  : "О проекте MasaMasa"}
            </a>
          </div>


        </div>

        {/* MASAMASA_NOTEBOOK_HOME_V1: personal recipes first; originals remain in localStorage. */}
        <section id="masamasa-my-recipes" className="start-card mm-notebook-home" hidden={libraryOpen}>
          <div className="mm-notebook-heading">
            <div>
              <h2 className="start-card-title mm-heading-label"><UiIcon name="notebook-pen" />
                {i18n.language.startsWith("es") ? "Mi cuaderno de panadería" : i18n.language.startsWith("en") ? "My baking notebook" : "Моя записная книжка пекаря"}
              </h2>
              <p className="mm-notebook-intro">
                {i18n.language.startsWith("es") ? "Tus recetas y tus cantidades, siempre a mano." : i18n.language.startsWith("en") ? "Your recipes and quantities, always at hand." : "Ваши рецепты и расчёты всегда под рукой."}
              </p>
            </div>
            <div className="mm-notebook-heading-actions">
              {!notebookEditorOpen && !formulaEditor && (
              <button type="button" className="mm-blank-new" onClick={() => { setEditingNotebookId(null); setNotebookEditorOpen(true); }}>
                {notebookText.create}
              </button>
              )}

            </div>
          </div>
          {formulaEditor}
          {!formulaEditor && notebookEditorOpen && (
            <NotebookRecipeEditor
              key={editingNotebookId ?? "new"}
              lang={notebookLanguage}
              recipe={notebookRecipes.find(x => x.id === editingNotebookId) ?? null}
              onSave={saveNotebook}
              onCancel={() => { setEditingNotebookId(null); setNotebookEditorOpen(false); }}
            />
          )}
          {notebookRecipes.length > 0 && (
            <div className="start-custom-grid mm-notebook-personal">
              {/* MASAMASA_NOTEBOOK_EDITOR_VIEW_V2: hide only the recipe currently being edited. */}
              {notebookRecipes.filter(recipe => !notebookEditorOpen || recipe.id !== editingNotebookId).map(recipe => (
                <div className="start-custom-card" key={recipe.id}>
                  <button type="button" className="start-custom-main" onClick={() => { onCloseFormulaEditor?.(); setEditingNotebookId(recipe.id); setNotebookEditorOpen(true); }}>
                    <strong>{recipe.title}</strong>
                    <span className="mm-notebook-kind">{notebookText.personal} · {recipe.ingredients.length} · {new Date(recipe.updatedAt).toLocaleDateString(locale)}</span>
                  </button>
                  <button type="button" className="start-delete" title={notebookText.remove} aria-label={notebookText.remove} onClick={() => removeNotebook(recipe.id)}><UiIcon name="x" /></button>
                </div>
              ))}
            </div>
          )}
          {customRecipes.length === 0 && notebookRecipes.length === 0 ? (
            <div className="mm-notebook-empty"><p>{libraryText.empty}</p></div>
          ) : (
            <div className="start-custom-grid">
              {customRecipes.filter(recipe => recipe.id !== editingCustomRecipeId).map((recipe) => (
                <div className="start-custom-card" key={recipe.id}>
                  <button type="button" className="start-custom-main" onClick={() => { setNotebookEditorOpen(false); setEditingNotebookId(null); onOpenCustomRecipe(recipe.id); }}>
                    <strong>{recipe.name}</strong>
                    <small>{new Date(recipe.timestamp).toLocaleString(locale, {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"})}</small>
                  </button>
                  <button type="button" className="start-delete" title={t("start.deleteRecipe")} aria-label={t("start.deleteRecipe")} onClick={() => onDeleteCustomRecipe(recipe.id)}><UiIcon name="x" /></button>
                </div>
              ))}
            </div>
          )}
          <p className="mm-notebook-storage"><UiIcon name="info" />
            {i18n.language.startsWith("es") ? "Por ahora, las recetas se guardan en este navegador." : i18n.language.startsWith("en") ? "For now, recipes are saved in this browser." : "Пока рецепты сохраняются в этом браузере."}
          </p>
        </section>

        <div className="mm-library-view" hidden={!libraryOpen}>
          <header className="mm-library-header">

            <h2 id="masamasa-library-title" tabIndex={-1}>{libraryText.title}</h2>
          </header>
        <section className="start-search-section">
          <h2 className="start-section-title">
            {i18n.language.startsWith("es") ? "Buscar por nombre de producto o receta" : i18n.language.startsWith("en") ? "Search by product or recipe name" : "Поиск по названию изделия или рецепта"}
          </h2>

          <input
            className="start-search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
              placeholder={i18n.language.startsWith("es") ? "Por ejemplo, brioche, jalá..." : i18n.language.startsWith("en") ? "For example, brioche, challah..." : "Например, бриошь, хала..."}
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
                    <RecipeThumbnail profileId={item.profile} />
                    <span className="start-recipe-card-text">
                      <strong>{item.name}</strong>
                      <small>
                        {getCategoryName(
                          item.category
                        )}
                      </small>
                    </span>
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

        {/* MASAMASA_NOTEBOOK_NAV_V3: production settings are optional on home. */}
        <details className="start-card mm-conditions-fold" id="masamasa-production-conditions">
          <summary><span className="mm-heading-label"><UiIcon name="thermometer" />{t("start.conditions")}</span><UiIcon name="chevron-down" className="mm-disclosure-icon" /></summary>
          <div className="mm-conditions-content">

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
          </div>
        </details>

        <div id="masamasa-recipe-library" />


        {!searchQuery && (
          <>
            {recent.length > 0 && (
              <section className="start-section">
                <h2 className="start-section-title">
                  <span className="mm-heading-label"><UiIcon name="clock" />{t("start.recentProfiles")}</span>
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
                      <RecipeThumbnail profileId={id} />
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
                  <span className="mm-heading-label"><UiIcon name="star" />{t("start.favorites")}</span>
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
                        <RecipeThumbnail profileId={id} />
                        <strong>
                          {getProfileNameById(id)}
                        </strong>
                      </button>

                      <button
                        type="button"
                        className="start-star active"
                        aria-label={t("start.removeFavorite")} aria-pressed={true}
                        title={t(
                          "start.removeFavorite"
                        )}
                        onClick={() =>
                          toggleFavorite(id)
                        }
                      >
                        <UiIcon name="star" filled />
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
                  <button type="button" className="start-inline-back" onClick={() => document.getElementById("masamasa-production-conditions")?.scrollIntoView({behavior: "smooth", block: "start"})}>
                    {i18n.language.startsWith("es") ? "Cambiar condiciones" : i18n.language.startsWith("en") ? "Edit conditions" : "Изменить условия"}
                  </button>
                )}
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
                      disabled={Object.keys(indexData.categories[category].subtypes).length === 0}
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                    >
                      <span className="mm-category-label"><UiIcon name={doughIcons[category] ?? "utensils"} /><strong>{getCategoryName(category)}</strong></span>
                      <small className="start-category-status">
                        {Object.keys(indexData.categories[category].subtypes).length || (notebookLanguage === "ru" ? "Скоро" : notebookLanguage === "es" ? "Próximamente" : "Coming soon")}
                      </small>
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
                        <RecipeThumbnail profileId={item.profile} />
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
                        aria-label={favorites.includes(item.profile) ? t("start.removeFavorite") : t("start.addFavorite")}
                        aria-pressed={favorites.includes(item.profile)}
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
                        <UiIcon name="star" filled={favorites.includes(item.profile)} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </>
        )}
        </div>
      {/* MASAMASA_DISCOVERY_V1 */}
      <footer className="start-info-footer" aria-label="About MasaMasa">
        <span>MasaMasa:</span>
        <a href="/about/en/index.html" lang="en">About (EN)</a>
        <a href="/about/es/index.html" lang="es">Acerca (ES)</a>
        <a href="/about/ru/index.html" lang="ru">О проекте (RU)</a>
      </footer>
      </div>
    </div>
  );
};

export default StartScreen;
