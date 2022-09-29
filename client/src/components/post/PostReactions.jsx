import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useContext } from 'react';
import { GlobleContext } from '../..';


export default function PostReactions(props) {
    const {state,dispatch} = useContext(GlobleContext)
    const {token, userId}  = JSON.parse(localStorage.getItem('user'));
    const { post } = props

    let isPostLikedByUser

    if(!state.like[post.id]){
        isPostLikedByUser = false
    }else {
        isPostLikedByUser = state.like[post.id].some( user => user === userId  )
    }

    // show comments
    const handleClick = (e) => {
        // set showComments state to show FeedComments Component
        //  les 2 syntax fonctionnent
        // dispatch({
        //     type:'toggleShowComments',
        //     showComments:{ ...state.showComments,
        //                  [post.id] : !state.showComments[post.id]
        //     }
        // })
        dispatch({
            type:'toggleShowComments',
            showComments:{ [post.id] : !state.showComments[post.id] }
        })

        // get commment list of post.id for render page
        axios({
            method:'get',
            url:`${process.env.REACT_APP_API_URL}/comments`,
            headers: {
                'Authorization' : `Bearer ${token}`,
                'content-type': 'application/json'
            },
            params:{targetId : post.id, 
                    count:2
            }
        })
        .then( res => {
            dispatch({
                type:'setComments',
                comments: { [post.id]:res.data }
            })
        })
        .catch( err => {
            console.log(err)
        })
    }

    const likePost = () => {
       axios({
            method:'post',
            url:`${process.env.REACT_APP_API_URL}/posts/${post.id}/like`,
            headers: {
                'Authorization' : `Bearer ${token}`,
                'content-type': 'application/json'
            },
            data:{like:1}
        })
        .then( () => {
            // actualise state.like[post.id]
            // push userId to state.like[post.id] then set like state to render page
            state.like[post.id].push(userId)
            dispatch({
                type:'setLike',
                like:{[post.id]:state.like[post.id]}
            })
        })
        .catch()
    }

    const cancleLike = () => {
        axios({
            method:'post',
            url:`${process.env.REACT_APP_API_URL}/posts/${post.id}/like`,
            headers: {
                'Authorization' : `Bearer ${token}`,
                'content-type': 'application/json'
            },
            data:{like:0}
        })
        .then( () => {
            // actualise state.like[post.id]
            // get out the userId from state.like[post.id] then set like state to render page
            const updatedUsers = state.like[post.id].filter( (user) => user !== userId )
            dispatch({
                type:'setLike',
                like:{[post.id]:updatedUsers}
            })
        })

    }
  return (
    <section className='post__reactions'>
        <div className='total'>
            <div className='total__like'>
                <span>{state.like[post.id] ? state.like[post.id].length : 0}</span>
                <span>likes</span>
            </div>
            <div className='total__comment'>
                <span>{state.totalComments[post.id]}</span>
                <span onClick={handleClick}>comments</span>
            </div>
        </div>
        <div className='reaction-btn'>
            {isPostLikedByUser ? 
            <button className='reaction-btn__like--highlight' onClick = {cancleLike}>
                <FontAwesomeIcon icon={faHeart}/>
                <span>Liked</span>
            </button>  
            :
            <button className='reaction-btn__like' onClick = {likePost}>
                <FontAwesomeIcon icon={faHeart}/>
                <span>Like</span>
            </button>
            }
            <button className='reaction-btn__comment' onClick={handleClick}>
                <FontAwesomeIcon icon={faComment} />
                <span>commenter</span>
            </button>
        </div>
    </section>  
  )
}
