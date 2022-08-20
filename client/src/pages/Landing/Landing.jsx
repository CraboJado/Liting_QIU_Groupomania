import React  ,{useState} from 'react';
import Header from '../../components/header/Header';
import LandingCenter from '../../components/landingCenter/LandingCenter';
import Footer from '../../components/footer/Footer';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars,faXmark } from '@fortawesome/free-solid-svg-icons';
import './landing.scss';

export default function Landing() {
  const [isShow, setIsShow] = useState(false);

  const clickHandler = () => {
      setIsShow(!isShow)
  }
  return (
    <div className='landing'>
        <Header>
          {isShow ? 
          <FontAwesomeIcon icon={faXmark} onClick = {clickHandler}/>:
          <FontAwesomeIcon icon={faBars} onClick = {clickHandler}/> }
          
          {isShow && 
            <div className='dropDown'>
              <Link to = '/signup' className='btn'>signup</Link>
              <Link to = '/login'  className='btn' >login</Link>
            </div>
          }
        </Header>
        <LandingCenter/>
        <Footer/>
    </div>
  )
}
