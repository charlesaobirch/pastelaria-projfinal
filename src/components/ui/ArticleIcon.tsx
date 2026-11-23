import { AppleIcon } from "@solar-icons/react/linear/apple";
import { BagIcon } from "@solar-icons/react/linear/bag";
import { BottleIcon } from "@solar-icons/react/linear/bottle";
import { BoxIcon } from "@solar-icons/react/linear/box";
import { CakeIcon } from "@solar-icons/react/linear/cake";
import { ChefHatIcon } from "@solar-icons/react/linear/chef-hat";
import { CookieIcon } from "@solar-icons/react/linear/cookie";
import { CupHotIcon } from "@solar-icons/react/linear/cup-hot";
import { CupPaperIcon } from "@solar-icons/react/linear/cup-paper";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { LeafIcon } from "@solar-icons/react/linear/leaf";
import { TeaCupIcon } from "@solar-icons/react/linear/tea-cup";
import { WaterIcon } from "@solar-icons/react/linear/water";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
}

function getIcon(name: string, category: string) {
  const article = normalize(name);
  const group = normalize(category);

  if (group === "embalagens") {
    if (article.includes("caixa")) return BoxIcon;
    if (article.includes("saco")) return BagIcon;
    if (article.includes("copo")) return CupPaperIcon;
    return DocumentTextIcon;
  }

  if (group === "bebidas") {
    if (article.includes("agua")) return WaterIcon;
    if (article.includes("cha")) return TeaCupIcon;
    if (article.includes("sumo")) return BottleIcon;
    return CupHotIcon;
  }

  if (group === "bolos") return CakeIcon;
  if (group === "pasteis") return CookieIcon;
  if (group === "pao") return ChefHatIcon;
  if (article.includes("maca") || article.includes("laranja")) return AppleIcon;
  if (article.includes("canela")) return LeafIcon;
  if (article.includes("leite") || article.includes("natas")) return BottleIcon;
  if (
    article.includes("acucar") ||
    article.includes("chocolate") ||
    article.includes("manteiga") ||
    article.includes("ovos") ||
    article.includes("amendoa")
  ) {
    return CookieIcon;
  }
  return ChefHatIcon;
}

export function ArticleIcon({
  name,
  category,
}: {
  name: string;
  category: string;
}) {
  const Icon = getIcon(name, category);

  return (
    <span className="article-icon" aria-hidden="true">
      <Icon size={16} />
    </span>
  );
}
