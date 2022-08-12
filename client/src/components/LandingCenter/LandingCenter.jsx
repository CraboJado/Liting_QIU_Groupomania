import React from 'react';
import { Link } from "react-router-dom";
import './landingCenter.scss'

export default function LandingCenter() {
  return (
    <div className='LandingCenter'>
        <h2>
            Bienvenue à votre communauté de Groupomania <br/>
            S'exprimez, Partagez , Rigolez ensemble
        </h2>
        <img src="./logos/icon-left-font-monochrome-black.png" alt="" />
        <h2>
            <Link to = '/signup' className='btn'>Rejoignez vos collègues</Link>
        </h2>
    </div>
  )
}
