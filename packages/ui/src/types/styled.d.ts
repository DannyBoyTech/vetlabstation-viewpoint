import "styled-components";
import { Theme } from "../utils/StyleConstants";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
