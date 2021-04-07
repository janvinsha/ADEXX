
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
const isDarkFromStorage=localStorage.getItem("isDark")?
JSON.parse(localStorage.getItem("isDark")):false
const initialState={
    isDark:isDarkFromStorage
}
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer,initialState, composeEnhancer(applyMiddleware(thunk)));
export default store