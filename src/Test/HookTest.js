import { useEffect, useState } from "react"
import { Link } from 'react-router-dom';


const HookTest = () => {
  const [value, setValue] = useState(0);

  //useEffect()
  return <div>
        <button onClick={() => {setValue(value + 1)}} >{value}</button>
        <li>
          <Link to="/home">
            <i className="fas fa-user" />{' '}
            <span className="hide-sm">Home</span>
          </Link>
        </li>
    </div>
}

export default HookTest;