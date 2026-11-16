import { useState } from "react";
import { getRecipeImage } from "../utils/recipeImages";
import UiIcon from "./UiIcon";

export default function RecipeThumbnail({profileId, className="start-recipe-thumb"}: {profileId: string; className?: string}) {
 const source=getRecipeImage(profileId);
 const [failedSource,setFailedSource]=useState<string | undefined>();
 if (!source || failedSource === source) return <span className={`${className} mm-thumb-placeholder`} aria-hidden="true"><UiIcon name="wheat" /></span>;
 return <img className={className} src={source} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={() => setFailedSource(source)} />;
}
