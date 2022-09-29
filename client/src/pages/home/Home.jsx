import React ,{useReducer, useEffect} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPowerOff, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Link , useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer'
import UserProfil from '../../components/userProfil/UserProfil';
import PostBox from '../../components/postBox/PostBox';
import FeedPosts from '../../components/feedPosts/FeedPosts';
import FeedShareForm from '../../components/feedShareForm/FeedShareForm';
import FeedShareFormHeader from '../../components/feedShareForm/FeedShareFormHeader';

import './home.scss'
import { GlobleContext } from '../..';
import axios from 'axios';

// replace postDatas by FeedDatas ? 
const initialState = {
    posts:[],
    postDatas:{
        title:"",
        content:"",
        fileUrl:"",
        file:null
    },
    comments:{},
    showComments:{},
    commentDatas:{},
    totalComments:{},
    isReadMore : {},
    ellipsisDropDown :{},
    showFeedModifyForms:{},
    showHeaderDropDown:false,
    showFeedShareForm:false,
    count:10,
    like:{}
}

const reducer = (prevState, action) => {

    switch(action.type){
        case 'displayHeaderDropDown':
            return {...prevState,
                showHeaderDropDown:action.showHeaderDropDown,
            }

        case 'setPosts':
            return {...prevState,
                    posts:action.value 
            }

        case 'setPostDatas' :
            return {
                ...prevState,
                postDatas:{ ...action.postDatas }              
            }
        
        case 'setCommentDatas' :
            return {
                ...prevState,
                commentDatas:{ ...prevState.commentDatas,
                                ...action.commentDatas
                            }              
            }
          
        case 'toggleEllipsisDropDown' :
            return {...prevState,
                ellipsisDropDown:action.ellipsisDropDown
            }

        case 'toggleReadMore' : 
            return {
                ...prevState,
                isReadMore:action.isReadMore,
            }
        
        case 'toggleShowComments' : 
            return {
                ...prevState,
                showComments:{
                    ...prevState.showComments,
                    ...action.showComments
                }
            }

        case 'setComments' :
            return {
                ...prevState,
                comments:{...prevState.comments,
                         ...action.comments
                }                
            }
        
        case 'count' :
            return {...prevState,
                count: action.value
            }
        
        case 'feedShareForm':
            return {
                ...prevState,
                showFeedShareForm:action.showFeedShareForm
            }
        

        case 'showFeedModifyForms' :
            return {
                ...prevState,
                showFeedModifyForms:action.showFeedModifyForms
            }
        
        case 'setLike':
            return {
                ...prevState,
                like:{...prevState.like,
                      ...action.like
                }
            }
        
        case 'setTotalComments':
            return{
                ...prevState,
                totalComments:{...prevState.totalComments,
                               ...action.total
                }                
            }
        
        default:
        return prevState
    }
}


export default function Home() {

    const [state, dispatch] = useReducer(reducer, initialState);
   
    const user = JSON.parse(localStorage.getItem('user'));

    const navigate = useNavigate()

    useEffect(()=>{
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_API_URL}/posts`,           
            headers: {
                    'Authorization' : `Bearer ${user.token}`,
                    'content-type': 'application/json'
            },
            params: {
                count: state.count
            }
          })
          .then( res => {
                dispatch({
                    type:'setPosts',
                    value:res.data
                })
          })
          .catch( err => {
                if(err.response.data.errorMsg === 'jwt expired') {
                    localStorage.clear();
                    navigate("/",{replace:true})                   
                }else{
                    // alert 'sth is wrong'
                    console.log('err in axois',err)
                }
          })
    },[user.token,state.count,navigate])



    const displayHeaderDropDown = () => {
        dispatch({
            type:'displayHeaderDropDown',
            showHeaderDropDown: !state.showHeaderDropDown
        })
    }

    const logout = () => {
        localStorage.clear();
        navigate("/",{replace:true})
    }

  return (
    <GlobleContext.Provider value = {{
        state,
        dispatch
    }}>
        <div className='home'>
            <Header>
                <div className='header__avatarWrap'>
                    <img className = 'header__avatar' src={ user.avatar === null? './avatar_default.jpg' : user.avatar } alt="avatar" />
                    {state.showHeaderDropDown ? <FontAwesomeIcon icon={faChevronUp} onClick = {displayHeaderDropDown} /> : <FontAwesomeIcon icon={faChevronDown} onClick = {displayHeaderDropDown}/> }
                </div>
                {state.showHeaderDropDown && 
                    <ul className='nav'>
                        <li className='nav__item'>
                            <Link to = '/profil' className="userProfil">
                                <span className="userProfil__name">{user.name}</span>
                                <span className="userProfil__position">{user.position}</span>
                                <span>voir le profil</span>
                            </Link>
                        </li>
                        {/* show only if user is Admin */}
                        {user.isAdmin ?
                            <li className='nav__item--admin'>
                                <Link to ='/admin'className = 'nav__link'>Gestion</Link>
                            </li>
                            :
                            null
                        }

                        <li className='nav__item--logout' onClick={logout}>
                            <FontAwesomeIcon icon={faPowerOff} />
                            <span>se deconneter</span>
                        </li>
                    </ul>
                }
            </Header>
            <main className ='main' aria-label="Main Feed">
                <UserProfil/> 
                <PostBox/> 
                <FeedPosts/>
            </main>
            <Footer/>

            {state.showFeedShareForm &&
            <div className="overlay">
                <FeedShareForm userDatas = {{...user}} method = 'post'>
                    <FeedShareFormHeader userDatas = {{...user}} method = 'post' >
                        <h1>créer une pubilication</h1>
                    </FeedShareFormHeader> 
                </FeedShareForm>
            </div>            
            }           

        </div>

    </GlobleContext.Provider>

  )
}
