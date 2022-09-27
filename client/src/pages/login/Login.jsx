import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import LoginForm from '../../components/loginForm/LoginForm';
import { Link } from "react-router-dom";


export default function Login() {
  return (
    <div className='login'>
      <Header>
        <div className='linkWrap header__linkWrap'>
          <Link to = '/signup'  className='link header__link' >S'inscrire</Link>
        </div>
      </Header>
      <LoginForm/>
      <Footer/>
    </div>
  )
}
