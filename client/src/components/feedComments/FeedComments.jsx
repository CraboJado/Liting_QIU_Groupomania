import React from 'react';
// import CommentBox from '../commentBox/CommentBox';
import Comment from '../comment/Comment';
import FeedReplies from '../feedReplies/FeedReplies';
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
          {/* iterate state.comments[post.id] from comments table to generate li*/}
          {comments.map((comment)=>{
              return (
                <li key={comment.id} className="feed-list__item">
                  {state.showComments[post.id] && <Comment comment={{...comment}} post = {{...post}}/>}

                  {/* show when click on replies */}
                  {false && <FeedReplies/>}    
                </li>
              )
            })
          }

        </ul>
        
        <LoadMoreBtn post = {{...post}}>comments</LoadMoreBtn>
    </article>   
  )
}
