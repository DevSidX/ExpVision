//  the global Redux store for the whole application.

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"
import storage from "redux-persist/lib/storage"

import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

import { apiClient } from "./api-client";
//import { encryptTransform } from 'redux-persist-transform-encrypt';

type RootReducerType = ReturnType<typeof rootReducer>;

// how redux-persist should save Redux state.
const persistConfig = {
    key: "root",
    storage,
    blacklist: [apiClient.reducerPath],
}

// Combine all reducers into one single reducer.
const rootReducer = combineReducers({
    [apiClient.reducerPath]: apiClient.reducer, // Add API client reducer to root reducer
    auth: authReducer, // Add auth reducer to root reducer
});

// Create a persisted version of the root reducer
const persistedReducer = persistReducer<RootReducerType>(
    persistConfig,
    rootReducer
);

const reduxPersistActions = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER];

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(
        {
            serializableCheck: {
                ignoredActions: reduxPersistActions, /// Ignore specific actions in serializable checks
            },
        }
    ).concat(apiClient.middleware),
});

export const persistor = persistStore(store); // Create a persistor linked to the store

export type RootState = ReturnType<typeof store.getState>;