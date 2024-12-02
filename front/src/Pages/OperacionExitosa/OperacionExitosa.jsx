import React from "react";
import './OperacionExitosa.css'; // Importamos el archivo CSS
import {useNavigate} from "react-router"
import {useEffect} from 'react'


const OperacionExitosa = () => {
    const nav = useNavigate()

    const OperacionExitosa = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                nav('/')
            }, 5000);
    
            return () => clearTimeout(timer);
        }, []);
    }

    return (
        <div className="operacion-exitosa">
            <div className="mensaje">
                <h1>¡Operación Exitosa!</h1>
                <p>Tu pago ha sido procesado correctamente.</p>
                <button onClick={() => nav("/")}>Volver al inicio</button>
            </div>
        </div>
    );
}

export default OperacionExitosa;
