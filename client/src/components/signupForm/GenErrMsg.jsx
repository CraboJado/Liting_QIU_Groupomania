import React from 'react';

export default function GenErrMsg(props) {
    const { type } = props;
    let msg;

    if(type === 'email') {
      msg = 'le format du email est incorrect'
    }

    if(type === 'name'){
      msg = 'le format du nom est incorrect'
    }
    
  return (
    <div className='error-msg'> 
      {msg} 
    </div>
  )
}
