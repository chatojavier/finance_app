import { PlaceholderPage } from "@/components/app/placeholder-page";
import { getRequiredRouteConfig } from "@/config/navigation";

export default function CreditCardPage() {
  const route = getRequiredRouteConfig("/credit-card");

  return <PlaceholderPage title={route.title} description={route.description} />;
}
