import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";

let subgraphUri = "http://localhost:8000/subgraphs/name/demo-proj/your-contract"

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
      <Provider store={store}>
    <BrowserRouter>
      <App subgraphUri={subgraphUri}/>
    </BrowserRouter>
    </Provider>
  </ApolloProvider>,
  document.getElementById("root"),
);
