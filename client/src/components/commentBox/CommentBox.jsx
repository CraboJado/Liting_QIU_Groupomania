import React, { useContext }  from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import './commentBox.scss'
import { GlobleContext } from '../..';
import axios from 'axios';

export default function CommentBox(props) {
    const { state, dispatch } = useContext(GlobleContext);
    const user = JSON.parse(localStorage.getItem('user'));
    const { post } = props;

    const getText = (e) => {
        dispatch({
            type:'setCommentDatas',
            commentDatas:{ 
                [post.id]: { content: e.target.textContent,
                             fileUrl:state.commentDatas[post.id] ? state.commentDatas[post.id].fileUrl : "",
                             file:state.commentDatas[post.id] ? state.commentDatas[post.id].file : null
                 }
            }
        })
    }

    const getFileUrl = (e) => {
        const file = e.target.files[0];
        // read file to preview image
        const reader = new FileReader();
        reader.onload = () => {
            const url = reader.result;
            dispatch({
                type:'setCommentDatas',
                commentDatas:{ 
                            [post.id]: { content: state.commentDatas[post.id] ? state.commentDatas[post.id].content : "",
                                         fileUrl:url,
                                         file:file,
                            }
                }
            })
        };

        if(e.target.files[0]){
            reader.readAsDataURL(file);
        }
    }

    const closeShowFile = () => {
        dispatch({
            type:'setCommentDatas',
            commentDatas:{ [post.id]: {content:state.commentDatas[post.id].content,
                                       fileUrl:"",
                                       file:null,
                           }
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!state.commentDatas[post.id].content) {
            alert('veillez saisir des commentaires')
            return
        }

        let data = {
            content: state.commentDatas[post.id].content,
            targetId:post.id,
        }

        let contentType = 'application/json';

        if(state.commentDatas[post.id].file) {
            const formData = new FormData();
            formData.append('image',state.commentDatas[post.id].file);
            formData.append('comment', JSON.stringify(data));
            contentType = 'multipart/form-data';
            data = formData;            
        }

        axios({
            method: 'post',
            url: `${process.env.REACT_APP_API_URL}/comments`,         
            headers: {
                    'Authorization' : `Bearer ${user.token}`,
                    'content-type': contentType
            },
            data: data
          })
          .then(()=>{
            // get new comments list
            return axios({
                        method:'get',
                        url: `${process.env.REACT_APP_API_URL}/comments`,     
                        headers: {
                            'Authorization' : `Bearer ${user.token}`,
                            'content-type': 'application/json'
                        },
                        params:{targetId:post.id, 
                                count:2
                        }
                    })
          })
          .then( res => {
            // change state to rend new comment list of post.id
            dispatch({
                type:'setComments',
                comments: { [post.id]:res.data }
            })

            // change state totalComments to render total quantiy of comment of post.id
            dispatch({
                type:'setTotalComments',
                total: {[post.id]:state.totalComments[post.id] + 1 }
            })

            // initialize commentDatas for post.id
            dispatch({
                type:'setCommentDatas',
                commentDatas:{ [post.id]: { content:"",
                                            fileUrl:"",
                                            file:null,
                                }
                }
            })
          })
          .catch( err => {
            console.log(err)
          })
    }

  return (
    <section className="comment-box ">
        <div className="comment-box__avatar">
            <img className="avatarImg"src={'./avatar_default.jpg'} alt="" />
        </div>
        <form className="comment-box__form" action="">
            <div className="editor">
                <div className="editor__text">
                    <p id='text' className="text"onBlur = {getText} contentEditable={true} suppressContentEditableWarning={true}>{ state.commentDatas[post.id] && state.commentDatas[post.id].content }</p>
                </div>
                <div className='editor__file'>
                    <label htmlFor= {post.id} className="upload">
                        <span>ajouter un photo</span>
                        <FontAwesomeIcon icon={faImage} /> 
                        <input id= {post.id} className="upload__input" type="file" accept="image/*" onChange={getFileUrl}></input>
                    </label>
                </div>
            </div>
            
            {(state.commentDatas[post.id] && state.commentDatas[post.id].fileUrl) && 
            <div className="img-preview">
                <div className="img-preview-wrap">
                    <img className="img" src={state.commentDatas[post.id].fileUrl} alt=""/>
                    <button className="close-btn" onClick = {closeShowFile}>X</button>
                </div>
            </div>
            }
            
            <div className='submit'>
                <button className='submit-btn' onClick = {handleSubmit}>Publier</button>
            </div>  
        </form>
    </section>
  )
}
