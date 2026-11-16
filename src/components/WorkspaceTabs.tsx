import { useTranslation } from "react-i18next";
import UiIcon from "./UiIcon";

export type WorkspaceView = "notebook" | "library";
export default function WorkspaceTabs({active,onChange}:{active:WorkspaceView;onChange:(view:WorkspaceView)=>void}) {
 const { i18n }=useTranslation();
 const lang=i18n.language.startsWith("es")?"es":i18n.language.startsWith("en")?"en":"ru";
 const text={ru:{label:"Рабочее место",notebook:"Мой рецепт",library:"Библиотека"},en:{label:"Workspace",notebook:"My recipe",library:"Library"},es:{label:"Espacio de trabajo",notebook:"Mi receta",library:"Biblioteca"}}[lang];
 return <nav className="mm-workspace-tabs" aria-label={text.label}>
   <div className="mm-workspace-tab-buttons">
     <button type="button" aria-current={active==="notebook"?"page":undefined} onClick={()=>onChange("notebook")}><UiIcon name="notebook-pen"/><span>{text.notebook}</span></button>
     <button type="button" aria-current={active==="library"?"page":undefined} onClick={()=>onChange("library")}><UiIcon name="wheat"/><span>{text.library}</span></button>
   </div>
 </nav>;
}
