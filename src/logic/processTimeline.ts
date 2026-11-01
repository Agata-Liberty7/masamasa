// A production timeline derived from the selected conditions and the profile.
// Schedule steps inside bulk fermentation are NOT summed again. No guessed times.
export type StageSource = "conditions" | "profile";
export type StageKind = "active" | "passive" | "thermal";
export type StageId =
  | "preferment" | "autolyse" | "panade" | "cool" | "mix" | "warm" | "cold" | "chill" | "rest" | "stretch" | "shape"
  | "proof" | "bake" | "fry";

export type TimelineStage = {
  id: StageId;
  kind: StageKind;
  source: StageSource;
  minMinutes: number | null;
  maxMinutes: number | null;
  note?: "review" | "working_proof";
};

export type ProductionTimeline = {
  stages: TimelineStage[];
  knownMinMinutes: number;
  knownMaxMinutes: number;
  activeMinMinutes: number;
  activeMaxMinutes: number;
  passiveMinMinutes: number;
  passiveMaxMinutes: number;
  thermalMinMinutes: number;
  thermalMaxMinutes: number;
  unknownStageIds: StageId[];
  warmForYeastHours: number;
  coldForYeastHours: number;
  yeastModelNeedsReview: boolean;
};

type Inputs = {
  warmFermentationHours: number;
  coldFermentationHours: number;
  mixing: string;
};

function minutesFromHours(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value * 60)
    : null;
}

function minutesFromMinutes(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : null;
}

export function buildProductionTimeline(
  profile: any,
  settings: Inputs,
  hasFermentation: boolean,
  hasPreferment = false,
): ProductionTimeline {
  const stages: TimelineStage[] = [];
  const append = (stage: TimelineStage) => { stages.push(stage); };
  if (hasPreferment) {
    const preferred = minutesFromHours(profile?.schedule?.preferment?.totalHours);
    append({ id: "preferment", kind: "passive", source: "profile", minMinutes: preferred, maxMinutes: preferred });
  }
  if (profile?.schedule?.autolyse?.enabled) {
    const autolyse = minutesFromMinutes(profile.schedule.autolyse.minutes);
    append({ id: "autolyse", kind: "passive", source: "profile", minMinutes: autolyse, maxMinutes: autolyse });
  }
  // MASAMASA_CHOUX_PROCESS_V1: heating and cooling the panade precede egg incorporation.
  // Separate stages are shown only for choux; their times remain editable estimates.
  if (profile?.id === "choux") {
    const panade = minutesFromMinutes(profile?.process?.panade?.minutes);
    append({ id: "panade", kind: "thermal", source: "profile", minMinutes: panade, maxMinutes: panade, note: "review" });
    const cooling = minutesFromMinutes(profile?.schedule?.coolAfterPanade?.minutes);
    append({ id: "cool", kind: "passive", source: "profile", minMinutes: cooling, maxMinutes: cooling, note: "review" });
  }
  const mix = profile?.process?.mixingTime?.[settings.mixing];
  const mixingMin = minutesFromMinutes(mix?.min);
  const mixingMax = minutesFromMinutes(mix?.max);
  append({
    id: "mix", kind: "active", source: "profile",
    minMinutes: mixingMin,
    maxMinutes: mixingMax !== null && mixingMin !== null ? Math.max(mixingMin, mixingMax) : mixingMin,
  });

  const warm = minutesFromHours(settings.warmFermentationHours);
  const cold = minutesFromHours(settings.coldFermentationHours);
  if (hasFermentation) {
    if (warm !== null && warm > 0) {
      append({ id: "warm", kind: "passive", source: "conditions", minMinutes: warm, maxMinutes: warm });
    }
    if (cold !== null && cold > 0) {
      append({ id: "cold", kind: "passive", source: "conditions", minMinutes: cold, maxMinutes: cold });
    }
  }

  // Chilling shortcrust before rolling is a profile stage, not yeast fermentation.
  if (!hasFermentation && profile?.id === "shortcrust" && profile?.schedule?.coldRetard?.enabled) {
    const chill = minutesFromHours(profile.schedule.coldRetard.hours);
    append({ id: "chill", kind: "passive", source: "profile", minMinutes: chill, maxMinutes: chill });
  }

  // Only duration explicitly recorded by profile is counted. Optional rest
  // supports future profiles without changing the calculation engine.
  const rest = minutesFromMinutes(profile?.schedule?.rest?.minutes);
  if (rest !== null && rest > 0) {
    append({ id: "rest", kind: "passive", source: "profile", minMinutes: rest, maxMinutes: rest });
  } else if (profile?.id === "ensaimada") {
    append({ id: "rest", kind: "passive", source: "profile", minMinutes: null, maxMinutes: null });
  }

  if (profile?.id === "ensaimada") {
    const stretch = minutesFromMinutes(profile?.schedule?.stretch?.minutes);
    append({ id: "stretch", kind: "active", source: "profile", minMinutes: stretch, maxMinutes: stretch, note: "review" });
  }
  // Dividing, rolling or piping is required before final proof or finishing.
  // Profiles do not yet specify its duration; never invent one.
  const shape = minutesFromMinutes(profile?.schedule?.shape?.minutes);
  append({ id: "shape", kind: "active", source: "profile", minMinutes: shape, maxMinutes: shape, note: "review" });

  if (hasFermentation) {
    const proof = minutesFromHours(profile?.schedule?.finalProof?.totalHours);
    append({
      id: "proof", kind: "passive", source: "profile",
      minMinutes: proof, maxMinutes: proof,
      note: profile?.id === "ensaimada" ? "working_proof" : "review",
    });
  }

  const finishTime = minutesFromMinutes(profile?.bake?.timeMinutes);
  const finishTemp = Number(profile?.bake?.temperature ?? 0);
  const fried = ["donuts", "belyashi", "chebureki"].includes(profile?.id);
  append({
    id: fried ? "fry" : "bake", kind: "thermal", source: "profile",
    minMinutes: finishTemp > 0 && finishTime !== null && finishTime > 0 ? finishTime : null,
    maxMinutes: finishTemp > 0 && finishTime !== null && finishTime > 0 ? finishTime : null,
    note: "review",
  });

  const sumMin = (kind?: StageKind) => stages.reduce(
    (sum, step) => sum + (kind === undefined || step.kind === kind ? (step.minMinutes ?? 0) : 0), 0
  );
  const sumMax = (kind?: StageKind) => stages.reduce(
    (sum, step) => sum + (kind === undefined || step.kind === kind ? (step.maxMinutes ?? 0) : 0), 0
  );
  const proofHours = hasFermentation
    ? (minutesFromHours(profile?.schedule?.finalProof?.totalHours) ?? 0) / 60
    : 0;
  const warmHours = hasFermentation ? (warm ?? 0) / 60 : 0;
  const coldHours = hasFermentation ? (cold ?? 0) / 60 : 0;
  return {
    stages,
    knownMinMinutes: sumMin(), knownMaxMinutes: sumMax(),
    activeMinMinutes: sumMin("active"), activeMaxMinutes: sumMax("active"),
    passiveMinMinutes: sumMin("passive"), passiveMaxMinutes: sumMax("passive"),
    thermalMinMinutes: sumMin("thermal"), thermalMaxMinutes: sumMax("thermal"),
    unknownStageIds: stages.filter((stage) => stage.minMinutes === null || stage.maxMinutes === null).map((stage) => stage.id),
    // Exposed for future yeast-model calibration. The current model only
    // distinguishes <=1 h and >=4 h and cannot model a 12-hour proof reliably.
    warmForYeastHours: warmHours + proofHours,
    coldForYeastHours: coldHours,
    yeastModelNeedsReview: hasFermentation && proofHours > 0,
  };
}

