import React, { createContext, useState } from 'react';
import { useEffect } from 'react';

export const ShopContext= createContext(null);

const getDefaultCart = ()=>{
    let cart = {};
    for (let index = 0; index < 300+1; index++) { // Here I managed to write '>' instead of '<'. this is undetectable error.
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {

    const [all_product,setAll_product] = useState([]);
    const [cartItems,setCartItems]= useState(getDefaultCart());
    
    useEffect(() => {
        fetch('http://localhost:4000/allproducts')
        .then((response) => response.json())
        .then((data) => setAll_product(data))

       // 
        if(localStorage.getItem('auth-token')){
              fetch('http://localhost:4000/getcart',{   //http://localhost:4000/getcart
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type' : 'application/json'
                },
                body:"",

              }).then((response) => response.json())  // parsing the response
              .then((data) => setCartItems(data));
        }
    },[])

    const addToCart= (itemId) =>{
            setCartItems((prev) => ({...prev,[itemId]:prev[itemId]+1}));
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/addtocart',{
                method:'POST',
                headers:{
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response) => response.json())
            .then((data) => console.log(data));
        }
            alert("Product added to Cart");
    }

    const removefromCart= (itemId) =>{
        setCartItems((prev) => ({...prev,[itemId]:prev[itemId]-1}));
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/removefromcart',{
                method:'POST',
                headers:{
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response) => response.json())
            .then((data) => console.log(data));
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount=0;
        for(const item in cartItems)
                
            if(cartItems[item]>0)
            {
                console.log(item,cartItems[item]);

                let itemInfo = all_product.find((product) => product.id === Number(item));
                  // The error arised because, before adding this "getcart" api, we've added some products in the cart using the 'addtocart' api. so there has to be some issue with the find() function i.e from the all_product.
                  //The actual issue was because of unwarranted database change. there is something wrong the cartItems array.
                  //The items were saved in cartItems was not save in the all_products that it is giving null error. 
                    if(itemInfo){
                  totalAmount+=itemInfo.new_price*cartItems[item];
                }
                else{
                    alert("Some of the products may be out of Stock")
                }
            }// Ok, the real problem lies with admin side. The product Id should consecutive well its not.
           /* */
           return totalAmount;     
        
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for(const item in cartItems){
            if(cartItems[item]>0)
            {
                totalItem+=cartItems[item];
            }
        }
        return totalItem;
    }

const contextValue ={getTotalCartItems,getTotalCartAmount,all_product,cartItems,addToCart,removefromCart};

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;
//Using Context we'll be able to use this in different components