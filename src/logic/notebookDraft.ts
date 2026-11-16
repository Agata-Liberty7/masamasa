import type { NotebookIngredient } from "../screens/NotebookRecipeEditor";
type Draft={recipeId:string|null;recipeUpdatedAt:number|null;title:string;notes:string;ingredients:NotebookIngredient[]};
const key="masamasa:notebookDraft:v1";
export function readNotebookDraft():Draft|null {
 try {const x=JSON.parse(sessionStorage.getItem(key)??"null");
  if(!x||!(x.recipeId===null||typeof x.recipeId==="string")||!(x.recipeUpdatedAt===null||Number.isFinite(x.recipeUpdatedAt))||typeof x.title!=="string"||typeof x.notes!=="string"||!Array.isArray(x.ingredients)||!x.ingredients.every((i:NotebookIngredient)=>typeof i?.id==="string"&&typeof i.name==="string"&&Number.isFinite(i.grams)&&i.grams>=0&&typeof i.isFlour==="boolean"))return null;
  return x;
 } catch {return null;}
}
export function writeNotebookDraft(draft:Draft){try{sessionStorage.setItem(key,JSON.stringify(draft));}catch{/* Optional session-only draft must not block editing. */}}
export function clearNotebookDraft(){try{sessionStorage.removeItem(key);}catch{/* Saving the recipe remains independent of the draft. */}}
