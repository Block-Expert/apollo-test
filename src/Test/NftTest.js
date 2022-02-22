import { gql} from "@apollo/client";

import { request } from 'graphql-request'
import useSWR from 'swr'
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

const  getNftInfos = gql`
  query getNftInfos($skip: Int) {
    owners(first: 1000, skip: $skip, where: {count_gt: 0}) {
      id
      owner
      count
    }
  }
`

export const fetcher = async (chainId = 1, query, variables = {}) =>
  // @ts-ignore TYPE NEEDS FIXING
  pager("https://api.thegraph.com/subgraphs/name/techinnovation-blockchain/abcthornft", query, variables)


export const getNftLists = async (chainId = 1, variables = undefined) => {
  const data = await fetcher(chainId, getNftInfos, variables)
  return data
}

export function useNftLists({
  chainId = 1,
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}) {
  const url = "getNftLists"
  return useSWR(
    url,
    // @ts-ignore TYPE NEEDS FIXING
    () => getNftLists(chainId, variables),
    swrConfig
  )
}

export function useNftListsWithLoadingIndicator() {
  const {data} = useNftLists({})
  return useMemo(() => {
    if (!data ) return { data: undefined, loading: false }
    try {
      return { data: data, loading: true }
    } catch (error) {
      return { data: undefined, loading: false }
    }
  }, [data])
}

function sendAvax(nftList) {
  console.log(nftList)
  Object.keys(nftList).forEach((key) => {
    // send 50* nft.count
    console.log(`send to ${nftList[key].id}: Avax Amount ${50 * nftList[key].count}`)
  })
}
function NftTest() {
 
  const chainId = 1
  const {loading: loadingNftList, data: nftList} = useNftListsWithLoadingIndicator({chainId})

  if(loadingNftList === true){
    sendAvax(nftList.owners)
  }
  return <div>Test</div>
}

export default NftTest;
