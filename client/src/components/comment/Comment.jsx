import React from 'react';
import Moment from 'react-moment';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHeart} from '@fortawesome/free-solid-svg-icons';
import './comment.scss'
import { useContext } from 'react';
import { GlobleContext } from '../..';


export default function Comment(props) {
    const {state, dispatch} = useContext(GlobleContext)
    const {comment, post } = props;
    const user = JSON.parse(localStorage.getItem('user'));

    const toggleReadMore = () => {
        dispatch({
            type:'toggleReadMore',
            isReadMore: {...state.isReadMore,
                    [comment.id]:!state.isReadMore[comment.id]
                }
        })
    }
    
  return (
    <article className="comment">
        <div className="comment__actor">
            <img className="actor__avatar" src={'./avatar_default.jpg'} alt="avatar" />
        </div>
        <div className="comment__content">
            <div className="content__header">
                <div className="author">
                    <div className="author__name">
                        <span className="comment-author">{comment.name}</span>
                        {user.userId === post.user_id && <span className='post-author'>{"author"}</span>}
                    </div>
                    <div className="author__position">
                        {comment.position}
                    </div>
                </div>
                <Moment fromNow>{comment.create_time}</Moment>
            </div>

            <div className="content__text">
                <div className="text">
                {state.isReadMore[comment.id] ?
                <p className='text__content'>
                    {comment.content}
                    <button className='reduce-btn' onClick = {toggleReadMore}> Réduire </button>
                </p>
                :
                <p className='text__content'>
                    { comment.content.slice(0, 100) }
                    {comment.content.length > 100 && 
                    <button className='showmore-btn' onClick = {toggleReadMore}>...Voir plus</button>
                    }
                </p>               
                }
                </div>
                {comment.img_url !== null &&
                <div className="img-preview ">
                    <img src={comment.img_url} alt="share" />
                </div>                                    
                }
            </div>

            {/* <div className="comment-reactions">
                <div className="likeWrap">
                    <button>like</button>
                    {true &&
                    <div className="likeNbr">
                        <FontAwesomeIcon icon={faHeart}/>
                        <span>2</span>
                    </div>                                                    
                    }
                </div>

                <div className="replyWrap">
                    <button>reply</button>
                    {true &&
                    <div className="replyNbr">
                        <span>4</span> 
                        <span>replies</span>
                    </div>                                                    
                    }
                </div>
            </div> */}
        </div>
    </article>
  )
}
