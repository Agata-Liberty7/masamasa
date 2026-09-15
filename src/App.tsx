import { useState } from "react";
import { useAppContext } from "./context/AppContext";

import StartScreen from "./screens/StartScreen";
import RecipeInput from "./screens/RecipeInput";
import RecipeOutput from "./screens/RecipeOutput";
import TechCard from "./screens/TechCard";
import CustomRecipeView from "./screens/CustomRecipeView";

import { loadProfile } from "./logic/profileLoader";
import { calculateRecipe } from "./logic/calculateRecipe";

function App() {
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

  const n = (value: unknown, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  // ------------------------------------------------------------
  // 1. Открытие кастомного рецепта
  // ------------------------------------------------------------
  const handleOpenCustomRecipe = (id: string) => {
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
      yeastForm: "instant",
    });

    setSelectedProfile(profileId);
    setProfileData(loaded);

    setRecipeData({
      mode: "flour",
      targetDoughWeight: 0,

      flour: loaded?.base?.flour ?? 1000,
      hydration: loaded?.base?.hydration ?? 60,
      salt: loaded?.base?.salt ?? 2,
      sugar: loaded?.base?.sugar ?? 0,
      fat: loaded?.base?.fat ?? 0,
      eggsPct: loaded?.base?.eggs ?? 0,

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
  const handleSaveAsCustom = (calculatedRecipe: any) => {
    if (!profileData || !calculatedRecipe) return;

    const name = prompt("Введите название рецепта");
    if (!name) return;

    const newRecipe = {
      id: crypto.randomUUID(),
      name,
      recipe: calculatedRecipe,
      profile: profileData,
      conditions: {
        climate,
        mixing,
        productionMode,
        roomTemp,
        warmFermentationHours,
        coldFermentationHours,
      },
      timestamp: Date.now(),
    };

    const updated = [...customRecipes, newRecipe];
    localStorage.setItem("customRecipes", JSON.stringify(updated));
    setCustomRecipes(updated);
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

      hydration: n(data.hydration, 0),
      liquidType: data.liquidType || "water",

      salt: n(data.salt, 0),
      sugar: n(data.sugar, 0),
      fat: n(data.fat, 0),

      // Новый стандарт: яйца — % от массы муки.
      eggsPct: n(data.eggsPct, 0),

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

    return (
      <CustomRecipeView
        name={recipeObj.name}
        recipe={recipeObj.recipe}
        profile={recipeObj.profile}
        conditions={recipeObj.conditions}
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
      onOpenCustomRecipe={handleOpenCustomRecipe}
      onDeleteCustomRecipe={handleDeleteCustomRecipe}
    />
  );
}

export default App;