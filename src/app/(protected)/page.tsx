import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

export default function HomePage() {
  const route = getRequiredRouteConfig("/");

  return <PlaceholderPage title={route.title} description={route.description} />;
}
