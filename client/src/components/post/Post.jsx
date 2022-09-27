import React , { useEffect } from 'react';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostReactions from './PostReactions';
import CommentBox from '../commentBox/CommentBox';
import FeedShareForm from '../feedShareForm/FeedShareForm';
import FeedShareFormHeader from '../feedShareForm/FeedShareFormHeader';
import './post.scss'
import { useContext } from 'react';
import { GlobleContext } from '../..';
import axios from 'axios';


export default function Post(props) {
  const {state, dispatch} = useContext(GlobleContext);
  const user = JSON.parse(localStorage.getItem('user'));
  const { post } = props

  // get user list who liked post.id
  useEffect(()=>{
    console.count('useEffect LIKE')
    axios({
        method:'get',
        url:`http://localhost:5000/api/posts/${post.id}/like`,
        // url:`http://localhost:5000/api/posts/like`,
        headers: {
            'Authorization' : `Bearer ${user.token}`,
            'content-type': 'application/json'
        },
    })
    .then( res => {
        const userIds = res.data.map( ele => {
            return ele.user_id
        })

        dispatch({
            type:'setLike',
            like:{ [post.id]:userIds }
        })
    })
  },[dispatch,post.id,user.token]);

  // get total number of comments of post.id
  useEffect(() => {
      axios({
        method:'get',
        url:'http://localhost:5000/api/comments',
        headers: {
            'Authorization' : `Bearer ${user.token}`,
            'content-type': 'application/json'
        },
        params:{ targetId : post.id }
    })
    .then( res => {
      dispatch({
        type:'setTotalComments',
        total:{ [post.id]: res.data[0].total }
      })
    })
  },[dispatch,post.id,user.token])



  return (
    <article className="post">
        <PostHeader post = {{...post}}/>
        <PostContent post = {{...post}}/>
        <PostReactions post = {{...post}}/>

        { state.showComments[post.id] &&  
        <CommentBox post = {{...post}} /> 
        }

        { state.showFeedModifyForms[post.id] &&
        <div className="overlay">
          <FeedShareForm post = {{...post}}>
              <FeedShareFormHeader userDatas = {{...post}}>
                <h1>modifier votre pubilication</h1>
              </FeedShareFormHeader>    
          </FeedShareForm>
        </div>   
        }

    </article>)
}
