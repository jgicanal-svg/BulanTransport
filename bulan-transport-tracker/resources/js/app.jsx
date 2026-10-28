import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import ToastProvider from "./Components/UI/ToastProvider";

const appName = import.meta.env.VITE_APP_NAME || "Bulan Transport Tracker";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        );

        const existingLayout = page.default.layout;

        page.default.layout = existingLayout
            ? (pageElement) => (
                  <ToastProvider>{existingLayout(pageElement)}</ToastProvider>
              )
            : (pageElement) => <ToastProvider>{pageElement}</ToastProvider>;

        return page;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: "#2563EB",
    },
});
