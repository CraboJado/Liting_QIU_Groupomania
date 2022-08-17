import React , { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Input from '../input/Input';
import Select from '../select/Select';
import './form.scss';

export default function Form() {
  
  const [user, setUser] = useState({
    email:"",
    password:"",
    name:"",
    department:"",
    position:""
  });

  const [popup, setPopup] = useState({
    isShow : true,
    popupMsg : ""
  });

  const [isInputValid, setInputValid] = useState({
    email:true,
    password:true,
    name : true
  })
  
  const nagivate = useNavigate();

  const setUserHandler = (e) => {
    e.target.validity.patternMismatch ? 
    setInputValid( prev => ({...prev,[e.target.name]:false })):
    setInputValid( prev => ({...prev,[e.target.name]:true })) ; 
    
    setUser( prev => ({...prev, [e.target.name]:e.target.value}) )
  }

  const handleClick = (e) => {
    e.preventDefault();
    // check Input validity before sending data to API
    if(!user.email || !user.name || !user.password || !user.department ||!user.position ||
      !isInputValid.email || !isInputValid.name || !isInputValid.password )
      return 
    
    // send user datas to API for signup
    axios({
      method: 'post',
      url: 'http://localhost:5000/api/auth/signup',
      data: user
    })
    .then( res => {
      // redirect to homePage
      nagivate("/home",{replace:true})
    })
    .catch( err => {
      // popup error message 
      if(err.response.data.errorMsg ==='ER_DUP_ENTRY') 
      return setPopup( prev => ({...prev,isShow : false, popupMsg : "email existe déjà, veuillez en utiliser un autre"}))
    
      setPopup( prev => ({...prev,isShow : false, popupMsg : "il y a un problème, veuillez réessayer"}))
    })
  }

  const handleBlur = () => {
    if(!user.email || !user.name || !user.password || !user.department ||!user.position ||
      !isInputValid.email || !isInputValid.name || !isInputValid.password )
      return
    setPopup( prev => ({...prev, isShow:true}))
  }

  return (
    <div className='formWrap'>
      <form>
          <Input type = {'email'} name = {'email'} setUserHandler = {setUserHandler} pattern ="^[-\w_]+@{1}[-\w]{2,}[.]{1}[a-z]{2,5}$" />
          <Input type = {'password'} name = {'password'} setUserHandler = {setUserHandler} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" />
          <Input type = {'text'} name = {'name'} setUserHandler = {setUserHandler} pattern ="^[-a-zA-Z]+$" />
          <Select name = {'department'} setUserHandler = {setUserHandler}/>
          <Select name = {'position'} setUserHandler = {setUserHandler}/> 
          <div className='submitWrap'>
            <button onClick = {handleClick} onBlur = {handleBlur}> Sign Up </button>
            {!popup.isShow && <div className='popup'> {popup.popupMsg} </div>}
          </div>
      </form>
    </div>

  )
}
