import { x3DDashboardUtils } from "./lib/widget";
import Vue from "vue";
import App from "./components/app.vue";
import vuetify from "./plugins/vuetify";
import { store } from "./store";
import VueAWN from "vue-awesome-notifications";
import "vue-awesome-notifications/dist/styles/style.css";

function start() {
    x3DDashboardUtils.disableCSS(true);

    // add title to widget container
    window.title = "Widget Enablement";
    widget.setTitle(window.title);

    // init Awesome Notifications library
    const options = {
        position: "top-right",
        maxNotifications: 3,
        durations: {
            alert: 0
        },
        icons: {
            prefix: "<i style='font-size: 50px' class='fas fa-fw fa notranslate mdi ",
            warning: "mdi-alert",
            info: "mdi-information",
            alert: "mdi-alert-octagon",
            confirm: "",
            suffix: " '> </i>"
        }
    };
    Vue.use(VueAWN, options);

    const mainComponent = new Vue({
        store,
        vuetify,
        render: h => h(App)
    });

    // mount the Vue instance to the app defined in index.html
    mainComponent.$mount("app");
}
/**
 * Entry point for both standalone & 3DDashboard modes
 */
export default function() {
    widget.addEvent("onLoad", () => {
        start();
    });
    widget.addEvent("onRefresh", () => {
        // any actions required on an application data refresh
        // ** avoid doing a window.location.href reload since that will wipe
        // out any prefrence updates
    });
}
