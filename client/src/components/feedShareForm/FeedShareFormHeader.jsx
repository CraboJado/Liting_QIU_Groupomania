import React from 'react';
import './feedShareForm.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { GlobleContext } from '../..';
import { useContext } from 'react';

export default function FeedShareFormHeader(props) {
    const { state, dispatch } = useContext(GlobleContext);
    const {userDatas} = props;

    const closeFeedShareForm = () => {
        document.body.classList.remove('fixed');
        if(props.method){
        // close FeedShareForm
            dispatch({
                type:'feedShareForm',
                showFeedShareForm : !state.showFeedShareForm
            })
        }else {
            dispatch({
                type:'showFeedModifyForms',
                showFeedModifyForms : {}
            })  
        }

        // re-initialize the state of postDatas for FeedShareForm
        dispatch({
            type:'setPostDatas',
            postDatas : { title:"",
                          content:"",
                          fileUrl:"",
                          file:null
            }
        })
    }

  return (
    <div className="publish-form__header">
        <div className="title-wrap">
            {props.children}
            <FontAwesomeIcon icon= {faX} onClick = {closeFeedShareForm} />
        </div>
        <div className="author">
            <div className="author__avatar">
                <img className="author__img" src={userDatas.avatar === null ? './avatar_default.jpg' : userDatas.avatar} alt="avatar" />
            </div>
            <div className="author__name">{userDatas.name}</div>
        </div>
    </div>
  )
}
