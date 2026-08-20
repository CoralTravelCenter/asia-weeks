import {hostReactAppReady} from "../utils/hostReactAppReady.js";
import {initTabs} from "./blocks/initTabs.js";
import {initPlacesSlider, initResortsSlider} from "./blocks/initSlider.js";

export default async function three_country() {
    await hostReactAppReady()
    initTabs()
    initResortsSlider()
    initPlacesSlider()
}
