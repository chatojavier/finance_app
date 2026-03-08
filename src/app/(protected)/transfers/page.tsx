import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

export default function TransfersPage() {
  const route = getRequiredRouteConfig("/transfers");

  return <PlaceholderPage title={route.title} description={route.description} />;
}
