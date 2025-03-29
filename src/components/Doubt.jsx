import React from 'react'
import Messages from './Messages'
import Avatar from "react-avatar"

function Doubt(props) {
  return (
    <div className='doubt'>
      <div className='client'>
        <Avatar name={props.username}size={20} round="50px" />
        <span className='userName'> <b>{props.username} </b></span>
      </div>
      <span className='doubt_text'><b>{props.doubttext}</b></span>
    </div>
  )
}

export default Doubt