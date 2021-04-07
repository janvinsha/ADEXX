import { useState } from "react";
import { usePoller } from "eth-hooks";
const CoinGecko = require ('coingecko-api');

export default function useExchangePrice(targetNetwork, mainnetProvider, pollTime) {
  const [price, setPrice] = useState(0);
  const coinGeckoClient = new CoinGecko();

  const pollPrice = () => {
    async function getPrice() {
      if(targetNetwork.price){
        setPrice(targetNetwork.price)
      }else{
        const response = await coinGeckoClient.coins.fetch('binancecoin',{});
        let currentPrice = parseFloat(response.data.market_data.current_price.usd);
        //currentPrice = parseInt(currentPrice * 100);

        console.log("Price Recieved ",currentPrice)

        setPrice(parseFloat(currentPrice));
      }
    }
    getPrice();
  };
  usePoller(pollPrice, pollTime || 9777);

  return price;
}
