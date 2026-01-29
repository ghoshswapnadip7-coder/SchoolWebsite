import React from 'react'
import style from '../Navigation/navstyle.module.css'
function NavBar() {
  return (
    <div className={style.navbar}>
    <div className="logo">

    </div>
    <div className="menu">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
    </div>
  )
}

export default NavBar