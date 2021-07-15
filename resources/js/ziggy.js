const Ziggy = {
    url: "http://ringba.test",
    port: null,
    defaults: {},
    routes: {
        home: { uri: "/", methods: ["GET", "HEAD"] },
        dashboard: { uri: "dashboard", methods: ["GET", "HEAD"] },
        getringbadata: { uri: "get-ringba-data", methods: ["GET", "HEAD"] },
        login: { uri: "login", methods: ["POST"] },
    },
};

if (typeof window !== "undefined" && typeof window.Ziggy !== "undefined") {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export { Ziggy };
