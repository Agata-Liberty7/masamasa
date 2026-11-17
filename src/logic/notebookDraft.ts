import type { NotebookIngredient } from "../screens/NotebookRecipeEditor";
type Draft={recipeId:string|null;recipeUpdatedAt:number|null;title:string;notes:string;ingredients:NotebookIngredient[]};
const key="masamasa:notebookDraft:v1";
const cacheKey="masamasa:notebookDrafts:v1";
const cacheId=(id:string|null)=>id===null?"new":`recipe:${id}`;
function valid(x:any):x is Draft {
 return Boolean(x&&(x.recipeId===null||typeof x.recipeId==="string")&&(x.recipeUpdatedAt===null||Number.isFinite(x.recipeUpdatedAt))&&typeof x.title==="string"&&typeof x.notes==="string"&&Array.isArray(x.ingredients)&&x.ingredients.every((i:NotebookIngredient)=>typeof i?.id==="string"&&typeof i.name==="string"&&Number.isFinite(i.grams)&&i.grams>=0&&typeof i.isFlour==="boolean"));
}
export function readNotebookDraft(recipeId?:string|null):Draft|null {
 try {
  const recent=JSON.parse(sessionStorage.getItem(key)??"null");
  if(valid(recent)&&(recipeId===undefined||recent.recipeId===recipeId))return recent;
  if(recipeId===undefined)return null;
  const cache=JSON.parse(sessionStorage.getItem(cacheKey)??"{}");
  const saved=cache?.[cacheId(recipeId)];
  return valid(saved)?saved:null;
 }catch{return null;}
}
export function writeNotebookDraft(draft:Draft){
 try {
  const value=JSON.stringify(draft);
  sessionStorage.setItem(key,value);
  let cache=JSON.parse(sessionStorage.getItem(cacheKey)??"{}");
  if(!cache||typeof cache!=="object"||Array.isArray(cache))cache={};
  cache[cacheId(draft.recipeId)]=draft;
  sessionStorage.setItem(cacheKey,JSON.stringify(cache));
 }catch{/* Optional session-only drafts never block editing. */}
}
export function clearNotebookDraft(recipeId?:string|null){
 try {
  const recent=readNotebookDraft();
  const id=recipeId===undefined?recent?.recipeId:recipeId;
  if(recipeId===undefined||recent?.recipeId===recipeId)sessionStorage.removeItem(key);
  if(id!==undefined){const cache=JSON.parse(sessionStorage.getItem(cacheKey)??"{}");if(cache&&typeof cache==="object"){delete cache[cacheId(id)];sessionStorage.setItem(cacheKey,JSON.stringify(cache));}}
 }catch{/* Saving recipes does not depend on optional draft storage. */}
}
