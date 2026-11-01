// MasaMasa technological process sequences: initial review candidates.
// IMPORTANT: These are descriptive steps, not an automated mixing model.
// Validate ingredient timing and product-specific parameters before release.
export type ProtocolLocale = "ru" | "en" | "es";

type LocalizedText = Record<ProtocolLocale, string>;
export type TechnologyProtocol = {
  stage: "review";
  steps: Record<ProtocolLocale, string[]>;
  warning: LocalizedText;
  finish?: LocalizedText;
};

const commonWarning: LocalizedText = {
  ru: "Предварительная схема для технологической проверки. Порядок операций не меняет расчёт ингредиентов; времена замеса и брожения остаются ориентирами из профиля.",
  en: "Preliminary process for technical review. The sequence does not change calculated ingredients; mixing and fermentation times remain profile estimates.",
  es: "Secuencia preliminar pendiente de revisión técnica. No modifica los ingredientes calculados; los tiempos de amasado y fermentación siguen siendo orientativos.",
};

const protocols: Record<string, TechnologyProtocol> = {
  choux: {
    stage: "review",
    steps: {
      ru: [
        "Воду, сливочное масло и соль нагреть до кипения и полного расплавления масла.",
        "Всыпать всю муку сразу, тщательно перемешать и прогреть до образования однородной заварной основы (панады).",
        "Охладить заварную основу перед введением яиц. Время зависит от размера партии; ориентироваться на температуру массы.",
        "Вводить яйца постепенно, оценивая консистенцию. Рассчитанное количество является отправной точкой, не обязательной закладкой до последнего грамма.",
        "Отсадить заготовки и выпечь до устойчивой, просушенной оболочки. Температура и время зависят от размера изделий и печи."
      ],
      en: [
        "Heat water, butter and salt until boiling and the butter is fully melted.",
        "Add all the flour at once, mix thoroughly and cook until a smooth cohesive panade forms.",
        "Cool the panade before adding eggs. Duration depends on the batch; monitor paste temperature.",
        "Add eggs gradually to the required consistency. The calculated egg quantity is a starting estimate, not an exact mandatory dose.",
        "Pipe and bake until the shells are fully set and dry. Temperature and time depend on size and oven."
      ],
      es: [
        "Calentar el agua, la mantequilla y la sal hasta el hervor y la completa fusión de la mantequilla.",
        "Incorporar toda la harina de una vez, mezclar y cocer hasta obtener una panada homogénea.",
        "Enfriar la panada antes de añadir los huevos. El tiempo depende del lote; controlar la temperatura de la masa.",
        "Añadir los huevos gradualmente hasta alcanzar la consistencia deseada. La cantidad calculada es orientativa, no una dosis obligatoria.",
        "Escudillar y hornear hasta conseguir una corteza estable y seca. La temperatura y el tiempo dependen del tamaño y del horno."
      ],
    },
    warning: {
      ru: "Рабочая водная рецептура, адаптированная из King Arthur Baking. Времена заваривания и охлаждения являются предварительными; окончательную закладку яиц определяют по консистенции.",
      en: "Working water-based formula adapted from King Arthur Baking. Panade cooking and cooling times are preliminary; final egg addition is judged by consistency.",
      es: "Fórmula de referencia a base de agua, adaptada de King Arthur Baking. Los tiempos de cocción y enfriamiento son provisionales; la adición de huevos depende de la consistencia.",
    },
  },
  swedish_enriched: {
    stage: "review",
    steps: {
      ru: [
        "Соединить молоко и сливочное масло; нагреть лишь до полного расплавления масла и остудить до температуры, подходящей для дрожжевого замеса.",
        "Внести молочно-масляную смесь уже в первой фазе замеса вместе с мукой, сахаром, яйцами, солью, дрожжами и рассчитанным кардамоном. Отдельной поздней закладки масла нет.",
        "Замешивать до гладкой эластичной структуры, контролируя температуру теста.",
        "Дать тесту отдохнуть для расслабления клейковины, затем выполнить разделку и формовку.",
        "Провести окончательную расстойку, ориентируясь на состояние теста. Режим выпечки уточнить на производственном тесте."
      ],
      en: [
        "Combine milk and butter; warm only until the butter melts, then cool to a yeast-safe mixing temperature.",
        "Add the milk-butter mixture from the start, together with flour, sugar, eggs, salt, yeast and the calculated cardamom. No later butter-addition stage.",
        "Mix until smooth and elastic while controlling dough temperature.",
        "Rest to relax gluten, then divide and shape.",
        "Proof according to dough condition. Validate baking settings in production tests."
      ],
      es: [
        "Unir leche y mantequilla; calentar solo hasta fundir la mantequilla y enfriar a una temperatura adecuada para el amasado con levadura.",
        "Incorporar desde el inicio la mezcla de leche y mantequilla, con harina, azúcar, huevos, sal, levadura y el cardamomo calculado. No hay incorporación tardía de mantequilla.",
        "Amasar hasta obtener una masa lisa y elástica, controlando su temperatura.",
        "Dejar reposar para relajar el gluten; después dividir y formar.",
        "Fermentar hasta el estado adecuado. Validar los parámetros de horneado en pruebas de producción."
      ]
    },
    warning: {
      ru: "Рабочий профиль: состав согласован как отправная рецептура, но длительность замеса, ферментации и выпечки являются ориентировочными до производственной проверки.",
      en: "Working profile: formula is an agreed starting point; mixing, fermentation and baking durations remain provisional until production validation.",
      es: "Perfil de trabajo: la fórmula es un punto de partida acordado; los tiempos de amasado, fermentación y horneado son orientativos hasta su validación en producción."
    }
  },
  enriched: {
    stage: "review",
    steps: {
      ru: ["Подготовить компоненты по рассчитанной рецептуре.", "Замешивать до требуемого развития клейковины; контролировать температуру и пластичность теста.", "Точную последовательность введения жира согласовать для базового технологического профиля."],
      en: ["Prepare ingredients according to the calculated formula.", "Mix to the specified gluten development; monitor dough temperature and plasticity.", "Confirm the precise fat incorporation stage for this base process."],
      es: ["Preparar los ingredientes según la fórmula calculada.", "Amasar hasta el desarrollo de gluten previsto; controlar la temperatura y la plasticidad.", "Confirmar la fase exacta de incorporación de la grasa en este proceso base."],
    },
    warning: commonWarning,
  },
  brioche: {
    stage: "review",
    steps: {
      ru: ["Начать замес муки с яйцами, жидкостью и остальными компонентами основной рецептуры, кроме масла.", "Развить прочную клейковинную структуру до внесения масла.", "Вводить размягчённое масло порциями, продолжая замес до однородного эластичного теста.", "Контролировать температуру теста; применить выбранный режим ферментации."],
      en: ["Begin mixing the flour, eggs, liquid, and other main-dough ingredients, excluding butter.", "Develop a strong gluten network before adding butter.", "Add softened butter in portions and continue until the dough is smooth and elastic.", "Monitor dough temperature and follow the selected fermentation schedule."],
      es: ["Iniciar el amasado con harina, huevos, líquido y los demás ingredientes de la masa, salvo la mantequilla.", "Desarrollar una red de gluten fuerte antes de añadir la mantequilla.", "Incorporar la mantequilla blanda poco a poco y amasar hasta obtener una masa lisa y elástica.", "Controlar la temperatura de la masa y seguir el programa de fermentación elegido."],
    },
    warning: commonWarning,
  },
  cinnabon: {
    stage: "review",
    steps: {
      ru: ["Подготовить ингредиенты по базовой рецептуре мягкого сдобного теста.", "Выполнить замес до заданного уровня эластичности, избегая перегрева теста.", "Провести предусмотренные профильные стадии брожения и расстойки. Начинка и глазурь не входят в калькулятор."],
      en: ["Prepare the ingredients for the soft enriched dough formula.", "Mix to the required elasticity without overheating the dough.", "Follow the specified fermentation and proofing stages. Filling and glaze are outside the calculator."],
      es: ["Preparar los ingredientes de la fórmula de masa enriquecida blanda.", "Amasar hasta la elasticidad prevista evitando el sobrecalentamiento.", "Seguir las fases de fermentación y levado previstas. El relleno y el glaseado quedan fuera del calculador."],
    },
    warning: commonWarning,
  },
  ensaimada: {
    stage: "review",
    steps: {
      ru: ["Замесить эластичную основу, пригодную для последующего очень тонкого растягивания.", "После отдыха растянуть тесто тонким пластом, нанести рассчитанный свиной жир (саим) отдельной операцией, затем свернуть.", "Сформовать спираль и провести длительную расстойку. Для Ensaimada de Mallorca IGP справочный минимум после формования — 12 часов, но текущая рецептура не заявлена как IGP."],
      en: ["Mix an elastic base dough suitable for subsequent very thin stretching.", "After resting, stretch the dough very thin, apply the calculated soft pork lard (saim) separately, then roll it up.", "Shape the spiral and proof for an extended period. The IGP Ensaimada de Mallorca reference is at least 12 hours after shaping; this working formula is not represented as IGP."],
      es: ["Amasar una base elástica apta para estirarla muy fina.", "Tras el reposo, estirar la masa muy fina y extender la manteca de cerdo calculada en una operación separada; después enrollar.", "Formar la espiral y dejar fermentar durante un periodo prolongado. La IGP Ensaimada de Mallorca exige al menos 12 horas después del formado; la fórmula actual no se presenta como IGP."],
    },
    warning: {
      ru: "Жир для замеса и саим для растягивания учитываются отдельно. Это рабочий технологический профиль, не подтвержденная рецептура IGP; времена и температура для нашей рецептуры требуют испытаний. Указанные пользователем часы не включают автоматически референс 12 ч.",
      en: "Mixing fat and saim for stretching are now allocated separately. This is a working model, not a certified IGP formula; the working proof and bake settings need validation. The user's fermentation hours do not automatically include the 12-hour reference.",
      es: "La grasa de amasado y la manteca para estirar se calculan por separado. Es un perfil de trabajo, no una fórmula IGP certificada; faltan validar los tiempos y las temperaturas de esta fórmula. Las horas elegidas por el usuario no incluyen automáticamente las 12 horas de referencia.",
    },
  },
  donuts: {
    stage: "review",
    steps: {
      ru: ["Замесить дрожжевое сдобное тесто по рассчитанной рецептуре.", "Провести брожение, разделку и окончательную расстойку.", "Обжарить в жире; заваривание муки не является обязательным этапом этого профиля."],
      en: ["Mix the yeasted enriched dough according to the calculated formula.", "Complete bulk fermentation, dividing, and final proofing.", "Fry in fat; pre-cooking a portion of flour is not a required stage of this profile."],
      es: ["Amasar la masa enriquecida con levadura según la fórmula calculada.", "Realizar la fermentación, división y fermentación final.", "Freír en grasa; el escaldado previo de parte de la harina no es una fase obligatoria de este perfil."],
    },
    warning: commonWarning,
    finish: {
      ru: "Жарка: температура масла 175 °C, ориентир 1–2 минуты на сторону. Продолжительность всей партии задаётся отдельно по фактическому числу загрузок.",
      en: "Frying: oil at 175 °C, approximately 1–2 minutes per side. Set total batch time separately based on the number of fryer loads.",
      es: "Fritura: aceite a 175 °C, aproximadamente 1–2 minutos por lado. Indicar el tiempo total del lote según el número de tandas.",
    },
  },
  baked_pirozhki: {
    stage: "review",
    steps: {
      ru: ["Замесить умеренно сдобное пластичное тесто согласно рассчитанной рецептуре.", "Провести брожение до требуемого состояния теста, сохранив его растяжимость для формовки.", "После деления и формовки провести финальную расстойку; начинка не входит в расчёт."],
      en: ["Mix a moderately enriched, pliable dough according to the calculated formula.", "Ferment until the required dough state while preserving extensibility for shaping.", "After dividing and shaping, proof the dough; filling is excluded from the calculation."],
      es: ["Amasar una masa moderadamente enriquecida y plástica según la fórmula calculada.", "Fermentar hasta el estado previsto, manteniendo la extensibilidad para el formado.", "Tras dividir y formar, realizar la fermentación final; el relleno no entra en el cálculo."],
    },
    warning: commonWarning,
  },
  belyashi: {
    stage: "review",
    steps: {
      ru: ["Замесить несдобное или слабосдобное дрожжевое тесто по текущей рецептуре.", "Провести брожение, деление и окончательную расстойку.", "Обжаривание выполняется отдельно от операции выпечки."],
      en: ["Mix the lean or lightly enriched yeasted dough according to the current formula.", "Complete fermentation, dividing, and final proofing.", "Frying is a separate finish operation, not baking."],
      es: ["Amasar la masa con levadura, poco enriquecida, según la fórmula actual.", "Realizar la fermentación, división y fermentación final.", "La fritura es una operación de acabado distinta del horneado."],
    },
    warning: commonWarning,
    finish: {
      ru: "Жарка. Температура масла и время пока не заданы в расчётном профиле.",
      en: "Frying. Oil temperature and duration are not yet specified in the calculation profile.",
      es: "Fritura. La temperatura del aceite y el tiempo aún no están definidos en el perfil de cálculo.",
    },
  },
  chebureki: {
    stage: "review",
    steps: { ru: [], en: [], es: [] },
    warning: commonWarning,
    finish: {
      ru: "Жарка. Температура масла и время пока не заданы в расчётном профиле.",
      en: "Frying. Oil temperature and duration are not yet specified in the calculation profile.",
      es: "Fritura. La temperatura del aceite y el tiempo aún no están definidos en el perfil de cálculo.",
    },
  },
};

export function technologyProtocolFor(id: unknown): TechnologyProtocol | undefined {
  return typeof id === "string" ? protocols[id] : undefined;
}
