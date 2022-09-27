import React , { useEffect, useState , useContext} from 'react'
// import { GlobleContext } from '../form/Form';
import { GlobleContext } from '../..'
import axios from 'axios';
import './select.scss';

export default function Select(props) {
    const { name , text} = props;

    const [list,setList] = useState([]);
    
    const {dispatch} = useContext(GlobleContext);
   
    const url = name === 'department' ? 
    'http://localhost:5000/api/dpt/' : 
    'http://localhost:5000/api/position/'

    useEffect(()=> {
      axios.get(url)
      .then( res => {
        setList(res.data);
      })
      .catch( err => {
        console.log(err)
      })
    },[url]);

    const handleChange = e => {
      dispatch({
        type:'getSeletedItem',
        value:e.target.value,
        name:e.target.name
      })
    }

  return (
    <div className='form__select-menu '>
      <label htmlFor = {`${name}-select`} >Choisissez un {text}:</label>

      <select name= {name} id= {`${name}-select`} onChange={handleChange}>
          <option value="">--Veuillez choisir une option--</option>
          {list.map( ele => <option key= {ele.id} value= {ele.id}> {ele.name || ele.position}</option> )}
      </select>
  </div>
  )
}
