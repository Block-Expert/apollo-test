import logo from './logo.svg';
import './App.css';
import {useQuery, gql} from "@apollo/client";

import { request } from 'graphql-request'
import useSWR, { SWRConfiguration } from 'swr'
import stringify from 'fast-json-stable-stringify'
import { useMemo } from 'react'

// @ts-ignore TYPE NEEDS FIXING
async function pager(endpoint, query, variables = {}) {
  if (endpoint.includes('undefined')) return {}

  let data = {}
  let skip = 0
  let flag = true

  while (flag) {
    flag = false
    const req = await request(endpoint, query, variables)

    Object.keys(req).forEach((key) => {
      data[key] = data[key] ? [...data[key], ...req[key]] : req[key]
    })

    Object.values(req).forEach((entry) => {
      if (entry.length === 1000) flag = true
    })

    // @ts-ignore TYPE NEEDS FIXING
    if (Object.keys(variables).includes('first') && variables['first'] !== undefined) break

    skip += 1000
    variables = { ...variables, skip }
  }
  return data
}

const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`;

const GET_DOGS = gql`
  query GetDogs {
    dogs {
      id
      breed
    }
  }
`;

const GET_DOG_PHOTO = gql`
  query Dog($breed: String!) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;



function Dogs({onDogSelected}) {
  const {loading, error, data} = useQuery(GET_DOGS);

  if(loading) return "Loading...";
  if(error) return `Error! ${error.messgae}`;

  return (
    <select name='dog' onChange={onDogSelected}>
      {data.dogs.map((dog) => (
        <option key={dog.id} value={dog.breed}>
          {dog.breed}
        </option>
      ))}
    </select>
  );
}

function DisplayLocations() {
  const {loading, error, data} = useQuery(GET_LOCATIONS);

  if(loading) return <p>Loading...</p>;
  if(error) return <p>Error :</p>;

  return data.locations.map(({id, name, description, photo}) => (
    <div key={id}>
      <h2>{name}</h2>
      <img width="400" height="250" alt="location-reference" src={`${photo}`} />
      <br />
      <b>About this location:</b>
      <p>{description}</p>
      <br />
    </div>
  ))
}

export const getKashiPairsQuery = gql`
  query GetPairs {
    bentoBoxes {
      totalTokens
      totalKashiPairs
      totalUsers
    }
    kashiPairs(first: 1000, orderBy: totalAssetElastic, orderDirection: desc) {
      id
      name
      symbol
      asset {
        id
        name
        symbol
        decimals
      }
      collateral {
        id
        name
        symbol
        decimals
      }
      exchangeRate
      utilization
      interestPerSecond
      totalAssetElastic
      totalAssetBase
      supplyAPR
      totalBorrowElastic
      totalBorrowBase
      borrowAPR
    }
  }
`

export const getKashiPairsDayDataQuery = gql`
  query GetDataKashiPairsDayData($skip: Int) {
    kashiPairDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: desc) {
      id
      date
      pair {
        id
        name
        symbol
        asset {
          id
          name
          symbol
          decimals
        }
        collateral {
          id
          name
          symbol
          decimals
        }
      }
      totalAssetElastic
      totalAssetBase
      totalCollateralShare
      totalBorrowElastic
      totalBorrowBase
      avgExchangeRate
      avgUtilization
      avgInterestPerSecond
    }
  }
`
const factoryQuery = gql`
  query factoryQuery($block: Block_height) {
    factories(first: 1, block: $block) {
      id
      volumeUSD
      liquidityUSD
    }
  }
`

const bundleFields = gql`
  fragment bundleFields on Bundle {
    id
    ethPrice
  }
`

const  ethPriceQuery = gql`
  query ethPriceQuery($id: Int! = 1, $block: Block_height) {
    bundles(id: $id, block: $block) {
      ...bundleFields
    }
  }
  ${bundleFields}
`

export const exchange = async (chainId = 1, query, variables = {}) =>
  // @ts-ignore TYPE NEEDS FIXING
  pager("https://api.thegraph.com/subgraphs/name/sushiswap/exchange", query, variables)

export const getFactory = async (chainId = 1, variables = undefined) => {
  const { factories } = await exchange(chainId, factoryQuery, variables)
  return factories[0]
}

export const getBundle = async (
  chainId = 1,
  query = ethPriceQuery,
  variables = {
    id: 2,
  }
) => {
  return exchange(chainId, query, variables)
}

export const getNativePrice = async (chainId = 1, variables = undefined) => {
  // console.log('getEthPrice')
  const data = await getBundle(chainId, undefined, variables)
  return data
}

export function useNativePrice({
  chainId = 1,
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}) {
  //const url = shouldFetch ? ['http://test.com/', chainId, stringify(variables)] : null;
  const url = "ppppppppppppppppppppp"
  return useSWR(
    url,
    // @ts-ignore TYPE NEEDS FIXING
    () => getNativePrice(chainId, variables),
    swrConfig
  )
}


export function useNativePriceWithLoadingIndicator({ chainId = 1 }) {
  const { data } = useNativePrice({ chainId })
  return useMemo(() => {
    if (!data) return { data: undefined, loading: true }
    try {
      return { data: data, loading: false }
    } catch (error) {
      return { data: undefined, loading: true }
    }
  }, [data])
}

async function aysncPrice(query = ethPriceQuery,
  variables = {
    id: 2,
  }) {
  
  let data = {}
  
  const req = await request("https://api.thegraph.com/subgraphs/name/sushiswap/exchange", query, variables)

  Object.keys(req).forEach((key) => {
    data[key] = data[key] ? [...data[key], ...req[key]] : req[key]
  })

  return data
}


function PriceTwoWay() {
  const { loading: loadingQuery, data: price } = useQuery(ethPriceQuery, {
    variables: { id: 1 },
  })
  
  console.log("useQuery: ", price)
  console.log("useQueryLoading: ", loadingQuery)

  const chainId = 1
  const { loading: loadingSWR, data: ethPrice } = useNativePriceWithLoadingIndicator({chainId})

  console.log("useSWR: ", ethPrice)
  //const data = pager("https://api.thegraph.com/subgraphs/name/sushiswap/exchange", ethPriceQuery, {id: 1})
  console.log("useSWRLoading: ", loadingSWR)

  const asyncPrice = aysncPrice({})

  console.log("asyncPrice", asyncPrice)

  return <div>Test</div>
}

function MyTest() {
  return (
    <div>
      <h2>My first Apollo app</h2>
      <PriceTwoWay />
    </div>
  );
}

export default MyTest;
