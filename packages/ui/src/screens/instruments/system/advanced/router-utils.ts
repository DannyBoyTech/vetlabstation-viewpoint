import { RouterType } from "@viewpoint/api";

function configChangeRequiresReboot(routerType?: RouterType) {
  return routerType != null && routerType === RouterType.LINKSYS;
}

export { configChangeRequiresReboot };
