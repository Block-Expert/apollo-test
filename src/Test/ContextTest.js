import {createContext, useEffect, useState, useMemo} from 'react'
import MyComponent from './MyComponent'
const ContextTest = () => {
  const count = useMemo(() => {
    console.log("ContextTest --- useMemo")
  }, [])
  return (
    <UserContext.Provider value = {count}>
      <MyComponent/>
    </UserContext.Provider>
  )
}

const UserContext = createContext({count: 1})
export default ContextTest

