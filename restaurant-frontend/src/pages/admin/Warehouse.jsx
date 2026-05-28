import Warehouse from "../../components/Warehouse";
import { FEATURE_PERMISSIONS } from "../../utils/permissions";

export default function AdminWarehousePage() {
  return <Warehouse permissions={FEATURE_PERMISSIONS.adminWarehouse} />;
}
