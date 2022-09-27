import React, { useContext }  from 'react';
import Post from '../post/Post';
import FeedComments from '../feedComments/FeedComments';
import LoadMoreBtn from '../loadBtn/LoadMoreBtn';
import './feedPost.scss';
import {GlobleContext} from '../..'

export default function FeedPosts() {
    const {state} = useContext(GlobleContext)
  return (
    <section className="post-feeds">
            <ul className="feed-list">
                {/* iterate fetch datas from posts table */}
                {state.posts.map((post)=> {
                    return (
                      <li key= {post.id} className="feed-list__item">
                        <Post post = {{...post}}/> 
                        {state.showComments[post.id] && <FeedComments post = {{...post}}/>}  
                      </li>
                    )
                })}

            </ul>

            <LoadMoreBtn>posts</LoadMoreBtn>
    </section>
  )
}
