import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

export default function ReportsPage() {
  const route = getRequiredRouteConfig("/reports");

  return <PlaceholderPage title={route.title} description={route.description} />;
}
