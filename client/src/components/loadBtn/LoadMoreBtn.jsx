import React from 'react';
import { useContext } from 'react';
import { GlobleContext } from '../..';
import './loadMoreBtn.scss';
import axios from 'axios';


export default function LoadMoreBtn(props) {
  const {state, dispatch} = useContext(GlobleContext);
  
  const user = JSON.parse(localStorage.getItem('user'));

  const { post } = props

  const handleClick = () => {

    if(props.children === 'posts') {
      dispatch({
        type:'count',
        value : state.count + 10
      })
    }
    
    if(props.children === 'comments') {
      // get the length of current rendered comments, then add + 5
      const count = state.comments[post.id].length + 5

      // fetch comments of the target post id
      axios({
        method:'get',
        url:'http://localhost:5000/api/comments',
        headers: {
              'Authorization' : `Bearer ${user.token}`,
              'content-type': 'application/json'
        },
        params:{targetId:post.id, 
                count
        }
      })
      .then( res => {
          dispatch({
            type:'setComments',
            comments: {...state.comments,
                      [post.id]:res.data
            }
          })
      })
      .catch( err => {
          console.log(err)
      })
    }
  }
  return (
    <div className='load-more' onClick = {handleClick}>
        <button className='load-more__btn' >Load more {props.children}</button>
    </div>
  )
}
