import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck,faXmark } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react'
// import { GlobleContext } from '../form/Form'
import { GlobleContext } from '../..'

export default function PswErrMsg() {
    const { isLowCase, isUpCase, isNbr, isMinLength } = useContext(GlobleContext ).state.isPswValid

  return (
        <div className='pswErrMsgWrap'>
            <h3>Password must contain the following:</h3>
            
            <div className='MsgWrap'>
                { isLowCase ? <FontAwesomeIcon icon={ faCheck } className="valid"/> : <FontAwesomeIcon icon= {faXmark} className = "invalid"/>}
                <p id="letter" className= {isLowCase ? "valid" : "invalid"}>A <b>lowercase</b> letter</p>
            </div>

            <div className='MsgWrap'>
                { isUpCase ? <FontAwesomeIcon icon={ faCheck } className="valid"/> : <FontAwesomeIcon icon= {faXmark} className = "invalid"/>}
                <p id="capital" className= {isUpCase ? "valid" : "invalid"}>A <b>capital (uppercase)</b> letter</p>
            </div>

            <div className='MsgWrap'>
                { isNbr ? <FontAwesomeIcon icon={ faCheck } className="valid"/> : <FontAwesomeIcon icon= {faXmark} className = "invalid"/>}
                <p id="number" className= {isNbr ? "valid" : "invalid"}>A <b>number</b></p>
            </div>

            <div className='MsgWrap'>
                { isMinLength ? <FontAwesomeIcon icon={ faCheck } className="valid"/> : <FontAwesomeIcon icon= {faXmark} className = "invalid"/>}
                <p id="length" className= {isMinLength ? "valid" : "invalid"}>Minimum <b>8 characters</b></p>
            </div>
        </div>
  )
}
