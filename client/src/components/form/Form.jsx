import React, { useReducer } from 'react';
import { useNavigate } from "react-router-dom";
import Input from '../input/Input';
import GenErrMsg from '../input/GenErrMsg';
import PswErrMsg from '../input/PswErrMsg';
import Select from '../select/Select';
import './form.scss';
import axios from 'axios';
import { GlobleContext } from '../..';

// manage states with useReducer and useContext
const initialState = {
  user : {
    email:"",
    password:"",
    name:"",
    department:"",
    position:""
  },
  isInputValid:{
    email:false,
    password:false,
    name : false
  },
  isPswValid:{
    isLowCase : false, 
    isUpCase :false, 
    isNbr :false, 
    isMinLength : false
  },
  msgErr: {
    email:"",
    name :"",
    popup:"pop"
  },
  isBtnDisabled:false,
}

const isPswPatternMatched = (value)=> {
    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;

    const isLowCase = lowerCaseLetters.test(value) ? true : false;
    const isUpCase = upperCaseLetters.test(value) ? true : false;
    const isNbr = numbers.test(value) ? true : false;
    const isMinLength = value.length >= 8 ? true : false;

    return {
      isLowCase,
      isUpCase,
      isNbr,
      isMinLength
    }
}



const reducer = (prevState, action) => {

  switch(action.type){
    case 'checkInput':
      return {...prevState,
              isInputValid:{...prevState.isInputValid,[action.name] : action.patternMismatch},
              msgErr:{...prevState.msgErr, [action.name]: `${action.name} format is not correct` },
              user : {...prevState.user,[action.name] : action.value},
              isBtnDisabled:false
            }

    case 'checkPasswordPattern':
        const resObj = isPswPatternMatched(action.value);
        return {...prevState, 
                  isPswValid: {...resObj} }

    case 'getSeletedItem' :
      return {...prevState,
              user:{...prevState.user,[action.name] : action.value}
            }

    case 'showPopup' :
      return {...prevState,
              msgErr:{...prevState.msgErr,popup: action.errorMsg},
              isBtnDisabled:true
            } 

    default:
      return prevState
      
  }
}

// export const GlobleContext = React.createContext()

export default function Form() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const handleChange = (e) => {
      if(e.target.type === 'password'){
        dispatch({
          type:'checkPasswordPattern',
          value: e.target.value
        })
      }

      dispatch({
        type:'checkInput',
        patternMismatch:e.target.validity.patternMismatch,
        name:e.target.name,
        value: e.target.value
      })
  }

  const handleSubmit = (e) => { 
    e.preventDefault();
    if(!state.user.email || !state.user.name || !state.user.password || !state.user.department ||!state.user.position ||
      state.isInputValid.email ||  state.isInputValid.name || state.isInputValid.password ){
        return dispatch({
              type:'showPopup',
              errorMsg:'veuillez remplir les champs correctment'
            })
      }

    axios({
      method: 'post',
      url: 'http://localhost:5000/api/auth/signup',
      data: state.user
    })
    .then(() => {
      // login user just signuped
      const {email, password} = state.user
      return axios({
              method:'post',
              url:'http://localhost:5000/api/auth/login',
              data : {email, password}
            })
    })
    .then( res =>{
      // get the token sent by API and stock in localstorage
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate("/home",{replace:true})

    })
    .catch( err => {
      // popup error message 
      if(err.response.data.errorMsg ==='ER_DUP_ENTRY') {
        return  dispatch({
                type:'showPopup',
                errorMsg:'email existe déjà, veuillez en utiliser un autre'
              })
      }

      return dispatch({
              type:'showPopup',
              errorMsg:'il y a un problème, veuillez réessayer'
            })
    })
  }

  return (
    <GlobleContext.Provider value = {{
      state,
      dispatch
    }}>
      <div className='signupFormWrap'>
        <form>
            <Input type = {'email'} name = {'email'}  pattern ="^[-\w_]+@{1}[-\w]{2,}[.]{1}[a-z]{2,5}$" onChange={handleChange}/>
            {state.isInputValid.email && <GenErrMsg type = {'email'}></GenErrMsg>}

            <Input type = {'password'} name = {'password'}  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" onChange={handleChange}/>
            {state.isInputValid.password && <PswErrMsg></PswErrMsg>}

            <Input type = {'text'} name = {'name'}  pattern ="^[-a-zA-Z]+$" onChange={handleChange} />
            {state.isInputValid.name && <GenErrMsg type = {'name'}></GenErrMsg>}

            <Select name = {'department'} />
            <Select name = {'position'}  /> 

            <div className='submitWrap'>
              <button onClick = {handleSubmit} disabled = {state.isBtnDisabled}> Sign Up </button>
              {state.isBtnDisabled && <div className='popup'> {state.msgErr.popup} </div>}
            </div>
        </form>
      </div>
    </GlobleContext.Provider>
  )
}

