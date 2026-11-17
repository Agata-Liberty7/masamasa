import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent } from "react";
import UiIcon from "./UiIcon";
import { getIngredientIcon } from "../utils/ingredientIcon";

type Suggestion={name:string;isFlour:boolean};
const capitalizeIngredient=(value:string)=>value.replace(/^(\s*)(\p{L})/u,(_match,spaces:string,letter:string)=>spaces+letter.toLocaleUpperCase());
const normalize=(value:string)=>value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g,"").replace(/ё/g,"е").trim();
export function matchingIngredients(options:Suggestion[],query:string):Suggestion[] {
 const key=normalize(query);const tokens=key.split(/\s+/).filter(Boolean);
 return options.map((item,index)=>({item,index,key:normalize(item.name)})).filter(x=>tokens.every(token=>x.key.includes(token))).sort((a,b)=>Number(!a.key.startsWith(key))-Number(!b.key.startsWith(key)) || a.index-b.index).slice(0,20).map(x=>x.item);
}
export default function IngredientNameInput({value,onChange,suggestions,label,lang}:{value:string;onChange:(name:string)=>void;suggestions:Suggestion[];label:string;lang:"ru"|"en"|"es"}) {
 const id=useId();const wrapper=useRef<HTMLDivElement>(null);const input=useRef<HTMLTextAreaElement>(null);
 const touch=useRef<{id:number;x:number;y:number;moved:boolean}|null>(null);
 const lastTouchChoice=useRef(0);
 const [open,setOpen]=useState(false);const [active,setActive]=useState(-1);
 const [position,setPosition]=useState({above:false,height:224});
 const matches=useMemo(()=>matchingIngredients(suggestions,value),[suggestions,value]);
 const visible=open&&matches.length>0;
 useLayoutEffect(()=>{const el=input.current;if(!el)return;el.style.height="auto";el.style.height=`${Math.max(38,el.scrollHeight)}px`;},[value]);
 const listLabel={ru:"Варианты ингредиентов",en:"Ingredient suggestions",es:"Sugerencias de ingredientes"}[lang];
 useEffect(()=>{
  const close=(event:PointerEvent)=>{if(event.target instanceof Node&&!wrapper.current?.contains(event.target)){touch.current=null;setOpen(false);setActive(-1);}};
  document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close);
 },[]);
 useLayoutEffect(()=>{
  if(!visible)return;
  const place=()=>{const rect=input.current?.getBoundingClientRect();if(!rect)return;const view=window.visualViewport;const top=view?.offsetTop??0;const bottom=top+(view?.height??window.innerHeight);const below=bottom-rect.bottom-8;const above=rect.top-top-8;const useAbove=below<144&&above>below;setPosition({above:useAbove,height:Math.max(44,Math.min(224,Math.floor(useAbove?above:below)))});};
  place();window.addEventListener("resize",place);window.addEventListener("scroll",place,true);window.visualViewport?.addEventListener("resize",place);window.visualViewport?.addEventListener("scroll",place);
  return()=>{window.removeEventListener("resize",place);window.removeEventListener("scroll",place,true);window.visualViewport?.removeEventListener("resize",place);window.visualViewport?.removeEventListener("scroll",place);};
 },[visible]);
 useEffect(()=>{if(active>=0)document.getElementById(`${id}-option-${active}`)?.scrollIntoView({block:"nearest"});},[active,id]);
 const choose=(name:string)=>{onChange(capitalizeIngredient(name));input.current?.focus({preventScroll:true});setOpen(false);setActive(-1);};
 const blur=(event:FocusEvent<HTMLTextAreaElement>)=>{
  if(event.relatedTarget instanceof Node && wrapper.current?.contains(event.relatedTarget))return;
  if(touch.current && !event.relatedTarget)return;
  setOpen(false);setActive(-1);
 };
 return <div ref={wrapper} className="mm-ingredient-field mm-ingredient-combobox">
  <span className="mm-ingredient-symbol"><UiIcon name={getIngredientIcon(value)}/></span>
  <textarea ref={input} rows={1} role="combobox" aria-autocomplete="list" aria-expanded={visible} aria-controls={`${id}-list`} aria-activedescendant={visible&&active>=0&&active<matches.length?`${id}-option-${active}`:undefined} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label={label} value={capitalizeIngredient(value)}
   onFocus={()=>{setOpen(true);setActive(-1);}} onBlur={blur}
   onChange={event=>{onChange(capitalizeIngredient(event.target.value));setOpen(true);setActive(-1);}}
   onKeyDown={event=>{
    if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();setOpen(true);if(matches.length)setActive(current=>event.key==="ArrowDown"?Math.min(current+1,matches.length-1):current<0?matches.length-1:Math.max(current-1,0));}
    else if(event.key==="Enter"&&visible&&active>=0&&active<matches.length){event.preventDefault();choose(matches[active].name);}
    else if(event.key==="Enter"){event.preventDefault();setOpen(false);setActive(-1);}
    else if(event.key==="Escape"){event.preventDefault();setOpen(false);setActive(-1);}
    else if(event.key==="Tab"){setOpen(false);setActive(-1);}
   }}/>
  {visible&&<div id={`${id}-list`} className={`mm-ingredient-options${position.above?" mm-ingredient-options-above":""}`} role="listbox" aria-label={listLabel} style={{maxHeight:position.height}}>
   {matches.map((option,index)=><button id={`${id}-option-${index}`} key={option.name} type="button" role="option" tabIndex={-1} aria-selected={active===index} onPointerDown={event=>{
     if(event.pointerType==="mouse"||!event.pointerType){event.preventDefault();return;}
     touch.current={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
   }} onPointerMove={event=>{
     const current=touch.current;
     if(current?.id===event.pointerId && Math.hypot(event.clientX-current.x,event.clientY-current.y)>10)current.moved=true;
   }} onPointerCancel={()=>{touch.current=null;lastTouchChoice.current=Date.now();}} onPointerUp={event=>{
     const current=touch.current;touch.current=null;
     if(current?.id===event.pointerId){
       lastTouchChoice.current=Date.now();
       if(!current.moved && Math.hypot(event.clientX-current.x,event.clientY-current.y)<=10)choose(option.name);
     }
   }} onClick={event=>{if(event.detail===0||Date.now()-lastTouchChoice.current>600)choose(option.name);}}><UiIcon name={getIngredientIcon(option.name)}/><span>{capitalizeIngredient(option.name)}</span></button>)}
  </div>}
 </div>;
}
