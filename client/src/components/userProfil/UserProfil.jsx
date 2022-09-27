import React from 'react';
import { Link } from "react-router-dom";
import './userProfil.scss'

export default function UserProfil() {

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <section className='main__userProfil'>
        <Link to='/profil' className='avatar'>
            <img className = 'avatar__img' src={user.avatar === null? './avatar_default.jpg' : user.avatar } alt="avatar" />
        </Link>
        <div className="info">
            <span className="info__name">{user.name}</span>
            {/* <span className="position">{'position'}</span> */}
        </div>
    </section>
  )
}
