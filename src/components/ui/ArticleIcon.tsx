import { BagIcon } from "@solar-icons/react/linear/bag";
import { BoxIcon } from "@solar-icons/react/linear/box";
import { ChefHatIcon } from "@solar-icons/react/linear/chef-hat";
import { CupPaperIcon } from "@solar-icons/react/linear/cup-paper";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { LeafIcon } from "@solar-icons/react/linear/leaf";
import { TeaCupIcon } from "@solar-icons/react/linear/tea-cup";
import {
  Apple,
  CakeSlice,
  Candy,
  Citrus,
  Coffee,
  Cookie,
  Croissant,
  Egg,
  GlassWater,
  Milk,
  Nut,
  Wheat,
} from "lucide-react";
import type { ComponentType } from "react";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
}

type ArticleIconComponent = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
}>;

function getIcon(name: string, category: string): ArticleIconComponent {
  const article = normalize(name);
  const group = normalize(category);

  if (group === "embalagens") {
    if (article.includes("caixa")) return BoxIcon;
    if (article.includes("saco")) return BagIcon;
    if (article.includes("copo")) return CupPaperIcon;
    return DocumentTextIcon;
  }

  if (group === "bebidas") {
    if (article.includes("agua")) return GlassWater;
    if (article.includes("cha")) return TeaCupIcon;
    if (article.includes("sumo")) return Citrus;
    return Coffee;
  }

  if (group === "bolos") return CakeSlice;
  if (group === "pasteis") return Cookie;
  if (group === "pao") {
    if (article.includes("croissant")) return Croissant;
    return Wheat;
  }
  if (article.includes("farinha")) return Wheat;
  if (article.includes("acucar")) return Candy;
  if (article.includes("chocolate")) return Cookie;
  if (
    article.includes("manteiga") ||
    article.includes("natas") ||
    article.includes("leite")
  ) {
    return Milk;
  }
  if (article.includes("ovos")) return Egg;
  if (article.includes("canela")) return LeafIcon;
  if (article.includes("amendoa")) return Nut;
  if (article.includes("maca")) return Apple;
  if (article.includes("laranja")) return Citrus;
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
      <Icon size={16} strokeWidth={1.6} />
    </span>
  );
}
