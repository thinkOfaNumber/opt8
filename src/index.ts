import {FrameworkConfiguration} from "aurelia-framework";
import { PLATFORM } from 'aurelia-pal';

export function configure(aurelia: FrameworkConfiguration) {
  aurelia
        .globalResources(PLATFORM.moduleName("./opt8"))
        .globalResources(PLATFORM.moduleName("./filter"));
}
