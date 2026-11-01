// MASAMASA_UNIQUE_SAVES_NOTICE_V1
// MASAMASA_BACK_TO_MY_RECIPES_V1
// MASAMASA_SAVED_CARD_DIRECT_OPEN_V1
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "./context/AppContext";

import StartScreen from "./screens/StartScreen";
import RecipeInput from "./screens/RecipeInput";
import RecipeOutput from "./screens/RecipeOutput";
import TechCard from "./screens/TechCard";
import CustomRecipeView from "./screens/CustomRecipeView";

import { loadProfile } from "./logic/profileLoader";
import { calculateRecipe } from "./logic/calculateRecipe";
import type { StageTimeEdits } from "./logic/processTimeline";

function App() {
  const { i18n } = useTranslation();
  const saveLanguage = i18n.language.startsWith("es") ? "es" : i18n.language.startsWith("en") ? "en" : "ru";
  const saveText = {
    ru: {
      newTitle: "Название рецепта", cardTitle: "Название рецепта / партии",
      exists: (name: string) => `Рецепт «${name}» уже существует.\nОК — заменить его вместе с техкартой.\nОтмена — выбрать другое имя.`,
      ambiguous: (name: string) => `Уже есть несколько рецептов «${name}». Чтобы случайно не потерять данные, автоматическая замена недоступна.`,
      rename: "Введите другое название рецепта (Отмена — не сохранять):",
      saved: "Рецепт и техкарта сохранены", updated: "Изменения сохранены", replaced: "Существующий рецепт и техкарта обновлены",
      error: "Не удалось сохранить рецепт. Проверьте доступность хранилища браузера.",
      missing: "Рецепт не найден в сохранённых данных. Изменения не записаны.",
      attempts: "Не удалось выбрать уникальное название. Сохранение отменено.",
    },
    en: {
      newTitle: "Recipe name", cardTitle: "Recipe / production batch name",
      exists: (name: string) => `A recipe named “${name}” already exists.\nOK — replace it and its process card.\nCancel — choose another name.`,
      ambiguous: (name: string) => `Several recipes named “${name}” already exist. Automatic replacement is disabled to protect your data.`,
      rename: "Choose another recipe name (Cancel — do not save):",
      saved: "Recipe and process card saved", updated: "Changes saved", replaced: "Existing recipe and process card updated",
      error: "Could not save the recipe. Check browser storage availability.",
      missing: "Saved recipe not found. Changes were not written.",
      attempts: "Could not select a unique name. Save cancelled.",
    },
    es: {
      newTitle: "Nombre de receta", cardTitle: "Nombre de receta / lote",
      exists: (name: string) => `Ya existe una receta llamada «${name}».\nAceptar — reemplazarla junto con su ficha.\nCancelar — elegir otro nombre.`,
      ambiguous: (name: string) => `Ya existen varias recetas llamadas «${name}». No se reemplazan automáticamente para proteger tus datos.`,
      rename: "Escribe otro nombre (Cancelar — no guardar):",
      saved: "Receta y ficha técnica guardadas", updated: "Cambios guardados", replaced: "Receta y ficha técnica existentes actualizadas",
      error: "No se pudo guardar. Comprueba el almacenamiento del navegador.",
      missing: "No se encontró la receta guardada. No se han escrito los cambios.",
      attempts: "No se pudo elegir un nombre único. Guardado cancelado.",
    },
  }[saveLanguage];
  const {
    climate,
    mixing,
    productionMode,
    roomTemp,
    warmFermentationHours,
    coldFermentationHours,
    setClimate,
    setMixing,
    setProductionMode,
    setRoomTemp,
    setWarmFermentationHours,
    setColdFermentationHours,
  } = useAppContext();

  type CustomRecipe = {
    id: string;
    name: string;
    recipe: any;
    profile: any;
    conditions: any;
    technology?: { version: 1; durationEdits: StageTimeEdits };
    timestamp: number;
  };

  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [recipeData, setRecipeData] = useState<any | null>(null);

  const [showTechCard, setShowTechCard] = useState(false);
  const [techData, setTechData] = useState<any | null>(null);

  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>(() => {
    return JSON.parse(localStorage.getItem("customRecipes") || "[]");
  });

  const [selectedCustomRecipeId, setSelectedCustomRecipeId] = useState<string | null>(null);
  const [focusMyRecipes, setFocusMyRecipes] = useState(false);
  const [showSavedTechCard, setShowSavedTechCard] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const n = (value: unknown, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  // ------------------------------------------------------------
  // 1. Открытие кастомного рецепта
  // ------------------------------------------------------------
  const handleOpenCustomRecipe = (id: string) => {
    setSaveNotice(null);
    // Open the production card, not the old plain-text recipe preview.
    setShowSavedTechCard(true);
    setSelectedCustomRecipeId(id);
  };

  const handleDeleteCustomRecipe = (id: string) => {
    const updated = customRecipes.filter((r) => r.id !== id);
    localStorage.setItem("customRecipes", JSON.stringify(updated));
    setCustomRecipes(updated);
  };

  // ------------------------------------------------------------
  // 2. Выбор профиля
  // ------------------------------------------------------------
  const handleProfileSelect = (profileId: string) => {
    const loaded = loadProfile(profileId, climate, mixing, {
      productionMode,
      coldHours: coldFermentationHours,
      warmHours: warmFermentationHours,
      flourType: "normal",
      roomTemp,
    });

    setSelectedProfile(profileId);
    setProfileData(loaded);

    setRecipeData({
      mode: "flour",
      targetDoughWeight: 0,

      flour: loaded?.base?.flour ?? 1000,

      // Новый composition-профиль хранит основную жидкость отдельно.
      liquidPct:
        typeof loaded?.base?.liquidPct === "number"
          ? loaded.base.liquidPct
          : undefined,

      // hydration остаётся временно только для legacy-профилей.
      hydration:
        typeof loaded?.base?.liquidPct === "number"
          ? undefined
          : loaded?.base?.hydration ?? 60,

      salt: loaded?.base?.salt ?? 2,
      sugar: loaded?.base?.sugar ?? 0,
      fat: loaded?.base?.fat ?? 0,
      processFatPct: loaded?.base?.processFat?.percent ?? 0,
      processFatIngredient: loaded?.base?.processFat?.ingredient ?? "",
      eggsPct: loaded?.base?.eggs ?? 0,
      additives: loaded?.base?.additives ?? [],

      yeastPct: loaded?.base?.yeast?.percent ?? 1,
      yeastForm: loaded?.base?.yeast?.type ?? "instant",

      mainFlour: loaded?.base?.mainFlour ?? "normal",
      extraFlour1: loaded?.base?.extraFlour1 ?? "normal",
      extraPct1: loaded?.base?.extraPct1 ?? 0,
      extraFlour2: loaded?.base?.extraFlour2 ?? "normal",
      extraPct2: loaded?.base?.extraPct2 ?? 0,

      liquidType: loaded?.base?.liquidType ?? "water",
      fatType: loaded?.base?.fatType ?? "butter",
      eggType: loaded?.base?.eggType ?? "whole",
      sugarType: loaded?.base?.sugarType ?? "white",

      prefermentType:
        loaded?.preferment?.type ??
        loaded?.defaultPrefermentType ??
        "none",

      prefermentFlourPct: loaded?.preferment?.percentOfFlour ?? 0,
      prefermentHydrationPct: loaded?.preferment?.hydration ?? 100,
      prefermentYeastPct: loaded?.preferment?.yeastPercentInPreferment ?? 0,
    });
  };

  // ------------------------------------------------------------
  // 3. Сохранение кастомного рецепта
  // ------------------------------------------------------------
  // A single entry point for all NEW recipe saves (RecipeOutput and TechCard).
  // Name collisions never silently create another row.
  const normalizeRecipeName = (value: string): string =>
    value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

  const loadStoredRecipes = (): CustomRecipe[] | null => {
    try {
      const stored = JSON.parse(localStorage.getItem("customRecipes") || "[]");
      if (!Array.isArray(stored)) throw new Error("Invalid recipe storage");
      return stored as CustomRecipe[];
    } catch {
      window.alert(saveText.error);
      return null;
    }
  };

  const persistNewRecipe = (candidate: CustomRecipe): { saved: CustomRecipe; replaced: boolean } | null => {
    const stored = loadStoredRecipes();
    if (!stored) return null;
    let name = candidate.name.trim().replace(/\s+/g, " ");
    if (!name) return null;

    for (let attempt = 0; attempt < 20; attempt++) {
      const matches = stored.filter((entry) => normalizeRecipeName(entry.name) === normalizeRecipeName(name));
      if (matches.length === 0) {
        const saved = { ...candidate, name };
        const updated = [...stored, saved];
        try {
          localStorage.setItem("customRecipes", JSON.stringify(updated));
        } catch {
          window.alert(saveText.error);
          return null;
        }
        setCustomRecipes(updated);
        return { saved, replaced: false };
      }

      if (matches.length === 1 && window.confirm(saveText.exists(name))) {
        // Preserve the existing recipe ID when the user explicitly replaces it.
        const saved = { ...candidate, id: matches[0].id, name };
        const updated = stored.map((entry) => entry.id === matches[0].id ? saved : entry);
        try {
          localStorage.setItem("customRecipes", JSON.stringify(updated));
        } catch {
          window.alert(saveText.error);
          return null;
        }
        setCustomRecipes(updated);
        return { saved, replaced: true };
      }

      if (matches.length > 1) window.alert(saveText.ambiguous(name));
      const replacementName = window.prompt(saveText.rename, name);
      if (replacementName === null) return null;
      name = replacementName.trim().replace(/\s+/g, " ");
      if (!name) return null;
    }
    window.alert(saveText.attempts);
    return null;
  };

  const handleSaveAsCustom = (calculatedRecipe: any) => {
    if (!profileData || !calculatedRecipe) return;
    const name = window.prompt(saveText.newTitle, profileData.name || "MasaMasa");
    if (!name?.trim()) return;
    const candidate: CustomRecipe = {
      id: crypto.randomUUID(),
      name: name.trim(),
      recipe: calculatedRecipe,
      profile: profileData,
      conditions: { climate, mixing, productionMode, roomTemp, warmFermentationHours, coldFermentationHours },
      timestamp: Date.now(),
    };
    const result = persistNewRecipe(candidate);
    if (result) window.alert(result.replaced ? saveText.replaced : saveText.saved);
  };

  // Save a NEW card using the same unique-name protection as RecipeOutput.
  const handleSaveEditedTechCard = (durationEdits: StageTimeEdits) => {
    if (!profileData || !techData) return;
    const suggested = profileData.name || "MasaMasa";
    const name = window.prompt(saveText.cardTitle, suggested);
    if (!name?.trim()) return;
    const candidate: CustomRecipe = {
      id: crypto.randomUUID(),
      name: name.trim(),
      recipe: techData,
      profile: profileData,
      conditions: { climate, mixing, productionMode, roomTemp, warmFermentationHours, coldFermentationHours },
      technology: { version: 1, durationEdits },
      timestamp: Date.now(),
    };
    const result = persistNewRecipe(candidate);
    if (!result) return;
    setSaveNotice(result.replaced ? saveText.replaced : saveText.saved);
    // Switch from the unsaved calculation to the newly saved card.
    setSelectedProfile(null);
    setProfileData(null);
    setRecipeData(null);
    setTechData(null);
    setShowTechCard(false);
    setShowSavedTechCard(true);
    setSelectedCustomRecipeId(result.saved.id);
  };

  // Update an EXISTING card strictly by ID. Never append a new record.
  const handleSaveExistingTechCard = (id: string, durationEdits: StageTimeEdits) => {
    const stored = loadStoredRecipes();
    if (!stored) return;
    if (!stored.some((entry) => entry.id === id)) {
      window.alert(saveText.missing);
      return;
    }
    const updated = stored.map((entry) => entry.id === id
      ? { ...entry, technology: { version: 1 as const, durationEdits }, timestamp: Date.now() }
      : entry
    );
    try {
      localStorage.setItem("customRecipes", JSON.stringify(updated));
    } catch {
      window.alert(saveText.error);
      return;
    }
    setCustomRecipes(updated);
    setSaveNotice(saveText.updated);
    setShowSavedTechCard(true);
  };

  // ------------------------------------------------------------
  // 4. Возврат к RecipeInput после RecipeOutput
  // ------------------------------------------------------------
  const handleBackToInput = () => {
    if (!recipeData) return;

    const inputData = recipeData._input;

    if (inputData) {
      setRecipeData({
        ...inputData,
        _calculated: false,
      });
      return;
    }

    setRecipeData({ ...recipeData, _calculated: false });
  };

  // ------------------------------------------------------------
  // 5. Полный сброс
  // ------------------------------------------------------------
  const handleRestart = () => {
    setSelectedProfile(null);
    setProfileData(null);
    setRecipeData(null);
    setShowTechCard(false);
    setSelectedCustomRecipeId(null);
    setShowSavedTechCard(false);
  };

  // ------------------------------------------------------------
  // 6. Техкарта
  // ------------------------------------------------------------
  const handleShowTechCard = (recipe: any) => {
    setTechData(recipe);
    setShowTechCard(true);
  };

  const handleBackFromTechCard = () => {
    setShowTechCard(false);
  };

  // ------------------------------------------------------------
  // 7. Расчёт рецепта
  // ------------------------------------------------------------
  const handleCalculate = (data: any) => {
    if (!profileData) return;

    const calculated = calculateRecipe({
      flour: n(data.flour, 0),

      mainFlour: data.mainFlour || "normal",
      extraFlour1: data.extraFlour1 || "normal",
      extraPct1: n(data.extraPct1, 0),
      extraFlour2: data.extraFlour2 || "normal",
      extraPct2: n(data.extraPct2, 0),

      hydration:
        data.hydration === undefined
          ? undefined
          : n(data.hydration, 0),

      liquidPct:
        data.liquidPct === undefined
          ? undefined
          : n(data.liquidPct, 0),

      liquidType: data.liquidType || "water",

      salt: n(data.salt, 0),
      sugar: n(data.sugar, 0),
      fat: n(data.fat, 0),
      processFatPct: n(data.processFatPct, 0),
      processFatIngredient: data.processFatIngredient || "",

      // Новый стандарт: яйца — % от массы муки.
      eggsPct: n(data.eggsPct, 0),
      additives: Array.isArray(data.additives) ? data.additives.map((item: any) => ({
        id: String(item.id), percent: n(item.percent, 0)
      })) : [],

      fatType: data.fatType || "butter",
      eggType: data.eggType || "whole",
      sugarType: data.sugarType || "white",
      yeastForm: data.yeastForm || "instant",

      yeastPct: n(data.yeastPct, 0),

      prefermentType: data.prefermentType || "none",
      prefermentFlourPct: n(data.prefermentFlourPct, 0),
      prefermentHydrationPct: n(data.prefermentHydrationPct, 100),
      prefermentYeastPct: n(data.prefermentYeastPct, 0),

      roomTemp,
      warmFermentationHours,
      coldFermentationHours,
      productionMode,

      doughType: profileData.isEnriched ? "enriched" : "lean",
    });

    setRecipeData({
      ...calculated,

      // Сохраняем исходные значения формы отдельно от результата в граммах.
      // Они нужны для корректного возврата в RecipeInput.
      _input: { ...data },

      // UI-state, не часть расчётного ядра
      mode: data.mode ?? "flour",
      targetDoughWeight: n(data.targetDoughWeight, 0),

      prefFlour: calculated.preferment.flour,
      prefLiquid: calculated.preferment.liquid,
      prefWater: calculated.preferment.water,
      prefYeast: calculated.preferment.yeast,
      prefermentTotal: calculated.preferment.total,

      _calculated: true,
    });
  };

  // ------------------------------------------------------------
  // ЭКРАНЫ
  // ------------------------------------------------------------
  if (showTechCard && techData && profileData) {
    return (
      <TechCard
        profile={profileData}
        recipe={techData}
        onSave={handleSaveEditedTechCard}
        saveNotice={saveNotice}
        onStageEdit={() => setSaveNotice(null)}
        conditions={{
          climate,
          mixing,
          productionMode,
          roomTemp,
          warmFermentationHours,
          coldFermentationHours,
        }}
        onBack={handleBackFromTechCard}
      />
    );
  }

  if (selectedProfile && profileData && recipeData?._calculated) {
    return (
      <RecipeOutput
        profileId={selectedProfile}
        profile={profileData}
        data={recipeData}
        onBack={handleBackToInput}
        onRestart={handleRestart}
        onShowTechCard={handleShowTechCard}
        onSaveAsCustom={handleSaveAsCustom}
      />
    );
  }

  if (selectedCustomRecipeId) {
    const recipeObj = customRecipes.find((r) => r.id === selectedCustomRecipeId);

    if (!recipeObj) {
      setSelectedCustomRecipeId(null);
      return null;
    }

    if (showSavedTechCard) {
      return (
        <TechCard
          profile={recipeObj.profile}
          recipe={recipeObj.recipe}
          conditions={recipeObj.conditions}
          initialDurationEdits={recipeObj.technology?.durationEdits ?? {}}
          onSave={(edits) => handleSaveExistingTechCard(recipeObj.id, edits)}
          saveNotice={saveNotice}
          onStageEdit={() => setSaveNotice(null)}
          savedCard
          savedTitle={recipeObj.name}
          onBack={() => {
            setShowSavedTechCard(false);
            setSelectedCustomRecipeId(null);
            setFocusMyRecipes(true);
          }}
        />
      );
    }

    return (
      <CustomRecipeView
        name={recipeObj.name}
        recipe={recipeObj.recipe}
        profile={recipeObj.profile}
        conditions={recipeObj.conditions}
        onOpenTechCard={() => setShowSavedTechCard(true)}
        onBack={() => setSelectedCustomRecipeId(null)}
      />
    );
  }

  if (selectedProfile && profileData && recipeData) {
    return (
      <RecipeInput
        profileId={selectedProfile}
        onBack={handleRestart}
        onCalculate={handleCalculate}
        initialValues={recipeData}
        profile={profileData}
      />
    );
  }

  return (
    <StartScreen
      climate={climate}
      mixing={mixing}
      productionMode={productionMode}
      roomTemp={roomTemp}
      warmFermentationHours={warmFermentationHours}
      coldFermentationHours={coldFermentationHours}
      onClimateChange={setClimate}
      onMixingChange={setMixing}
      onProductionModeChange={setProductionMode}
      onRoomTempChange={setRoomTemp}
      onWarmFermentationChange={setWarmFermentationHours}
      onColdFermentationChange={setColdFermentationHours}
      onProfileSelect={handleProfileSelect}
      customRecipes={customRecipes}
      focusMyRecipes={focusMyRecipes}
      onMyRecipesFocused={() => setFocusMyRecipes(false)}
      onOpenCustomRecipe={handleOpenCustomRecipe}
      onDeleteCustomRecipe={handleDeleteCustomRecipe}
    />
  );
}

export default App;