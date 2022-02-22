import { request } from 'graphql-request'
import useSWR from 'swr'
import stringify from 'fast-json-stable-stringify'
import { useMemo } from 'react'

import {useQuery, gql} from "@apollo/client";

export const getKashiPairsDayDataQuery = gql`
  query getDataKashiPairsDayData ($skip: Int){
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

// @ts-ignore TYPE NEEDS FIXING
export async function pager(endpoint, query, variables = {}) {
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
      if (entry.length === 1000) 
      {
        console.log("sssssssssssssss")
        flag = true
      }
    })

    if(skip === 3000) break;

    // @ts-ignore TYPE NEEDS FIXING
    if (Object.keys(variables).includes('first') && variables['first'] !== undefined) break

    skip += 1000
    variables = { ...variables, skip }
  }
  return data
}

const fetcher = async (chainId = 1, query, variables = undefined) =>
  // @ts-ignore TYPE NEEDS FIXING
  pager("https://api.thegraph.com/subgraphs/name/sushiswap/bentobox", query, variables)


  export const getBundle = async (
    chainId = 1,
    query = getKashiPairsDayDataQuery,
    variables = {
      skip: 0,
    }
  ) => {
    return fetcher(chainId, query, variables)
  }
export const getDatakashiPairsDayData = async (chainId = 1, variables = undefined) => {
  const data = await getBundle(chainId, getKashiPairsDayDataQuery)
  return data
}

// @ts-ignore TYPE NEEDS FIXING
export function useDataKashiPairsDayData({ chainId = 1, shouldFetch = true, swrConfig = undefined, variables }) {
  return useSWR(shouldFetch ? () => ['dataKashiPairsDayData', chainId, stringify(variables)] : null, 
  (_, chainId) => getDatakashiPairsDayData(chainId, variables), 
  swrConfig)
}

export function useDataKashiPairsDayDataWithLoadingIndicator() {
  // Bandaid solution for now, might become permanent
  const {data} = useDataKashiPairsDayData({})
  return useMemo(() => {
    if (!data ) return { data: undefined, loading: false }
    try {
      return { data: data, loading: true }
    } catch (error) {
      return { data: undefined, loading: false }
    }
  }, [data])
}

function KashiPairsDayData () {
  const variables = {skip: 0}
  // const { loading: loadingKashiPairs, data: dataKashiPairsDayData0 } = useDataKashiPairsDayDataWithLoadingIndicator({ })

  const chainId = 1
  const {data: dataKashiPairsDayData0} = useDataKashiPairsDayData({chainId, variables})
  //const { loading: loadingKashiPairs, error, data: dataKashiPairs } = data
  console.log('data', dataKashiPairsDayData0)
  //console.log('loading', loadingKashiPairs)
  //clones = useClones({ variables})
  // const { loading, data } = useClones({ variables })


  // const {loading, error, data} = useQuery(getKashiPairsDayDataQuery, {variables: {skip: 1}},)
  // // const {data} = useDataKashiPairsDayData({variables})
  //   console.log(data)
  //   console.log(loading)

  return (
    <div>Use SWR Test</div>
  )
}

export default KashiPairsDayData