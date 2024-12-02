import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from "../../config.js";
import './Carrito.css'; 
import {useNavigate} from 'react-router'
import Button from '../../components/Button/Button.jsx'
import trashIcon from '../../vendor/imgs/trashIcon.png'


const Carrito = () => {
    const [carritoStuff, setCarritoStuff] = useState([]);
    const [error, setError] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate()

    useEffect(() => {
        const loadCarrito = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${config.url}user/carrito`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data && Array.isArray(response.data.carritoStuff)) {
                    setCarritoStuff(response.data.carritoStuff);
                    console.log("carritostuff ",response.data.carritoStuff)
                } else {
                    setError("API response format is incorrect");
                    console.error("Incorrect data format:", response.data);
                }
            } catch (error) {
                setError("Error fetching items");
                console.error('Error fetching items', error);
            }
        };
        loadCarrito();
    }, []);

    useEffect(() => {
        let totalPrice = 0;
        carritoStuff.forEach(element => {
            totalPrice += parseFloat(element.quantity * element.price);
        });
        setTotalAmount(totalPrice);
    }, [carritoStuff]);

    const handleCheckout = async (totalAmount) => {
        await handleClearCarrito()
        navigate("/exito")
    };

    const handleClearCarrito = async () => {
        const token = localStorage.getItem("token")
        await axios.delete(`${config.url}user/carrito`,{
            headers: {Authorization:`Bearer ${token}`}
        })
    }

    const handleRemoveItem = async (id)=>{
        try{
        const token = localStorage.getItem("token")
        await axios.delete(`${config.url}user/carrito/${id}`,{
            headers: {Authorization:`Bearer ${token}`}
        })
        setCarritoStuff(carritoStuff.filter((item) => item.cart_id !== id))

        }
        catch(e){
            console.error("error removeando un itenm carrito: ",e)
        }
    }


    return (
        <div className="carrito-container">
            {/* <script src="https://sdk.mercadopago.com/js/v2"></script> */}
            {error && <div className="error-message">{error}</div>}
            {carritoStuff.length === 0 ? (
                <div className="empty-cart" onClick={() => {navigate("/")}}>
                    <h2>¡El carrito está vacío!</h2>
                    <p>Agrega productos para empezar a comprar.</p>
                </div>
            ) : (
                <>
                <div className="cart-items">
                    {carritoStuff.map((item, index) => (
                        <div key={index} className="cart-item">
                            <div className="cart-item-image-container">
                                <img src={item.front_image} alt={`Product ${index}`} className="cart-item-image" />
                            </div>
                            <div className="cart-item-info">
                                <h3 className="cart-item-title">{item.title}</h3>
                                <div className="cart-item-details">
                                    <div className="cart-item-quantity">
                                        <span>Talle:</span> {item.size}
                                    </div>
                                    <div className="cart-item-quantity">
                                        <span>Cantidad:</span> {item.quantity}
                                    </div>
                                    <div className="cart-item-total">
                                        <span>Precio total:</span> ${item.price * item.quantity}
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => handleRemoveItem(item.cart_id)} className="trash-button"><img src={trashIcon} alt="Eliminar del carrito" className="trash-icon" /></Button>
                        </div>
                    ))}
                </div>
            <div className="total-amount">
                <h3>Total del carrito: ${totalAmount.toFixed(2)}</h3>
                <button className="checkout-button" onClick={() => handleCheckout(totalAmount)}>Pagar ahora</button>
            </div>
            </>
            )}
        </div>
    ); 
};

export default Carrito;
