import React from 'react'
import { useContext } from 'react'
// import { GlobleContext } from '../form/Form';
import { GlobleContext } from '../..'

export default function GenErrMsg(props) {
    const {state} = useContext(GlobleContext )
    const {type} = props 
    
  return (
    <div className='msgError'> 
      {state.msgErr[type]} 
    </div>
  )
}
