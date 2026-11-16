import { useTranslation } from "react-i18next";
import ThemeSwitcher from "./ThemeSwitcher";

export default function AppearanceControls() {
 const { i18n } = useTranslation();
 const lang = i18n.language.startsWith("es") ? "es" : i18n.language.startsWith("en") ? "en" : "ru";
 const text = {ru:{group:"Язык и оформление",language:"Язык интерфейса"},en:{group:"Language and appearance",language:"Interface language"},es:{group:"Idioma y apariencia",language:"Idioma de la interfaz"}}[lang];
 return <div className="mm-appearance-controls" role="group" aria-label={text.group}>
   <ThemeSwitcher />
   <div className="mm-language-buttons" role="group" aria-label={text.language}>
     {(["en","es","ru"] as const).map(code => <button key={code} type="button" aria-pressed={lang === code} aria-label={{ru:"Русский",en:"English",es:"Español"}[code]} onClick={() => { void i18n.changeLanguage(code); }}>{code.toUpperCase()}</button>)}
   </div>
 </div>;
}
