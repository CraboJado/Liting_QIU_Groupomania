import React , { useEffect, useState } from 'react'
import axios from 'axios';
import './select.scss';

export default function Select(props) {
    const { name, setUserHandler } = props
    const [list,setList] = useState([]);

    const url = name === 'department' ? 
    'http://localhost:5000/api/dpt/' : 
    'http://localhost:5000/api/job/'

    useEffect(()=> {
      // console.count('useEffect run')
      axios.get(url)
      .then( (res) => {
        setList(res.data);
      })
    },[url]);

    const handleChange = (e)=> {
      // pass data to parent component Form to update user state in Form
      setUserHandler(e);
    }

  return (
    <div className='selectWrap'>
        <label htmlFor = {`${name}-select`} >Choose a {name}:</label>

        <select name= {name} id= {`${name}-select`} onChange= { handleChange }>
            <option value="">--Please choose an option--</option>
            {list.map( ele => <option key= {ele.id} value= {ele.id}> {ele.name || ele.position}</option> )}
        </select>
    </div>
  )
}
