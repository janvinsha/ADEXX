import {CHANGE_THEME} from "../constants/themeConstants";


export const isDarkReducer=(state=false,action)=>{

    switch(action.type){
        case CHANGE_THEME:
           return state=action.payload
        default: return state
    }
}