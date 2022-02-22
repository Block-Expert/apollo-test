import {useContext} from 'react'
import {UserContext} from './ContextTest'

const MyComponent = () => {
  const {count} = useContext(UserContext)
  return <div>MyComponent  {count}</div>
}