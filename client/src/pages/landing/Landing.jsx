import React from 'react';
import Header from '../../components/header/Header';
import HeaderNav from '../../components/header/HeaderNav';
import LandingCenter from '../../components/landingCenter/LandingCenter';
import Footer from '../../components/footer/Footer';

import './landing.scss';

export default function Landing() {

  return (
    <div className='landing'>
        <Header>
          <HeaderNav/>
        </Header>
        <LandingCenter/>
        <Footer/>
    </div>
  )
}
