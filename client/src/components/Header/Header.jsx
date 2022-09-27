import React  from 'react';
import './header.scss';

export default function Header(props) {

  return (
    <header className='header'>
      <h1 className="header__logo">
        <img className="header__img" src ={"./logos/icon-left-font-monochrome-white.svg"} alt="Groupomania logo"/>
      </h1>
        { props.children }
    </header>
  )
}
