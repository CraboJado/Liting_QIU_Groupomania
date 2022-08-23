import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import LoginForm from '../../components/loginForm/LoginForm';
import { Link } from "react-router-dom";


export default function Login() {
  return (
    <div>
      <Header>
        <Link to = '/signup'  className='btn' >signup</Link>
      </Header>
      <LoginForm/>
      <Footer/>
    </div>
  )
}
