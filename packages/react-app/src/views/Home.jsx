import React from 'react';
import  Swap from "../components/Swap";
import { motion} from "framer-motion";
import { pageAnimation } from "../animations";

const Home = ({ selectedProvider, darkMode}) => {
    return <motion.div className="homw"   darkMode={darkMode} variants={pageAnimation} initial="hidden" animate="show" exit="exit">
<Swap selectedProvider={selectedProvider}
  /> ;
    </motion.div>
}
 
export default Home;