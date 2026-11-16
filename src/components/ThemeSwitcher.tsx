import UiIcon from "./UiIcon";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { getThemePreference, getServerThemePreference, setThemePreference, subscribeTheme } from "../theme/theme";
import type { ThemePreference } from "../theme/theme";

const text = {
 ru:{label:"Выбрать тему оформления",auto:"Авто — тема системы",light:"Светлая тема",dark:"Тёмная тема"},
 en:{label:"Choose appearance",auto:"Auto — system theme",light:"Light theme",dark:"Dark theme"},
 es:{label:"Elegir apariencia",auto:"Auto — tema del sistema",light:"Tema claro",dark:"Tema oscuro"},
};
const choices: Array<{value:ThemePreference;icon:string}> = [{value:"auto",icon:"monitor"},{value:"light",icon:"sun"},{value:"dark",icon:"moon"}];
export default function ThemeSwitcher() {
 const { i18n } = useTranslation();
 const lang=i18n.language.startsWith("es")?"es":i18n.language.startsWith("en")?"en":"ru";
 const labels=text[lang];
 const preference=useSyncExternalStore(subscribeTheme,getThemePreference,getServerThemePreference);
 const menu=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
   const outside=(event:PointerEvent)=>{ if(event.target instanceof Node && !menu.current?.contains(event.target)) menu.current?.removeAttribute("open"); };
   const escape=(event:KeyboardEvent)=>{ if(event.key==="Escape" && menu.current?.open) { menu.current.removeAttribute("open"); menu.current.querySelector("summary")?.focus(); } };
   document.addEventListener("pointerdown",outside);
   document.addEventListener("keydown",escape);
   return ()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
 },[]);
 return <details ref={menu} className="mm-theme-switch mm-theme-menu">
   <summary aria-label={labels.label} title={`${labels.label}: ${labels[preference]}`}><UiIcon name={choices.find(choice=>choice.value===preference)?.icon ?? "monitor"}/></summary>
   <div className="mm-theme-options" role="group" aria-label={labels.label}>
     {choices.map(({value,icon})=><button key={value} type="button" aria-pressed={preference===value} onClick={()=>{setThemePreference(value);menu.current?.removeAttribute("open");menu.current?.querySelector("summary")?.focus();}}><UiIcon name={icon}/><span>{labels[value]}</span></button>)}
   </div>
 </details>;
}
