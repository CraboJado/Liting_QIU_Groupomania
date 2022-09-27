import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import {GlobleContext} from '../..'
import { useContext } from 'react';
import axios from 'axios';

export default function PostHeader(props) {
    const {state, dispatch} = useContext(GlobleContext);
    
    const user = JSON.parse(localStorage.getItem('user'));

    const { post } = props;

    const toggleEllipsisDropDown = () => {
        // toggle elipseDropDown menu
        dispatch({
            type:'toggleEllipsisDropDown',
            ellipsisDropDown: {...state.ellipsisDropDown,
                            [post.id]:!state.ellipsisDropDown[post.id]  
                              }
        })
    }

    const deletePost = () => {
        // hide elipseDropDown menu
        dispatch({
            type:'toggleEllipsisDropDown',
            ellipsisDropDown: {...state.ellipsisDropDown,
                            [post.id]:!state.ellipsisDropDown[post.id]  
                              }
        })
        // or this way ?
        // dispatch({
        //     type:'toggleEllipsisDropDown',
        //     ellipsisDropDown: {}
        // })

        //  delete post
        axios({
            method: 'delete',
            url: `http://localhost:5000/api/posts/${post.id}`,         
            headers: {
                    'Authorization' : `Bearer ${user.token}`,
                    'content-type': 'application/json'
            }
          })
          .then( () => {
            // after delete post, get new post list to render on page
            return  axios({
                method: 'get',
                url: 'http://localhost:5000/api/posts',         
                headers: {
                        'Authorization' : `Bearer ${user.token}`,
                        'content-type': 'application/json'
                },
                params: {
                    count: state.count
                }
            })
          })
          .then( res => {
            dispatch({
                type:'setPosts',
                value:res.data
            })
          })
          .catch( err => {
                // à faire alert 'sth is wrong'
                console.log('err in axois',err)
          })        
    }

    const modifyPost = () => {
        // hide elipseDropDown
        dispatch({
            type:'toggleEllipsisDropDown',
            ellipsisDropDown: {...state.ellipsisDropDown,
                              [post.id]:!state.ellipsisDropDown[post.id]  
            }
        })
        // or this way ?
        // dispatch({
        //     type:'toggleEllipsisDropDown',
        //     ellipsisDropDown: {}
        // })

        // show modify form for target post id
        dispatch({
            type:'showFeedModifyForms',
            showFeedModifyForms:{ ...state.showFeedModifyForms,
                                 [post.id] : !state.showFeedModifyForms[post.id]
            }
        })

        // change the state of postDatas to render post details before modification
        dispatch({
            type:'setPostDatas',
            postDatas : { title:post.title,
                          content:post.content,
                          fileUrl:post.img_url,
                          file:null
            }
        })

    }

  return (
    <div className='post__header'>
        {/* à faire show only if there is like to this post */}
        {false && 
        <div className='user'>
            <ul className="user__avatarList">
                {/* iterate datas to generate the users who like the post */}
                <li key ={"userid"} className='user__avatarList__item'>
                    <img className='avatarImg' src={'./avatar_default.jpg'} alt="" />
                </li>
                <li>
                    <img className='avatarImg' src={'./avatar_default.jpg'} alt="" />
                </li>
            </ul>
            <ul className="user__nameList">
                {/* iterate datas to generate the users who like the post */}
                <li key ={"userid1"} className='user__nameList__item'>{'name1'}</li>
                <li key ={"userid2"} >{'name2'}</li>
            </ul>
            <span>like this</span>
        </div>
        }
        
        <div className="ellipsis">
            {/* show if login user isAdmin and if post belongs to user */}
            {/* click on button to toggle the bloolean of clicked post id */}
            {(user.isAdmin || post.user_id === user.userId) &&
            <button className='ellipsis__icon' onClick={ toggleEllipsisDropDown }>
                <FontAwesomeIcon icon={faEllipsis} />
            </button>                                
            }


            {state.ellipsisDropDown[post.id] && 
            <div className='ellipsis__dropdown'>
                <button onClick = {deletePost}>supprimer</button>
                <button onClick = {modifyPost} >modifier</button>
            </div>                               
            }
        </div>
    </div>
  )
}
