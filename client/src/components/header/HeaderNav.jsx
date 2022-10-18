import React , { useState } from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faXmark } from '@fortawesome/free-solid-svg-icons';

export default function HeaderNav(props) {
    const [isShow, setIsShow] = useState(false);

    const clickHandler = () => {
        setIsShow(!isShow)
    }

  return (
    <nav className='header__nav'>
        {isShow ? 
        <FontAwesomeIcon icon={faXmark} onClick = {clickHandler}/>
        :
        <FontAwesomeIcon icon={faBars} onClick = {clickHandler} className = "header__menu-icon"/> 
        }
          
        {isShow && 
        <div className='header__dropDown'>
            <Link to = '/signup' className='header__button--dark'>S'inscrire</Link>
            <Link to = '/login'  className='header__button--dark' >S'identifier</Link>
        </div>
        }

        <div className='header__dropDown--MS'>
            <Link to = '/signup' className='header__button--dark'>S'inscrire</Link>
            <Link to = '/login'  className='header__button--dark' >S'identifier</Link>
        </div>
    </nav>
  )
}
