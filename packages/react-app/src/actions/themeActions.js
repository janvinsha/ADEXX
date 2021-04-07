
import {
CHANGE_THEME
} from "../constants/themeConstants";

export const changeTheme=()=>async(dispatch,getState)=>{


if(getState().isDark){
    dispatch({
        type:CHANGE_THEME,
        payload:false
    })
    
    localStorage.setItem("isDark", JSON.stringify(false));
   }else{
    dispatch({
        type:CHANGE_THEME,
        payload:true
    })
     localStorage.setItem("isDark", JSON.stringify(true));
   }

}

