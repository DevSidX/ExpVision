import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { RootState, store } from "./store";

export type AppDispatch = typeof store.dispatch; // Type for dispatch function
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;