import React from 'react';
import Comment from '../comment/Comment';
import LoadMoreBtn from '../loadBtn/LoadMoreBtn';
import { useContext } from 'react';
import { GlobleContext } from '../..';
import './feedComments.scss'

export default function FeedComments(props) {
  const { state } = useContext(GlobleContext);

  const { post } = props;

  let comments = state.comments[post.id];

  if(!state.comments[post.id]){
    comments = [];
  }

  return (
    <article className="comment-feeds">
        <ul className="feed-list">
          {comments.map((comment)=>{
              return (
                <li key={comment.id} className="feed-list__item">
                  {state.showComments[post.id] && <Comment comment={{...comment}} post = {{...post}}/>}
                </li>
              )
            })
          }

        </ul>
        
        {state.totalComments[post.id] > 2 && 
          <LoadMoreBtn post = {{...post}}>comments</LoadMoreBtn>        
        }
        
    </article>   
  )
}
