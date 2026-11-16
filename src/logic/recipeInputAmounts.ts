/** Shared by the live ingredient amounts and the existing submit flow. */
export type FormulaAmounts = {
 mode: "flour" | "dough"; flour: number; targetDoughWeight: number;
 liquidPct: number; salt: number; sugar: number; fat: number; eggsPct: number; yeastPct: number;
 processFatPct: number; additives: Array<{percent:number}>;
};
export function recipeInputFlour(input: FormulaAmounts): number {
 const {mode,flour:flourSafe,targetDoughWeight:targetDoughWeightSafe,liquidPct:liquidPctSafe,salt:saltSafe,sugar:sugarSafe,fat:fatSafe,eggsPct:eggsPctSafe,yeastPct:yeastPctSafe,processFatPct,additives}=input;
 let finalFlour=flourSafe;
 if (mode === "dough" && targetDoughWeightSafe > 0) {
  const liquidGr=(flourSafe*liquidPctSafe)/100;
  const saltGr=(flourSafe*saltSafe)/100;
  const sugarGr=(flourSafe*sugarSafe)/100;
  const fatGr=(flourSafe*fatSafe)/100;
  const eggsGr=(flourSafe*eggsPctSafe)/100;
  const yeastGr=(flourSafe*yeastPctSafe)/100;
  const processFatGr=Math.round((flourSafe*Math.max(0,processFatPct)/100)*1000)/1000;
  const additivesGr=additives.reduce((sum,item)=>sum+Math.round((flourSafe*Math.max(0,item.percent)/100)*1000)/1000,0);
  const totalNow=processFatGr+additivesGr+flourSafe+liquidGr+saltGr+sugarGr+fatGr+eggsGr+yeastGr;
  if(totalNow>0){const ratio=targetDoughWeightSafe/totalNow;finalFlour=Math.round(flourSafe*ratio);}
 }
 return finalFlour;
}
export function ingredientGrams(flour:number,percent:number,decimal=false):number {
 const grams=(flour*percent)/100;
 return decimal?Math.round(grams*1000)/1000:Math.round(grams);
}
