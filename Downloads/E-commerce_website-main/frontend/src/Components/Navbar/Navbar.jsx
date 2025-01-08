import React, { useContext, useState } from 'react' 
import './Navbar.css'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'

const Navbar = () => {

  const [menu,setMenu] = useState("/");
  const {getTotalCartItems} = useContext(ShopContext);

  return (
    <div className='navbar'>
      <div className='nav-logo'>
        <img src={logo} alt="" />
        <p >SHOPPER</p>

      </div>
      <ul className="nav-menu">
        <li onClick= {() => {setMenu("shop")}}><Link style={{textDecoration:'none'}} to='/'>Shop</Link> {menu==="shop"?<hr/>:<></>}</li>
        <li onClick= {() => {setMenu("men")}}><Link style={{textDecoration:'none'}} to='/men'>Men </Link>{menu==="men"?<hr/>:<></>}</li>
        <li onClick= {() => {setMenu("women")}}><Link style={{textDecoration:'none'}} to='/women'>Women</Link> {menu==="women"?<hr/>:<></>}</li>
        <li onClick= {() => {setMenu("kid")}}><Link style={{textDecoration:'none'}} to='/kid'>Kids</Link> {menu==="kid"?<hr/>:<></>}</li>
      </ul>
      <div className='nav-login-cart'>
        {localStorage.getItem("auth-token")
        ?<button onClick={() => {localStorage.removeItem('auth-token'); window.location.replace('/')}}>Logout</button> 
        :<Link to='/login'><button>Login</button></Link>
      }
        
        <Link to='/cart'><img src={cart_icon} alt="Cart"/></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
        
      </div>
    </div>
  )
}

export default Navbar