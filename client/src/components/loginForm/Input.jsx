import React from 'react'
import { useContext } from 'react';
import { GlobleContext } from '../..';

export default function Input(props) {
    const { dispatch } = useContext(GlobleContext)
    const { name , text } = props;


    const handleChange = e => {
        dispatch({
            type:'setUser',
            value:e.target.value,
            name:e.target.name
        }) 
        
        dispatch({
          type:'setStatus',
          status: ""
      })
    }


  return (
    <div className='user-input'>
        <label htmlFor= {name}> {text} </label>
        <input {...props} id = {name} required onChange={handleChange} />
    </div>
  )
}
