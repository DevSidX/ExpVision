import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { authenticationRoutePaths, protectedRoutePaths } from "./common/routes"
import AuthRoute from './authRoute';
import ProtectedRoute from './protectedRoutes';

function AppRoutes() {
    useAuthExpiration();

    return (
        <BrowserRouter>
            <Routes>

                <Route 
                    path="/" 
                    element={<AuthRoute />} // if user already logged in
                >
                    <Route element={<BaseLayout />}>
                        {authenticationRoutePaths.map((route) => (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={route.element}
                            />
                        ))}
                    </Route>
                </Route>

                {/* Protected Route */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        {protectedRoutePaths.map((route) => (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={route.element}
                            >
                                {route.children?.map((childRoute) => (
                                    <Route
                                        key={childRoute.path || 'index'}
                                        index={childRoute.index}
                                        path={childRoute.path}
                                        element={childRoute.element}
                                    />
                                ))}
                            </Route>
                        ))}
                    </Route>
                </Route>

                {/* Catch-all for undefined routes */}
                <Route path="*" element={<>404</>} />

            </Routes>
        </BrowserRouter>
    )
}

export { AppRoutes }