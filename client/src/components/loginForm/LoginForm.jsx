// import React ,{ useState, useReducer } from 'react';
import React ,{  useReducer } from 'react';
import { useNavigate } from "react-router-dom";
import './loginForm.scss'
import Input from '../input/Input';
import GenErrMsg from '../input/GenErrMsg';
// import { GlobleContext} from '../form/Form';
import { GlobleContext } from '../..';
import axios from 'axios';

const initialState = {
    user:{
      email:"",
      password:""
    },
    msgErr: {
     email:"",
     password:"",
    },
    status:""
}

const reducer = (prevState, action) => {
    switch(action.type){
        case 'handleInput':
            return {...prevState,
                    user:{...prevState.user, [action.name]:action.value },
                    status:""
                   }
        
        case 'handleStatus' :
            return {...prevState,
                    status:action.status,
                    msgErr : {...prevState.msgErr, [action.attribute] : action.msgErr }
                    }
        
        default :
            return prevState
    }
}

export default function LoginForm() {

  const [state, dispatch] = useReducer(reducer,initialState);
  const navigate = useNavigate();

  const handleChange = (e) => {
    dispatch({
        type:'handleInput',
        value:e.target.value,
        name:e.target.name
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!state.user.email || !state.user.password ){
        return
    }

    const {email, password} = state.user
    axios({
        method:'post',
        url:'http://localhost:5000/api/auth/login',
        data : {email, password}
    })
    .then( res => {
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate("/home",{replace:true})
    })
    .catch(err => {

        if(err.request.status === 404) {
            dispatch({
                type:'handleStatus',
                status:err.request.status,
                msgErr : 'le compte n\'exists pas',
                attribute:'email'
            })
        }

        if(err.request.status === 401) {
            dispatch({
                type:'handleStatus',
                status:err.request.status,
                msgErr : 'le mot de pass incorrect',
                attribute:'password'
            })
        }
    })
}

  return (
    <GlobleContext.Provider value = { {
        state,
        dispatch
    }}>
        <div className='formWrap'>
            <form>
                <div className="inputWrap">
                    <Input type = {'email'} name = {'email'}  pattern ="^[-\w_]+@{1}[-\w]{2,}[.]{1}[a-z]{2,5}$" onChange = {handleChange}/>
                    {state.status === 404 && <GenErrMsg type = {'email'}/>}
                    <Input type = {'password'} name = {'password'}  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" onChange = {handleChange}/>
                    {state.status === 401 && <GenErrMsg type = {'password'}/>}
                </div>
                <button className='btn'  onClick={handleSubmit}> Login </button>
            </form>
        </div>

    </GlobleContext.Provider>
  )
}


