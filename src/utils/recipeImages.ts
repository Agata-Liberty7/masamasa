// Approved MasaMasa photographs. Profiles without an approved photo remain text-only.
export const approvedRecipeImages: Record<string, string> = {
  bagel: "/images/recipes/bagel.webp",
  baguette: "/images/recipes/baguette.webp",
  brioche: "/images/recipes/brioche.webp",
  ciabatta: "/images/recipes/ciabatta.webp",
  cinnabon: "/images/recipes/cinnabon.webp",
  donuts: "/images/recipes/donuts.webp",
  chebureki: "/images/recipes/chebureki.webp",
  baked_pirozhki: "/images/recipes/baked_pirozhki.webp",
  ensaimada: "/images/recipes/ensaimada.webp",
  focaccia: "/images/recipes/focaccia.webp",
  pita: "/images/recipes/pita.webp",
  pizza: "/images/recipes/pizza.webp",
  shortcrust: "/images/recipes/shortcrust.webp",
  sourdough: "/images/recipes/sourdough.webp",
  sponge: "/images/recipes/sponge.webp",
 };

export const getRecipeImage = (profileId: string): string | undefined =>
  approvedRecipeImages[profileId];
