import React from 'react';
import CommentBox from '../commentBox/CommentBox';
import Comment from '../comment/Comment';
import LoadMoreBtn from '../loadBtn/LoadMoreBtn';
import './feedReplies.scss'

export default function FeedReplies() {
  return (
    <article className='feed-reply'>
        <ul className="feeds-list">
            <li key={"ids in comments table"} className="feeds-list-item">
                {/* after click on reply btn ,show component commentBox */}
                {true && <CommentBox/>}  
                {/* component comments */}
                <Comment/>
            </li>
            <li>reply2</li>
        </ul>
        <LoadMoreBtn>Load more replies</LoadMoreBtn>
    </article>      
  )
}
