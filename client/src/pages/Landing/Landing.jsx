import React from 'react';
import Header from '../../components/Header/Header';
import LandingCenter from '../../components/LandingCenter/LandingCenter';
import Footer from '../../components/Footer/Footer';
import './landing.scss';



export default function landing() {
  return (
    <div className='landing'>
        <Header/>
        <LandingCenter/>
        <Footer/>
    </div>
  )
}
