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

        //  delete post
        axios({
            method: 'delete',
            url: `${process.env.REACT_APP_API_URL}/posts/${post.id}`,               
            headers: {
                    'Authorization' : `Bearer ${user.token}`,
                    'content-type': 'application/json'
            }
          })
          .then( () => {
            // after delete post, get new post list to render on page
            return  axios({
                method: 'get',  
                url:`${process.env.REACT_APP_API_URL}/posts`,     
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
        document.body.classList.add('fixed');

        // hide elipseDropDown
        dispatch({
            type:'toggleEllipsisDropDown',
            ellipsisDropDown: {...state.ellipsisDropDown,
                              [post.id]:!state.ellipsisDropDown[post.id]  
            }
        })

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
    <section className='post__header'>
        <div className="ellipsis">
            {/* show if login user isAdmin and if post belongs to user */}
            {/* click on button to toggle the bloolean of clicked post id */}
            {(user.isAdmin || post.user_id === user.userId) &&
            <button className='ellipsis__icon' onClick={ toggleEllipsisDropDown } aria-label="ellipsis menu">
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
    </section>
  )
}
