import React from 'react'
import { useContext } from 'react'
import { GlobleContext } from '../..'

export default function ErrMsg(props) {
    const { state } = useContext(GlobleContext);
    
    let msg = "";

    if(state.status === 401 ) {
        msg = 'le mot de pass incorrect'
    }

    if(state.status === 404 ) {
        msg = 'le compte n\'exists pas'
    }

  return (
    <div className='error-msg'> 
      {msg} 
    </div>
  )
}
