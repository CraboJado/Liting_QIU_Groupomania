import React from 'react';
import './header.scss'

export default function Header(pros) {
  return (
    <header className='header'>
        <img src ={"./logos/icon-left-font-monochrome-white.svg"} alt="Groupomania logo"/>
        <nav className='headerNav'>
            {pros.children}
        </nav>
    </header>
  )
}
