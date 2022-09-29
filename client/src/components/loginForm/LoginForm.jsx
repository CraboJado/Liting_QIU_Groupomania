import React ,{  useReducer } from 'react';
import { useNavigate } from "react-router-dom";
import './loginForm.scss'
import Input from './Input';
import ErrMsg from './ErrMsg';
import { GlobleContext } from '../..';
import axios from 'axios';

const initialState = {
    user:{
      email:"",
      password:""
    },
    status:""
}

const reducer = (prevState, action) => {
    switch(action.type){

        case 'setUser':
            return {...prevState,
                    user:{...prevState.user, 
                        [action.name]:action.value 
                    }
            }
        
        case 'setStatus' :
            return {...prevState,
                    status:action.status,
            }
        
        default :
            return prevState
    }
}

export default function LoginForm() {

  const [state, dispatch] = useReducer(reducer,initialState);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!state.user.email || !state.user.password ){
        return
    }

    const { email, password } = state.user

    axios({
        method:'post',
        url:'http://localhost:5000/api/auth/login',
        data : {email, password}
    })
    .then( res => {
        localStorage.setItem('user', JSON.stringify(res.data));       
        // navigate("/home",{replace:true})
        navigate("/home")
    })
    .catch(err => {
        dispatch({
            type:'setStatus',
            status: err.request.status
        })
    })
}

  return (
    <GlobleContext.Provider value = { {
        state,
        dispatch
    }}>
        <div className='login-form-wrap'>
            <form className='login-form'>
                <div className="login-form__input">
                    <div className="email">
                        <Input type = {'email'} name = {'email'}  text = {'Email'} pattern ="^[-\w_]+@{1}[-\w]{2,}[.]{1}[a-z]{2,5}$" />
                        {state.status === 404 && <ErrMsg/>}
                    </div>
                    <div className="password">
                        <Input type = {'password'} name = {'password'}  text = {'Mot de passe'} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" />
                        {state.status === 401 && <ErrMsg/>}
                    </div>
                </div>
                <button className='login-form__submit-btn'  onClick={handleSubmit}> S'identifier </button>
            </form>
        </div>

    </GlobleContext.Provider>
  )
}


