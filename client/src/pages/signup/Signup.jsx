import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { Link } from "react-router-dom";
import Form from '../../components/signupForm/Form';
import './signup.scss'

export default function Signup() {
  return (
    <div className='signup'>
      <Header>
        <div className="linkWrap header__linkWrap">
          <Link to = '/login'  className='link header__link' >S'identifier</Link>
        </div>
      </Header>
      <Form/>
      <Footer/>
    </div>
  )
}

