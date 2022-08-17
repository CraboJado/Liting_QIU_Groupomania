import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { Link } from "react-router-dom";
import Form from '../../components/form/Form';

export default function Signup() {
  return (
    <div>
      <Header>
        <Link to = '/login'  className='btn' >login</Link>
      </Header>
      <Form/>
      <Footer/>
    </div>
  )
}

