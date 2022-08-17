import React from 'react'

export default function GenErrMsg(props) {
    const {msgErr} = props
  return (
    <div className='msgError'> 
      {msgErr} 
    </div>
  )
}
