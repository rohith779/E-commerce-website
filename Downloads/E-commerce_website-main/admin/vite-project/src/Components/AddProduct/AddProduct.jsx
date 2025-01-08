import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from "../../assets/upload_area.svg"

const AddProduct = () => {

    const [image,setImage] = useState(false);
    const [productDetails,setProductDetails] =  useState({
        name:"",
        image:"",
        category:"women", //It has to hold some value at all times
        new_price:"",
        old_price:""
    })

    const imageHandler =(e) =>{
        setImage(e.target.files[0]);
    }

    const changeHandler = (e) => {
        setProductDetails({...productDetails,[e.target.name]:e.target.value});
    }

    const Add_Product = async () => {
        console.log(productDetails);
        let responseData;
        let product = productDetails;
        let formData = new FormData();
        formData.append('Product',image); // ' ' ---> "" and "" ---> ' ' did not effect anything // the real issue: product --> Product

        await fetch('http://localhost:4000/upload',{
            method:'POST',
            headers:{
                Accept: '/application/json', //applicatio ---> application error-1[didnt immediately effect, but i think it is the main culprit].
            },
            body:formData,
        }).then((resp) => resp.json()).then((data) => {responseData=data})

        if(responseData.success){
            product.image = responseData.image_url;
            console.log(product);
            await fetch('http://localhost:4000/addproduct',{
                method: 'POST',
                headers:{
                    Accept:'application/json',
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(product),
            }).then((resp)=>resp.json()).then((data)=>{    //we'll recieve two promises, second one indicates the status.
                data.success?console.log("Product Added"):alert("Failed");
            })
        }
    }
    //While trying to get image url through upload endpoint.

  return (
<div className='addProduct'>
        <div className="prod-title">
            <h1>Product Details</h1>
        </div>
        <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
    </div>
    <div className="addproduct-price">
        <div className="addproduct-itemfield">
            <p>Old Price</p>
            <input value={productDetails.old_price} onChange={changeHandler} type="text"name='old_price' placeholder='Type here' />
        </div>
        <div className="addproduct-itemfield">
            <p>New Price</p>
            <input value={productDetails.new_price} onChange={changeHandler} type="text"name='new_price' placeholder='Type here' />
        </div>
    </div>
    <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector' id="">
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kid">Kids</option>
        </select>
    </div>
    <div className="addproduct-itemfield">
        <p>upload the image below</p>
        <label htmlFor="file-input">
            <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumbnail-img' alt="" />
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
    </div>
    <button onClick={()=>{Add_Product()}} className='addproduct-btn'>ADD</button>
</div>
    
  )
}

export default AddProduct