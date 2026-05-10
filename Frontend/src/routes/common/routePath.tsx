
const isAuthRoute = (pathname: string): boolean => {
    return Object.values(AUTH_ROUTES).includes(pathname);
};

const AUTH_ROUTES = {
    SIGN_IN: "/",
    SIGN_UP: "/sign-up",
};

const PROTECTED_ROUTES = {
    OVERVIEW: "/overview",
    TRANSACTIONS: "/transactions",
    REPORTS: "/reports",
    SETTINGS: "/settings",
    SETTINGS_APPEARANCE: "/settings/appearance",
    SETTINGS_BILLING: "/settings/billing",
};

export {
    isAuthRoute,
    AUTH_ROUTES,
    PROTECTED_ROUTES
}