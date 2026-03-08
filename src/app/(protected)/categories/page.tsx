import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

export default function CategoriesPage() {
  const route = getRequiredRouteConfig("/categories");

  return <PlaceholderPage title={route.title} description={route.description} />;
}
