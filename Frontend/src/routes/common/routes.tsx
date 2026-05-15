import { AUTH_ROUTES, PROTECTED_ROUTES } from "./routePath";
import SignIn from "../../pages/auth/signIn";
import SignUp from "../../pages/auth/signUp";
import Dashboard from "../../pages/dashboard"
import Transactions from "../../pages/transactions";
import Reports from "../../pages/reports";
import Settings from "../../pages/settings";
import Account from "../../pages/settings/account";
import Appearance from "../../pages/settings/apperance";

// authentication
const authenticationRoutePaths = [
    { 
        path: AUTH_ROUTES.SIGN_IN, 
        element: <SignIn /> 
    },
    { 
        path: AUTH_ROUTES.SIGN_UP, 
        element: <SignUp /> 
    },
];

// after signIn or signUp
const protectedRoutePaths = [
    { 
        path: PROTECTED_ROUTES.OVERVIEW, 
        element: <Dashboard /> 
    },
    { 
        path: PROTECTED_ROUTES.TRANSACTIONS, 
        element: <Transactions /> 
    },
    { 
        path: PROTECTED_ROUTES.REPORTS, 
        element: <Reports /> 
    },
    {
        path: PROTECTED_ROUTES.SETTINGS,
        element: <Settings />,
        children: [
            { 
                index: true, 
                element: <Account /> 
            }, // Default route
            { 
                path: PROTECTED_ROUTES.SETTINGS, 
                element: <Account /> },
            { 
                path: PROTECTED_ROUTES.SETTINGS_APPEARANCE, 
                element: <Appearance /> 
            },
        ]
    },
];

export {
    authenticationRoutePaths,
    protectedRoutePaths
}