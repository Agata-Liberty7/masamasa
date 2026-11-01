// Profile-specific technological instructions are stored in Russian in JSON.
// Use this explicit translation map when rendering TechCard in EN/ES.
// Never change numeric quantities, times, or source profiles here.

type Language = "ru" | "en" | "es";

const profileTranslations: Record<string, { en: string; es: string }> = {
  "low": {
    "en": "Low",
    "es": "Baja"
  },
  "medium": {
    "en": "Medium",
    "es": "Media"
  },
  "high": {
    "en": "High",
    "es": "Alta"
  },
  "none": {
    "en": "Not applicable",
    "es": "No aplicable"
  },
  "пальцевый тест": {
    "en": "Finger-poke test",
    "es": "Prueba de presión con el dedo"
  },
  "почти готово, но не перекисшее": {
    "en": "Nearly proofed, but not overfermented",
    "es": "Casi lista, sin sobrefermentar"
  },
  "короткая, чтобы сохранить подпружинивание": {
    "en": "Brief proof to preserve oven spring",
    "es": "Fermentación final corta para conservar el impulso en el horno"
  },
  "Автолиз": {
    "en": "Autolyse",
    "es": "Autólisis"
  },
  "Добавление соли": {
    "en": "Add salt",
    "es": "Incorporar la sal"
  },
  "Добавление соли и сахара": {
    "en": "Add salt and sugar",
    "es": "Incorporar la sal y el azúcar"
  },
  "Добавление соли и жиров": {
    "en": "Add salt and fat",
    "es": "Incorporar la sal y las grasas"
  },
  "Добавление соли и масла": {
    "en": "Add salt and oil",
    "es": "Incorporar la sal y el aceite"
  },
  "Складка": {
    "en": "Fold",
    "es": "Pliegue"
  },
  "Короткий автолиз — 10–15 минут.": {
    "en": "Short autolyse, 10–15 minutes.",
    "es": "Autólisis corta, de 10 a 15 minutos."
  },
  "Замешиваем до сильной клейковины.": {
    "en": "Mix until strong gluten development.",
    "es": "Amasar hasta lograr un desarrollo intenso del gluten."
  },
  "Мука + вода, 20–30 минут.": {
    "en": "Flour and water, 20–30 minutes.",
    "es": "Harina y agua, de 20 a 30 minutos."
  },
  "Замешиваем до средней клейковины.": {
    "en": "Mix to moderate gluten development.",
    "es": "Amasar hasta lograr un desarrollo medio del gluten."
  },
  "Одна складка для укрепления структуры.": {
    "en": "One fold to strengthen the dough structure.",
    "es": "Un pliegue para reforzar la estructura de la masa."
  },
  "Короткий замес, не развивать клейковину полностью.": {
    "en": "Mix briefly; do not fully develop the gluten.",
    "es": "Amasar brevemente, sin desarrollar el gluten por completo."
  },
  "Вторая складка — для формирования крупных пор.": {
    "en": "A second fold to encourage large air pockets.",
    "es": "Un segundo pliegue para favorecer alveolos grandes."
  },
  "Мука + вода без соли и жиров.": {
    "en": "Flour and water without salt or fat.",
    "es": "Harina y agua, sin sal ni grasas."
  },
  "10–20 минут.": {
    "en": "10–20 minutes.",
    "es": "De 10 a 20 minutos."
  },
  "Вмешиваем до средней клейковины.": {
    "en": "Incorporate until moderate gluten development.",
    "es": "Incorporar hasta lograr un desarrollo medio del gluten."
  },
  "Перед выпечкой бейглы нужно отварить 30–60 секунд.": {
    "en": "Boil the bagels for 30–60 seconds before baking.",
    "es": "Hervir los bagels de 30 a 60 segundos antes de hornearlos."
  },
  "Добавьте в воду мёд или патоку для блеска.": {
    "en": "Add honey or molasses to the boiling water for a glossy finish.",
    "es": "Añadir miel o melaza al agua de cocción para dar brillo."
  },
  "Тесто должно быть очень плотным.": {
    "en": "The dough should be very firm.",
    "es": "La masa debe quedar muy firme."
  },
  "Не передерживайте на расстойке.": {
    "en": "Do not overproof.",
    "es": "No dejar fermentar en exceso."
  },
  "Температура теста после замеса: 24–25°C.": {
    "en": "Dough temperature after mixing: 24–25°C.",
    "es": "Temperatura de la masa después del amasado: 24–25 °C."
  },
  "Используйте пар первые 10 минут выпечки.": {
    "en": "Use steam during the first 10 minutes of baking.",
    "es": "Usar vapor durante los primeros 10 minutos de horneado."
  },
  "Не пересыпайте мукой при формовке.": {
    "en": "Avoid using too much flour during shaping.",
    "es": "No añadir harina en exceso durante el formado."
  },
  "Делайте продольные надрезы под углом 30°.": {
    "en": "Score lengthwise at a 30° angle.",
    "es": "Hacer cortes longitudinales con un ángulo de 30°."
  },
  "Не передерживайте на расстойке — багет потеряет подпружинивание.": {
    "en": "Do not overproof; the baguette will lose oven spring.",
    "es": "No fermentar en exceso; la baguette perderá su impulso en el horno."
  },
  "Температура теста после замеса: 24–26°C.": {
    "en": "Dough temperature after mixing: 24–26°C.",
    "es": "Temperatura de la masa después del amasado: 24–26 °C."
  },
  "Для хрустящей корки используйте пар в начале выпечки.": {
    "en": "Use steam at the start of baking for a crisp crust.",
    "es": "Usar vapor al comienzo del horneado para obtener una corteza crujiente."
  },
  "Лучше недомесить, чем перемесить.": {
    "en": "It is better to undermix than to overmix.",
    "es": "Es preferible quedarse corto de amasado que amasar en exceso."
  },
  "Заваривание муки водой и жиром — ключевой этап.": {
    "en": "Cooking the flour with water and fat is the key step.",
    "es": "Cocer la harina con agua y grasa es el paso clave."
  },
  "Яйца добавляются по консистенции, не по формуле.": {
    "en": "Add the eggs according to dough consistency, not a fixed formula.",
    "es": "Añadir los huevos según la consistencia, no solo según la fórmula."
  },
  "Не открывать духовку в первые 15 минут выпечки.": {
    "en": "Do not open the oven during the first 15 minutes of baking.",
    "es": "No abrir el horno durante los primeros 15 minutos de cocción."
  },
  "Температура теста после замеса: 23–24°C.": {
    "en": "Dough temperature after mixing: 23–24°C.",
    "es": "Temperatura de la masa después del amasado: 23–24 °C."
  },
  "Чиабатта любит высокую гидратацию — не бойтесь липкости.": {
    "en": "Ciabatta needs high hydration; a sticky dough is normal.",
    "es": "La chapata necesita alta hidratación; una masa pegajosa es normal."
  },
  "Не пересыпайте мукой — это убивает пористость.": {
    "en": "Avoid excessive flour; it reduces the open crumb structure.",
    "es": "Evitar el exceso de harina; reduce el alveolado de la miga."
  },
  "Формовка минимальная: только аккуратное растяжение.": {
    "en": "Shape as little as possible; stretch gently.",
    "es": "Formado mínimo: estirar la masa con suavidad."
  },
  "Пар в начале выпечки улучшает корку.": {
    "en": "Steam at the start of baking improves the crust.",
    "es": "El vapor al inicio del horneado mejora la corteza."
  },
  "Следите за температурой теста.": {
    "en": "Monitor the dough temperature.",
    "es": "Controlar la temperatura de la masa."
  },
  "Корректируйте воду по ощущению.": {
    "en": "Adjust the water based on how the dough feels.",
    "es": "Ajustar el agua según la consistencia de la masa."
  },
  "Перед выпечкой — обильно смазать оливковым маслом.": {
    "en": "Brush generously with olive oil before baking.",
    "es": "Untar generosamente con aceite de oliva antes de hornear."
  },
  "Можно добавить розмарин, маслины, томаты — по вкусу.": {
    "en": "Add rosemary, olives or tomatoes to taste.",
    "es": "Se puede añadir romero, aceitunas o tomates al gusto."
  },
  "Раскатывать равномерно — толщина влияет на карман.": {
    "en": "Roll evenly; thickness affects pocket formation.",
    "es": "Estirar uniformemente; el grosor influye en la formación del bolsillo."
  },
  "Выпекать очень быстро при высокой температуре.": {
    "en": "Bake very quickly at a high temperature.",
    "es": "Hornear muy rápidamente a temperatura alta."
  },
  "Не пересушивать — иначе не вздуется.": {
    "en": "Do not dry out the dough or it may fail to puff.",
    "es": "No resecar la masa o podría no inflarse."
  },
  "Лучше печь на камне или стали.": {
    "en": "A baking stone or steel is preferable.",
    "es": "Es preferible hornear sobre piedra o acero."
  },
  "Температура теста после замеса: 23–25°C.": {
    "en": "Dough temperature after mixing: 23–25°C.",
    "es": "Temperatura de la masa después del amasado: 23–25 °C."
  },
  "Для неаполитанской пиццы гидратация обычно 60–65%.": {
    "en": "Neapolitan pizza typically uses 60–65% hydration.",
    "es": "La pizza napolitana suele tener una hidratación del 60–65 %."
  },
  "Холодная ферментация даёт лучший вкус.": {
    "en": "Cold fermentation improves flavour.",
    "es": "La fermentación en frío mejora el sabor."
  },
  "Используйте технику растяжки и складывания для лучшей структуры.": {
    "en": "Use stretch-and-fold to improve dough structure.",
    "es": "Usar la técnica de estirar y plegar para mejorar la estructura de la masa."
  },
  "Используйте пар в начале выпечки.": {
    "en": "Use steam at the beginning of baking.",
    "es": "Usar vapor al comienzo del horneado."
  },
  "Корректируйте воду по ощущениям.": {
    "en": "Adjust the water according to the dough consistency.",
    "es": "Ajustar el agua según la consistencia de la masa."
  },
  "Не перегревать масло при замесе.": {
    "en": "Do not let the butter get too warm during mixing.",
    "es": "Evitar que la mantequilla se caliente demasiado durante el amasado."
  },
  "Работать быстро, чтобы тесто не таяло.": {
    "en": "Work quickly so the dough does not soften excessively.",
    "es": "Trabajar rápido para que la masa no se ablande demasiado."
  },
  "Охлаждать перед раскаткой.": {
    "en": "Chill before rolling out.",
    "es": "Refrigerar antes de estirar la masa."
  }
};

export function translateProfileText(value: unknown, lang: Language): string {
  const text = typeof value === "string" ? value : String(value ?? "");
  if (lang === "ru") return text;
  return profileTranslations[text]?.[lang] ?? text;
}
