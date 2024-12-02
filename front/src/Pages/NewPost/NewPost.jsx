import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import './NewPost.css'
import Button from '../../components/Button/Button';

const NewPost = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(''); 
    const { designId } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const [allowComments, setAllowComments] = useState(false);
    const [remixable, setRemixable] = useState(false);
    const [visibility, setVisibility] = useState('public');

    

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            

            const response = await axios.post(
                `${config.url}post/`,
                {
                    title: title,
                    description: description,
                    designId: designId,
                    allow_comments: allowComments,
                    remixable: remixable,
                    visibility: visibility
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201) {
                //console.log("Post created successfully!");
                
                window.location.href = '/'; // southside
            } else {
                setErrorMessage("Failed to create post");
            }
        } catch (e) {
            console.error("Error creating post", e);
            setErrorMessage("Error creating post");
        }
    };

    return (
        <div className="new-post-container">
            <h2>Subir un diseño</h2>
            <form className="new-post-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Titulo:</label>
                    <input
                        className="new-post-input"
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="content">Descripcion:</label>
                    <textarea
                        className="new-post-textarea"
                        id="content"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="allow_comments">Permitir comentarios</label>
                    <input
                        className="new-post-checkbox"
                        id="allow_comments"
                        type="checkbox"
                        checked={allowComments}
                        onChange={(e) => setAllowComments(e.target.checked)}
                    />
                    <label htmlFor="remixable">Remixable</label>
                    <input
                        className="new-post-checkbox"
                        id="remixable"
                        type="checkbox"
                        checked={remixable}
                        onChange={(e) => setRemixable(e.target.checked)}
                    />
                </div>
                <div>
                    <label htmlFor="public">Publico</label>
                    <input
                        className="new-post-radio"
                        id="public"
                        type="radio"
                        name="visibility"
                        value="Publico"
                        checked={visibility === 'public'}
                        onChange={() => setVisibility('public')}
                    />
                    <label htmlFor="unlisted">No listado</label>
                    <input
                        className="new-post-radio"
                        id="unlisted"
                        type="radio"
                        name="visibility"
                        value="No listado"
                        checked={visibility === 'friends'}
                        onChange={() => setVisibility('friends')}
                    />
                    <label htmlFor="private">Privado</label>
                    <input
                        className="new-post-radio"
                        id="private"
                        type="radio"
                        name="visibility"
                        value="Privado"
                        checked={visibility === 'private'}
                        onChange={() => setVisibility('private')}
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <Button type="submit">Publicar</Button>
                
            </form>
        </div>
    );
};

export default NewPost;
