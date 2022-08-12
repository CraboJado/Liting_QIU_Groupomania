import React from 'react';
import { Link } from "react-router-dom";
import './landingCenter.scss'

export default function LandingCenter() {
  return (
    <div className='landingCenter'>
        <h2>
            Bienvenue à votre communauté<br/>
            S'exprimez, Partagez , Rigolez ensemble
        </h2>
        <img src="./logos/icon-left-font-monochrome-black.png" alt="" />
        <h3 className='btn'>
            <Link to = '/signup' >Rejoignez vos collègues</Link>
        </h3>
    </div>
  )
}
