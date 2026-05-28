import Menu from "../../components/Menu";
import { FEATURE_PERMISSIONS } from "../../utils/permissions";

export default function KitchenMenuPage() {
  return <Menu permissions={FEATURE_PERMISSIONS.kitchenMenu} />;
}
