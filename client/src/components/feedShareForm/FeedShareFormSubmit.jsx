import React from 'react'
import { useContext } from 'react';
import { GlobleContext } from '../..';
import axios from 'axios';

export default function FeedShareFormSubmit( props ) {
    const {state, dispatch} = useContext(GlobleContext);

    const user = JSON.parse(localStorage.getItem('user'));

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!state.postDatas.title && !state.postDatas.content) {
            alert('veillez remplir')
           return
        }

        let contentType , data;
        const postObj = {
            title:state.postDatas.title,
            content: state.postDatas.content,
            fileUrl:state.postDatas.fileUrl
        }

        if(state.postDatas.file === null ){
            contentType = 'application/json';
            data = {...postObj};

        }else{
            const formData = new FormData();
            formData.append('image',state.postDatas.file);
            formData.append('post', JSON.stringify(postObj));
            contentType = 'multipart/form-data';
            data = formData;
        }

        let method, url;

        if(props.method === 'post') {
            method = 'post';
            url = 'http://localhost:5000/api/posts';
        }else {
            method = 'PUT';
            url = `http://localhost:5000/api/posts/${props.post.id}`;      
        }

        // send data to API 
        axios({
            method: method,
            url: url,     
            headers: {
                    'Authorization' : `Bearer ${user.token}`,
                    'content-type': contentType
            },
            data: data
          })
          .then( res => {
            // close popup form
            if(props.method === 'post') {
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
            
            // re-actualiser post list
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
          .then (res => {
            // change posts state to re-render page
            dispatch({
                type:'setPosts',
                value:res.data
            })

            // re-initialize the state of post for FeedShareForm
            dispatch({
                type:'setPostDatas',
                postDatas : { title:"",
                              content:"",
                              fileUrl:"",
                              file:null
                }
            })
          })
          .catch( err => {
            //  show wrong message : modification échoué
            // hide popup form
            console.log(err)
          })
    }

  return (
    <button className='submit-btn' onClick = {handleSubmit}>submit</button>
  )
}
