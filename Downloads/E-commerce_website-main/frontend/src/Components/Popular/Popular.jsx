import React from 'react'
import Item from '../Items/Item'
import '../Popular/Popular.css'
import { useState } from 'react'
import { useEffect } from 'react'

const Popular = () => {

  const [popularProducts,setpopularProducts] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:4000/popularwoman')
    .then((response) => response.json())
    .then((data) => setpopularProducts(data));
  },[])  //that [] is more imp. It makes the hook only run once. without u'll fall into fetch error.
  

  return (
    <div className='popular'>
        <h1>POPULAR IN WOMAN</h1>
        <hr />
        <div className="popular-item">
            {popularProducts.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            })}
        </div>
    </div>
  )
}

export default Popular