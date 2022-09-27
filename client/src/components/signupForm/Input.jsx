import React from 'react';
import { useContext } from 'react';
import { GlobleContext } from '../..';

export default function Input(props) {
  const { dispatch } = useContext(GlobleContext);

  const { name , text } = props;

  const handleInput = e => {
    dispatch({
      type:'checkInput',
      validity:!e.target.validity.patternMismatch,
      name:e.target.name,
    })

    dispatch({
      type:'setUser',
      name:e.target.name,
      value: e.target.value
    })    
  }

  const handleChange = e => {

    if(e.target.type === 'email'){
      handleInput(e);
    }

    if(e.target.type === 'password'){
      const lowerCaseLetters = /[a-z]/g;
      const upperCaseLetters = /[A-Z]/g;
      const numbers = /[0-9]/g;
  
      const isLowCase = lowerCaseLetters.test(e.target.value) ? true : false;
      const isUpCase = upperCaseLetters.test(e.target.value) ? true : false;
      const isNbr = numbers.test(e.target.value) ? true : false;
      const isMinLength = e.target.value.length >= 8 ? true : false;

      dispatch({
        type:'checkInput',
        validity:!e.target.validity.patternMismatch,
        name:e.target.name,
      })

      dispatch({
        type:'checkPassword',
        value: {isLowCase,
                isUpCase,
                isNbr,
                isMinLength 
        }
      })

      dispatch({
        type:'setUser',
        name:e.target.name,
        value: e.target.value
      })

    }

    if(e.target.type === 'text'){
      handleInput(e);
    }
    
    dispatch({
      type:'disableBtn',
      value:false
    })
  }

  return (
      <div className='user-input'>
          <label htmlFor= {name}> {text} </label>
          <input {...props} id= {name} required onChange={handleChange} />
      </div>
  )
}

