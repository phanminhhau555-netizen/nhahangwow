import Warehouse from "../../components/Warehouse";
import { FEATURE_PERMISSIONS } from "../../utils/permissions";

export default function KitchenWarehousePage() {
  return <Warehouse permissions={FEATURE_PERMISSIONS.kitchenWarehouse} />;
}
