import React,{ useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck,faXmark } from '@fortawesome/free-solid-svg-icons';
import { GlobleContext } from '../..';

export default function PswErrMsg() {
    const { state } = useContext(GlobleContext);

    const { isLowCase, isUpCase, isNbr, isMinLength } = state.isPswValid

  return (
        <div className='password-error'>
            <h2 className='password-error__title'>Le mot de passe doit contenir les éléments suivants :</h2>
            
            <div className='password-error__msg'>
                { !isLowCase ? 
                <FontAwesomeIcon icon={ faXmark } className="invalid"/> 
                : 
                <FontAwesomeIcon icon= {faCheck } className = "valid"/>
                }
                <p id="letter" className= {!isLowCase ? "invalid" : "valid"}>Une lettre <b>minuscule</b></p>
            </div>

            <div className='password-error__msg'>
                { !isUpCase ? 
                <FontAwesomeIcon icon={ faXmark } className="invalid"/> 
                : 
                <FontAwesomeIcon icon= {faCheck } className = "valid"/>
                }
                <p id="capital" className= {!isUpCase ? "invalid" : "valid"}>Une lettre <b>majuscule</b></p>
            </div>

            <div className='password-error__msg'>
                { !isNbr ? 
                <FontAwesomeIcon icon={ faXmark } className="invalid"/> 
                : 
                <FontAwesomeIcon icon= {faCheck } className = "valid"/>
                }
                <p id="number" className= {!isNbr ? "invalid" : "valid"}>un <b>nombre</b></p>
            </div>

            <div className='password-error__msg'>
                { !isMinLength ? <FontAwesomeIcon icon={ faXmark } className="invalid"/> : <FontAwesomeIcon icon= {faCheck } className = "valid"/>}
                <p id="length" className= {!isMinLength ? "invalid" : "valid"}>Minimum <b>8 caractères</b></p>
            </div>
        </div>
  )
}
