import React from 'react';
import Moment from 'react-moment';
import { useContext } from 'react';
import { GlobleContext } from '../..';



export default function PostContent(props) {
    const {state, dispatch} = useContext(GlobleContext);

    const { post } = props

    const toggleReadMore = () => {
        dispatch({
            type:'toggleReadMore',
            isReadMore: {...state.isReadMore,
                    [post.id]:!state.isReadMore[post.id]
                }
        })
    }

  return (
    <div className="post__content">
        <div className="content-header">
            <div className="author">
                <div className="author__avatar">
                    <img className="avatarImg" src={post.avatar === null ? './avatar_default.jpg' : post.avatar} alt="avatar" />
                </div>
                <div className="author__identity">
                    <span className="name">{post.name}</span>
                    <span className="position">{post.position}</span>
                </div>
            </div>
            <Moment fromNow className='pulished-time'>{post.create_time}</Moment>
        </div>

        <div className="content-area">
            <div className="text">
                <h2 className='text__title'>{post.title}</h2>

                {state.isReadMore[post.id] ?
                <p className='text__content'>
                    {post.content}
                    <button className='reduce-btn' onClick = {toggleReadMore}> Réduire </button>
                </p>
                :
                <p className='text__content'>
                    { post.content.slice(0, 100) }
                    {post.content.length > 100 && 
                    <button className='showmore-btn' onClick = {toggleReadMore}>...Voir plus</button>
                    }
                </p>               
                }
            </div>          
            {/* check fetch data if img is null, show if it is not null et get url */}
            {post.img_url !== null &&
            <div className="imgWrap">
                <img className="img" src={post.img_url} alt="share" />
            </div>                                    
            }

        </div>
    </div>
  )
}
