import React, { useReducer } from 'react';
import { useNavigate } from "react-router-dom";
import Input from './Input';
import GenErrMsg from './GenErrMsg';
import PswErrMsg from './PswErrMsg';
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
    email:true,
    password:true,
    name : true
  },
  isPswValid:{
    isLowCase : true, 
    isUpCase :true, 
    isNbr :true, 
    isMinLength : true
  },
  popupErrMsg:"",
  isBtnDisabled:false,
}

const reducer = (prevState, action) => {

  switch(action.type){
      case 'checkInput':
      return { ...prevState,
              isInputValid:{ ...prevState.isInputValid,
                             [action.name] : action.validity
              }
      }
    
    case 'setUser' : 
      return { ...prevState,
              user : { ...prevState.user,
                      [action.name] : action.value
              }        
      }
    
    case 'setErrMsg' :
      return { ...prevState,
              msgErr:{...prevState.msgErr, 
                    [action.name]: action.msg 
              }        
      }

    case 'checkPassword':
        return { ...prevState, 
                isPswValid: { ...action.value } 
        }

    case 'getSeletedItem' :
      return {...prevState,
              user:{ ...prevState.user,
                     [action.name] : action.value
              }
      }

    case 'showPopup' :
      return { ...prevState,
              popupErrMsg:action.value
      }

    case 'disableBtn' : 
      return { ...prevState,
               isBtnDisabled:action.value        
      }

    default:
      return prevState
  }
}


export default function Form() {

  const [state, dispatch] = useReducer(reducer, initialState);

  const navigate = useNavigate();

  const handleSubmit = e => { 
    e.preventDefault();

    if(!state.user.email || !state.user.name || !state.user.password || !state.user.department ||!state.user.position ||
      !state.isInputValid.email ||  !state.isInputValid.name || !state.isInputValid.password ){
        dispatch({
          type:'showPopup',
          value:'veuillez remplir les champs correctment'
        })

        dispatch({
          type:'disableBtn',
          value:true
        })
        
        return
      }

    axios({
      method: 'post',
      url: 'http://localhost:5000/api/auth/signup',
      data: state.user
    })
    .then(() => {
      // login user just signuped
      const { email, password } = state.user
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
          dispatch({
            type:'showPopup',
            value:'email existe déjà, veuillez en utiliser un autre'
          })

          dispatch({
            type:'disableBtn',
            value:true
          })
          return
      }

      dispatch({
        type:'showPopup',
        value:'il y a un problème, veuillez réessayer'
      })

      dispatch({
        type:'disableBtn',
        value:true
      })
    })
  }

  return (
    <GlobleContext.Provider value = {{
      state,
      dispatch
    }}>
      <div className='form-wrap'>
        <form className='form'>
            <div className="form__email">
              <Input type = {'email'} name = {'email'}  text ={'Email'} pattern = "^[-\w_]+@{1}[-\w]{2,}[.]{1}[a-z]{2,5}$" />
              {!state.isInputValid.email && <GenErrMsg  type = {'email'}/> }
            </div>

            <div className="form__password">
              <Input type = {'password'} name = {'password'}  text ={'Mot de passe'} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"/>
              {!state.isInputValid.password && <PswErrMsg/> }
            </div>

            <div className="form__username">
              <Input type = {'text'} name = {'name'}  text ={'Nom'} pattern ="^[-a-zA-Z]+$" />
              {!state.isInputValid.name && <GenErrMsg  type = {'name'}/> }
            </div>

            <Select name = {'department'} text = {'départment'}/>

            <Select name = {'position'}  text = {'position'} /> 

            <div className='form__submit'>
              <button className='submit-btn' onClick = {handleSubmit} disabled = {state.isBtnDisabled}> S'inscrire </button>
              {state.isBtnDisabled && <div className='submit-error'> {state.popupErrMsg} </div>}
            </div>
        </form>
      </div>
    </GlobleContext.Provider>
  )
}

