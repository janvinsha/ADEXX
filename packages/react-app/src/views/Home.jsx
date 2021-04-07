import React from 'react';
import  Swap from "../components/Swap";

const Home = ({ selectedProvider, darkMode}) => {
    return  <Swap selectedProvider={selectedProvider}
    darkMode={darkMode}/> ;
}
 
export default Home;