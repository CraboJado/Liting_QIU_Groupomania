import React from 'react';
import './input.scss';

export default function Input(props) {
  const { name } = props;
  return (
    <div className='userInputWrap'>
        <div className='userInput'>
            <label htmlFor= {name}> {name} </label>
            <input {...props} id= {name} required  />
        </div>
    </div>
  )
}

