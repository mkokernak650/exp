import "../css/app.css";
import "../css/utilities.css";

import { render } from "react-dom";
import { Toaster } from "react-hot-toast";
import { createInertiaApp } from "@inertiajs/inertia-react";
import { InertiaProgress } from "@inertiajs/progress";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

if (window?.Ziggy?.baseProtocol === "http") {
  window.Ziggy.baseProtocol = "https";
}

InertiaProgress.init({ color: "#f66" });

const appName =
  window.document.getElementsByTagName("title")[0]?.innerText || "Laravel";

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob("./Pages/**/*.jsx")
    ),
  setup({ el, App, props }) {
    return render(
      <>
        <Toaster
          position="bottom-right"
          containerStyle={{ inset: "-25px 30px 20px -10px" }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#000000",
              color: "#fff",
              bottom: 40,
              padding: "15px 18px",
              boxShadow:
                "0 0px 7px rgb(0 0 0 / 30%), 0 3px 30px rgb(0 0 0 / 20%)",
            },
          }}
        />
        <App {...props} />
      </>,
      el
    );
  },
});
