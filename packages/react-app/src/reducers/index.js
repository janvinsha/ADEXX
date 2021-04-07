import { combineReducers } from "redux";
import {isDarkReducer} from "./themeReducers"
const rootReducer = combineReducers({ 
isDark:isDarkReducer
});
export default rootReducer;
