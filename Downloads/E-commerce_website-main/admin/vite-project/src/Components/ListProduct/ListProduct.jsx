import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross from '../../assets/cross_icon.png'

const ListProduct = () => {

    const [allproducts,setAllproducts] = useState([]);

    const fetchInfo = async () => {
      await fetch('http://localhost:4000/allproducts')
      .then((res) => res.json())
      .then((data) => {setAllproducts(data)});
    }

    useEffect(() => {
      fetchInfo();
    },[])
    
    const removeProduct = async(id) => {
      await fetch('http://localhost:4000/removeproduct',{
        method:'POST',
        headers:{
          Accept: '/application/json',
          'Content-Type':'application/json',
                },
                body:JSON.stringify({id:id}),
      }).then((res)=>res.json()).then((data) => {
        data.success?console.log("Product Removed"):console.log("error");
      })
      await fetchInfo();
    }

  return (
    <div className='listproduct'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproducts-allproducts">
        <hr />
        {allproducts.map((product,index) => {
          return <div key={index} className="listproduct-format-main listproduct-format">
              <img src={product.image} alt="" className='listproduct-icon'/>
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>product.category</p>

          <img onClick={() => {removeProduct(product.id)}} src={cross} alt="" className="listproduct-remove-icon" />
          </div>
        })}
      </div>
    </div>
  )
}

export default ListProduct