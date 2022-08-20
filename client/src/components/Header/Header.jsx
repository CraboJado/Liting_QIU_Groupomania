import React from 'react';
import './header.scss'

export default function Header(props) {
  return (
    <header className='header'>
        <img src ={"./logos/icon-left-font-monochrome-white.svg"} alt="Groupomania logo"/>
        <nav className='headerNav'>
            {props.children}
        </nav>
    </header>
  )
}
