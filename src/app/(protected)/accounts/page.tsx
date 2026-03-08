import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

export default function AccountsPage() {
  const route = getRequiredRouteConfig("/accounts");

  return <PlaceholderPage title={route.title} description={route.description} />;
}
