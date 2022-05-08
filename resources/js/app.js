import { InertiaApp } from "@inertiajs/inertia-react";
import { render } from "react-dom";
import "../css/app.css";
import "../css/utilities.css";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";

if (window?.Ziggy?.baseProtocol === "http") {
    window.Ziggy.baseProtocol = "https";
}

const app = document.getElementById("app");
render(
    <RecoilRoot>
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
        <InertiaApp
            initialPage={JSON.parse(app.dataset.page)}
            resolveComponent={(name) =>
                import(`./Pages/${name}`).then((module) => module.default)
            }
        />
    </RecoilRoot>,
    app
);
