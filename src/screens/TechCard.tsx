import React from "react";
import { useAppContext } from "../context/AppContext";

type ScheduleStep = {
  action: string;
  timeFromStartMinutes: number;
  comment?: string;
};

type TechCardProps = {
  profile: any; // нормализованный профиль
  recipe: any; // includes measured preferment and final-mix allocations
  onBack: () => void;
};

// Форматирование времени
function formatTime(hoursFloat: number) {
  const hours = Math.floor(hoursFloat);
  const minutes = Math.round((hoursFloat - hours) * 60);

  if (hoursFloat < 2) {
    return `${hours * 60 + minutes} мин`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Универсальная секция
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginBottom: "32px" }}>
    <h2 style={{ marginBottom: "12px" }}>{title}</h2>
    {children}
  </section>
);

const TechCard: React.FC<TechCardProps> = ({ profile, recipe, onBack }) => {
  const { roomTemp, climate, mixing } = useAppContext();
  // Current calculation result contains ingredient allocations, while older
  // tech cards expected fermentation timings. Use the profile schedule as
  // an explicit fallback rather than crashing or fabricating derived timings.
  const effectivePrefermentHours = recipe?.effectivePrefermentHours;
  const fermentation = recipe?.fermentation ?? {
    bulkHours: Number(profile?.schedule?.bulk?.totalHours ?? 0),
    proofHours: Number(profile?.schedule?.finalProof?.totalHours ?? 0),
    totalHours: 0,
    notes: [],
  };
  const formatGr = (v: number) =>
    `${Number(v || 0).toLocaleString("ru-RU", { maximumFractionDigits: 3 })} г`;
  const ingredientAllocation = () =>
    recipe?.preferment?.flour > 0 ? (
      <>
        <Section title="Закладка предфермента">
          <p>Мука: <strong>{formatGr(recipe.preferment.flour)}</strong></p>
          <p>Жидкость: <strong>{formatGr(recipe.preferment.liquid)}</strong></p>
          <p>Дрожжи: <strong>{formatGr(recipe.preferment.yeast)}</strong></p>
        </Section>
        <Section title="Основной замес (без уже подготовленного предфермента)">
          <p>Мука: <strong>{formatGr(recipe.finalFlour)}</strong></p>
          <p>Жидкость: <strong>{formatGr(recipe.finalLiquid)}</strong></p>
          <p>Дрожжи: <strong>{formatGr(recipe.finalYeast)}</strong></p>
          <p>Соль: <strong>{formatGr(recipe.salt)}</strong></p>
          <p>Сахар: <strong>{formatGr(recipe.sugar)}</strong></p>
          <p>Жиры: <strong>{formatGr(recipe.fat)}</strong></p>
          <p>Яйца: <strong>{formatGr(recipe.eggsGr)}</strong></p>
        </Section>
      </>
    ) : null;

  const [mode, setMode] = React.useState<"compact" | "timeline" | "full">(
    "compact"
  );

  // ------------------------------------------------------------
  // 1. COMPACT MODE
  // ------------------------------------------------------------
  const renderCompact = () => (
    <>
      <Section title="Условия">
        <p>Климат: <strong>{climate}</strong></p>
        <p>Замес: <strong>{mixing}</strong></p>
        <p>Температура помещения: <strong>{roomTemp}°C</strong></p>
      </Section>

      {profile.preferment.enabled && (
        <Section title="Предфермент">
          <p>Тип: <strong>{profile.preferment.type}</strong></p>
          {typeof effectivePrefermentHours === "number" && <p>Эквивалентное время: <strong>{formatTime(effectivePrefermentHours)}</strong></p>}
        </Section>
      )}

      {ingredientAllocation()}

      <Section title="Основное брожение">
        <p><strong>{formatTime(fermentation.bulkHours)}</strong> при {roomTemp}°C</p>
      </Section>

      {profile.schedule.bulk.steps.map((step: ScheduleStep, i: number) => (
        <p key={i}>
          {step.action} — {formatTime(step.timeFromStartMinutes / 60)}
        </p>
      ))}

      {profile.schedule.coldRetard?.enabled && (
        <Section title="Холодная ферментация">
          <p>
            <strong>{formatTime(profile.schedule.coldRetard.hours)}</strong> при{" "}
            {profile.schedule.coldRetard.temperature}°C
          </p>
        </Section>
      )}

      <Section title="Финальная расстойка">
        <p>
          <strong>{formatTime(fermentation.proofHours)}</strong> при {roomTemp}°C
        </p>
      </Section>

      <Section title="Выпечка">
        <p>
          {profile.bake.temperature}°C, {profile.bake.timeMinutes} мин
        </p>
      </Section>
    </>
  );

  // ------------------------------------------------------------
  // 2. TIMELINE MODE
  // ------------------------------------------------------------
  const renderTimeline = () => {
    const timeline: { time: string; label: string; comment?: string }[] = [];

    // Автолиз
    if (profile.schedule.autolyse?.enabled) {
      timeline.push({
        time: "0:00",
        label: `Автолиз (${profile.schedule.autolyse.minutes} мин)`,
      });
    }

    // Bulk steps
    profile.schedule.bulk.steps.forEach((step: ScheduleStep) => {
      timeline.push({
        time: formatTime(step.timeFromStartMinutes / 60),
        label: step.action,
        comment: step.comment,
      });
    });

    // End of bulk
    timeline.push({
      time: formatTime(fermentation.bulkHours),
      label: "Конец основного брожения",
    });

    // Cold retard
    if (profile.schedule.coldRetard?.enabled) {
      timeline.push({
        time: formatTime(fermentation.bulkHours),
        label: `Холодная ферментация (${formatTime(
          profile.schedule.coldRetard.hours
        )})`,
      });
    }

    // Proof
    timeline.push({
      time: formatTime(
        fermentation.bulkHours +
          (profile.schedule.coldRetard?.hours ?? 0)
      ),
      label: `Финальная расстойка (${formatTime(fermentation.proofHours)})`,
    });

    // Bake
    timeline.push({
      time: formatTime(
        fermentation.bulkHours +
          (profile.schedule.coldRetard?.hours ?? 0) +
          fermentation.proofHours
      ),
      label: `Выпечка (${profile.bake.temperature}°C, ${profile.bake.timeMinutes} мин)`,
    });

    return (
      <Section title="Таймлайн процесса">
        <div style={{ borderLeft: "2px solid #000", paddingLeft: "16px" }}>
          {timeline.map((item, i) => (
            <div key={i} style={{ marginBottom: "20px" }}>
              <div style={{ fontWeight: 600 }}>{item.time}</div>
              <div>{item.label}</div>
              {item.comment && (
                <div style={{ fontSize: "14px", color: "#555" }}>
                  {item.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    );
  };

  // ------------------------------------------------------------
  // 3. FULL MODE
  // ------------------------------------------------------------
  const renderFull = () => (
    <>
      <Section title="Условия">
        <p>Климат: <strong>{climate}</strong></p>
        <p>Замес: <strong>{mixing}</strong></p>
        <p>Температура помещения: <strong>{roomTemp}°C</strong></p>

        {profile.uiHints?.notesForBaker && (
          <ul style={{ marginTop: "12px" }}>
            {profile.uiHints.notesForBaker.map((n: string, i: number) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        )}
      </Section>

      {profile.preferment.enabled && (
        <Section title="Предфермент">
          <p>Тип: <strong>{profile.preferment.type}</strong></p>
          {typeof effectivePrefermentHours === "number" && <p>Эквивалентное время: <strong>{formatTime(effectivePrefermentHours)}</strong></p>}
        </Section>
      )}

      {profile.schedule.autolyse?.enabled && (
        <Section title="Автолиз">
          <p>
            Время: <strong>{profile.schedule.autolyse.minutes} мин</strong>
            <br />
            Температура: <strong>{roomTemp}°C</strong>
          </p>
        </Section>
      )}

      {ingredientAllocation()}

      <Section title="Основное брожение">
        <p>
          Длительность: <strong>{formatTime(fermentation.bulkHours)}</strong>
          <br />
          Температура: <strong>{roomTemp}°C</strong>
        </p>

        {profile.schedule.bulk.steps.map((step: ScheduleStep, i: number) => (
          <div key={i} style={{ marginTop: "8px" }}>
            <strong>{step.action}</strong> —{" "}
            {formatTime(step.timeFromStartMinutes / 60)}
            {step.comment && <div>{step.comment}</div>}
          </div>
        ))}
      </Section>

      {profile.schedule.coldRetard?.enabled && (
        <Section title="Холодная ферментация">
          <p>
            Длительность:{" "}
            <strong>{formatTime(profile.schedule.coldRetard.hours)}</strong>
            <br />
            Температура:{" "}
            <strong>{profile.schedule.coldRetard.temperature}°C</strong>
          </p>
        </Section>
      )}

      <Section title="Финальная расстойка">
        <p>
          Длительность: <strong>{formatTime(fermentation.proofHours)}</strong>
          <br />
          Температура: <strong>{roomTemp}°C</strong>
        </p>
      </Section>

      <Section title="Выпечка">
        <p>
          Температура: <strong>{profile.bake.temperature}°C</strong>
          <br />
          Время: <strong>{profile.bake.timeMinutes} мин</strong>
        </p>
      </Section>
    </>
  );

  // ------------------------------------------------------------
  // MAIN RENDER
  // ------------------------------------------------------------
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <button onClick={onBack} style={{ marginBottom: "16px" }}>
        ← Назад
      </button>

      <h1 style={{ marginBottom: "24px" }}>{profile.name}</h1>

      {/* Переключатель режимов */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => setMode("compact")}
          style={{
            padding: "8px 12px",
            border: mode === "compact" ? "2px solid #000" : "1px solid #ccc",
            borderRadius: "6px",
            background: mode === "compact" ? "#f0f0f0" : "transparent",
            cursor: "pointer",
          }}
        >
          Компактный
        </button>

        <button
          onClick={() => setMode("timeline")}
          style={{
            padding: "8px 12px",
            border: mode === "timeline" ? "2px solid #000" : "1px solid #ccc",
            borderRadius: "6px",
            background: mode === "timeline" ? "#f0f0f0" : "transparent",
            cursor: "pointer",
          }}
        >
          Таймлайн
        </button>

        <button
          onClick={() => setMode("full")}
          style={{
            padding: "8px 12px",
            border: mode === "full" ? "2px solid #000" : "1px solid #ccc",
            borderRadius: "6px",
            background: mode === "full" ? "#f0f0f0" : "transparent",
            cursor: "pointer",
          }}
        >
          Полный
        </button>
      </div>

      {/* Режимы */}
      {mode === "compact" && renderCompact()}
      {mode === "timeline" && renderTimeline()}
      {mode === "full" && renderFull()}
    </div>
  );
};

export default TechCard;
