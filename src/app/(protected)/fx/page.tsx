import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

export default function FxPage() {
  const route = getRequiredRouteConfig("/fx");

  return <PlaceholderPage title={route.title} description={route.description} />;
}
