import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import './postBox.scss'
import { useContext } from 'react';
import { GlobleContext } from '../..';


export default function PostBox() {
    const {state, dispatch} = useContext(GlobleContext)
    const user = JSON.parse(localStorage.getItem('user'));
    
    const handleClick = () => {
        document.body.classList.add('fixed');
        dispatch({
            type:'feedShareForm',
            showFeedShareForm: !state.showFeedShareForm

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

        // show form to edit post
        dispatch({
            type:'feedShareForm',
            showFeedShareForm:true
        })
    }

  return (
    <section className='main__postBox'>
        <div className='content'>
            <div className='content__avatar'>
                <img className='avatarImg' src={user.avatar === null? './avatar_default.jpg' : user.avatar} alt="avatar" />
            </div>
            <p className='content__editor' onClick = {handleClick}>écrivez quelquechose...</p>
        </div>
        <div className='toolbar'>
            <label htmlFor="file" className='toolbar__photo'>
                Photo
                <FontAwesomeIcon icon={faImage} />
                <input id = "file" className = 'uploadInput' type="file" onChange = {getFileUrl}/>
            </label>
        </div>
    </section>
  )
}