// A production plan is a local TechCard adjustment, NOT a yeast recalculation.
// Empty input for a previously unknown stage remains unknown.
export type StageTimeFields = { hours: string; minutes: string };
export type StageTimeEdits = Partial<Record<StageId, StageTimeFields>>;

export function stageDefaultMinutes(stage: TimelineStage): number | null {
  if (stage.minMinutes === null || stage.maxMinutes === null) return null;
  return Math.round((stage.minMinutes + stage.maxMinutes) / 2);
}

function parseTimeFields(value: StageTimeFields): number | null {
  const { hours, minutes } = value;
  if (hours.trim() === "" && minutes.trim() === "") return null;
  const h = hours.trim() === "" ? 0 : Number(hours);
  const m = minutes.trim() === "" ? 0 : Number(minutes);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || m < 0 || m > 59) return null;
  const duration = h * 60 + m;
  return duration <= 10080 ? duration : null;
}

export function planProductionTimeline(
  timeline: ProductionTimeline,
  edits: StageTimeEdits,
): ProductionTimeline {
  const stages = timeline.stages.map((stage): TimelineStage => {
    if (stage.source !== "profile") return stage;
    const manual = edits[stage.id];
    // An explicit empty/invalid manual edit never creates a fictitious duration.
    const duration = manual === undefined ? stageDefaultMinutes(stage) : parseTimeFields(manual);
    return { ...stage, minMinutes: duration, maxMinutes: duration };
  });
  const sum = (kind?: StageKind) => stages.reduce((total, stage) =>
    total + (kind === undefined || stage.kind === kind ? (stage.minMinutes ?? 0) : 0), 0);
  const proof = stages.find((stage) => stage.id === "proof");
  const proofModified = Object.prototype.hasOwnProperty.call(edits, "proof");
  const configuredWarm = stages.find((stage) => stage.id === "warm")?.minMinutes ?? 0;
  const configuredCold = stages.find((stage) => stage.id === "cold")?.minMinutes ?? 0;
  return {
    ...timeline,
    stages,
    knownMinMinutes: sum(),
    knownMaxMinutes: sum(),
    activeMinMinutes: sum("active"),
    activeMaxMinutes: sum("active"),
    passiveMinMinutes: sum("passive"),
    passiveMaxMinutes: sum("passive"),
    thermalMinMinutes: sum("thermal"),
    thermalMaxMinutes: sum("thermal"),
    unknownStageIds: stages.filter((step) => step.minMinutes === null).map((step) => step.id),
    warmForYeastHours: configuredWarm / 60 + (proof?.minMinutes ?? 0) / 60,
    coldForYeastHours: configuredCold / 60,
    yeastModelNeedsReview: timeline.yeastModelNeedsReview || proofModified,
  };
}
