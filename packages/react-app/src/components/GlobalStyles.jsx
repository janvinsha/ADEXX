import { createGlobalStyle } from "styled-components";
import { useDispatch, useSelector } from "react-redux";


const GlobalStyles =createGlobalStyle`

*{
    margin:0;
    padding:0;
    box-sizing:border-box
}
html{
    &::-webkit-scrollbar{
        width:0.5rem;
    }&::-webkit-scrollbar-thumb{
        background-color:darkgrey
    }
    @media(max-width:1700){
        font-size:100%
    }
}
body{
    font-family:"Roboto",sans-serif;
    width:100%;
    overflow-x:hidden;
    background-image:${({isDark})=>isDark?"linear-gradient(#0f1529,#0b0f1d)":"linear-gradient(white ,#a7edf3,#6adbe6 )"};
    background-size: cover;
    transition:all 0.6s ease-in-out;
    color:${({isDark})=>isDark?"whitesmoke":"gray"};
 
    @media (max-width: 900px) {
    font-size:1.4rem
}
}

button{

        border: 0px;
        background-color: rgba(137, 196, 244, 1);
        outline: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        font-size:1rem;
        &:hover {
          color: whitesmoke;
   
        }
        &:disabled {
          
          color:white;
          cursor:default
        }
   
}input{
 
   border:none;
}
h1{
    font-family: "Montserrat", sans-serif;
}
h2{
        font-weight:400;
        font-size:1rem;
        font-family: "Montserrat", sans-serif;
    }
    h3{

        color:white;
        font-family: "Montserrat", sans-serif;
    }
    h4{

        font-weight:bold;
      font-size:2rem;
      font-family: "Montserrat", sans-serif;
    }
    span{

    }
    a{
      
        text-decoration:none;
 color:${({isDark})=>isDark?"whitesmoke":"gray"};
 &:hover{
    color:${({isDark})=>isDark?"#d1caca":"#d1caca"};
 }
    }
    p{

    }
`


export default GlobalStyles;