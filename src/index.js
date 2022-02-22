import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import MyApp from "./App";
import PriceTwoWay from "./MyTest";
import NftTest from "./NftTest";
import KashiPairsDayData from "./KashiPairsDayData";
import HookTest from "./HookTest";
import reportWebVitals from "./reportWebVitals";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
  cache: new InMemoryCache(),
});

const MyContext = React.createContext(0);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <MyContext.Provider>
      <Router>
        <Routes>
          <Route path="/home" element={<MyApp />} />
          <Route path="/hook" element={<HookTest />} />
        </Routes>
      </Router>
    </MyContext.Provider>
  </ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
