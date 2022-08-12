import React, {useState} from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import './header.scss'

export default function Header() {
    const [isShow, setIsShow] = useState(false);

  return (
    <div className='header'>
        <img src ={"./logos/icon-left-font-monochrome-white.svg"} alt="Groupomania logo"/>
        <nav>
            <FontAwesomeIcon icon={faBars} onClick = {() => {
                setIsShow(!isShow)
            }}/>

            {isShow && 
            <div>
                <Link to = '/signup' className='btn'>signup</Link>
                <Link to = '/login'  className='btn' >login</Link>
            </div>
            }
        </nav>
    </div>
  )
}
