import React from 'react';
import './feedShareForm.scss'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { GlobleContext } from '../..';
import FeedShareFormSubmit from './FeedShareFormSubmit';

export default function FeedShareForm (props) {
    const {state,dispatch} = useContext(GlobleContext);

    const getTitle = (e)=> {
        dispatch({
            type:'setPostDatas',
            postDatas : { title:e.currentTarget.value,
                          content:state.postDatas.content,
                          fileUrl:state.postDatas.fileUrl,
                          file:state.postDatas.file
            }
        })
    }

    const getContent = (e) => {
        dispatch({
            type:'setPostDatas',
            postDatas : { title:state.postDatas.title,
                          content:e.currentTarget.textContent,
                          fileUrl:state.postDatas.fileUrl,
                          file:state.postDatas.file,
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
                type:'setPostDatas',
                postDatas : { title:state.postDatas.title,
                              content:state.postDatas.content,
                              fileUrl:url,
                              file:e.target.files[0]
                }
            })

        };

        if(e.target.files[0]){
            reader.readAsDataURL(file);
        }
        // reader.readAsDataURL(file);
    }

    const closeShowFile = () => {
        dispatch({
            type:'setPostDatas',
            postDatas : { title:state.postDatas.title,
                          content:state.postDatas.content,
                          fileUrl:"",
                          file:state.postDatas.file,
            }
        })
    }

  return (
    <form className='publish-form'>
        {/* header  */}
        {props.children}
        
        {/* content */}
        <div className="publish-form__editor">
            <div className="editor">
                <div className="editor__title" >
                    <label htmlFor="title">Title</label>
                    <input name="title" id="title" className = "editor__input" placeholder='title' onChange={getTitle} value = {state.postDatas.title}/>
                </div>
                <div className="editor__text">
                    <span>Content</span>
                    <p className="text" onBlur={getContent} contentEditable ="true" suppressContentEditableWarning={true} role="textbox" spellCheck="true" aria-autocomplete="list" >
                    {state.postDatas.content}
                    </p>               
                </div>
                <div className='editor__file'>
                    <label htmlFor="inputFilePost"className="upload" >
                        Choisir une photo
                        <FontAwesomeIcon icon={faImage}/>
                        <input id="inputFilePost" className="upload__input" type="file" accept="image/*" onChange={getFileUrl} ></input>
                    </label>                    
                
                    {state.postDatas.fileUrl && 
                    <div className="img-preview">
                        <div className="img-preview-wrap">
                            <img src={state.postDatas.fileUrl} alt=""/>
                            <button className='close-btn' onClick={closeShowFile}>X</button>
                        </div>
                    </div>
                    }
                </div>
            </div>

            {/* send method props to determin if submit for creating post or modifying post */}
            <FeedShareFormSubmit method = {props.method} post = {props.post}/>
        </div>
    </form> 


  )
}

