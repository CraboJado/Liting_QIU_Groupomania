import React , { useState } from 'react';
import PswErrMsg from './PswErrMsg';
import GenErrMsg from './GenErrMsg';
import './input.scss';

export default function Input(props) {

  const { type, name , setUserHandler, pattern } = props;

  const [isValid, setValid] = useState(true);
  const [msgErr, setMsgErr] = useState("");
  const [isMatchPswReg,setIsMatchPswReg] = useState({
    isLowCase:false,
    isUpCase:false,
    isNbr : false,
    isMinLength: false
  })

  const setIsMatchPswRegHandler = (value) => {
    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;

    lowerCaseLetters.test(value) ? 
    setIsMatchPswReg( (prev) => ({...prev,isLowCase:true})) : 
    setIsMatchPswReg( (prev) => ({...prev,isLowCase:false})) ;

    upperCaseLetters.test(value) ?
    setIsMatchPswReg( (prev) => ({...prev,isUpCase:true})) : 
    setIsMatchPswReg( (prev) => ({...prev,isUpCase:false})) ;

    numbers.test(value) ?
    setIsMatchPswReg( (prev) => ({...prev,isNbr:true})) : 
    setIsMatchPswReg( (prev) => ({...prev,isNbr:false})) ;

    value.length >= 8 ?
    setIsMatchPswReg( (prev) => ({...prev,isMinlength:true})) : 
    setIsMatchPswReg( (prev) => ({...prev,isMinlength:false})) ;

  }

  const handleChange = (e)=> {
    const msgErr = type === 'email' ? 
                  "le format du email non conform" : 
                  " le format du nom non conform" ;

    e.target.validity.patternMismatch ? setValid(false) : setValid(true) ;
    e.target.validity.patternMismatch ? setMsgErr(msgErr) : setMsgErr("") ;


    if(type === 'password') setIsMatchPswRegHandler(e.target.value);

    // pass data to parent component Form to update user state in Form
    setUserHandler(e);
  }

  return (
    <div className='userInputWrap'>
        <div className='userInput'>
            <label htmlFor= {name}> {name} </label>
            <input type= {type} id= {name} name= {name} onChange= { handleChange } required  pattern={pattern}/>
        </div>

        { !isValid && type !== 'password' && <GenErrMsg msgErr = {msgErr} />}

        { !isValid && type === 'password' && <PswErrMsg isMatchPswReg = {isMatchPswReg} /> }
     
    </div>
  )
}
