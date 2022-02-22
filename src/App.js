import { request } from 'graphql-request'
import gql from 'graphql-tag'
import useSWR from 'swr'
import stringify from 'fast-json-stable-stringify'
import { useMemo } from 'react'
import { Link } from 'react-router-dom';

export const getKashiPairsQuery = gql`
  query GetPairs($skip: Int) {
    bentoBoxes {
      totalTokens
      totalKashiPairs
      totalUsers
    }
    kashiPairs(first: 1000, skip: $skip, orderBy: totalAssetElastic, orderDirection: desc) {
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
        console.log("ddddddddddddd")
        flag = true
      }
    })

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


export const getDatakashiPairs = async (chainId = 1, variables = undefined) => {
  const data = await fetcher(chainId, getKashiPairsQuery)
  return data
}

// @ts-ignore TYPE NEEDS FIXING
export function useDataKashiPairs({ chainId = 1, shouldFetch = true, swrConfig = undefined, variables = undefined }) {
  const data = useSWR(shouldFetch ? () => ['dataKashiPairs', chainId, stringify(variables)] : null, (_, chainId) => getDatakashiPairs(chainId, variables), swrConfig)
  return data
}

export function useDataKashiPairsWithLoadingIndicator() {
  // Bandaid solution for now, might become permanent
  const {data} = useDataKashiPairs({})
  return useMemo(() => {
    if (!data ) return { data: undefined, loading: false }
    try {
      return { data: data, loading: false }
    } catch (error) {
      return { data: undefined, loading: true }
    }
  }, [data])
}

function App () {
  const variables = {skip: 0}
  const { loading: loadingKashiPairs, data: dataKashiPairs } = useDataKashiPairsWithLoadingIndicator()
  //const { loading: loadingKashiPairs, error, data: dataKashiPairs } = data
  console.log('data', dataKashiPairs)
  console.log('loading', loadingKashiPairs)
  //clones = useClones({ variables})
  // const { loading, data } = useClones({ variables })


  // const {data} = useDataKashiPairs({variables})

  // console.log(data)

  return (
    <div>Use SWR Test
      <li>
          <Link to="/hook">
            <i className="fas fa-user" />{' '}
            <span className="hide-sm">HookTest</span>
          </Link>
        </li>
    </div>
  )
}

export default App