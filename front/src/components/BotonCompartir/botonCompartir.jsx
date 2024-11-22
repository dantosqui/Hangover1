import React, { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import styled from "styled-components";

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  max-width: 500px;
  margin: 20px auto;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;

  button {
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const LinkPreview = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
  margin-bottom: 20px;
`;

const PreviewImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
`;

const PreviewContent = styled.div`
  padding: 10px;
  flex-grow: 1;
`;

const PreviewTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
`;

const PreviewDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const ShareButtons = ({ url, message, image, title, description }) => {
    const [copied, setCopied] = useState(false);
  
    const copyToClipboard = () => {
      // Codificar el mensaje y la imagen para su uso seguro en la URL
      const encodedMessage = encodeURIComponent(message);
      const encodedImage = encodeURIComponent(image);
      
      // Crear la URL con el mensaje y la imagen como parámetros de consulta
      const urlWithParams = `${url}?message=${encodedMessage}&image=${encodedImage}`;
  
      navigator.clipboard.writeText(urlWithParams).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };

    return (
        <ShareContainer>
          <LinkPreview>
            <PreviewImage src={image} alt={title} />
            <PreviewContent>
              <PreviewTitle>{title}</PreviewTitle>
              <PreviewDescription>{description}</PreviewDescription>
            </PreviewContent>
          </LinkPreview>
    
          <ButtonsContainer>
            <FacebookShareButton url={url} quote={message} hashtag="#compartir">
              <FacebookIcon size={32} round />
            </FacebookShareButton>
    
            <TwitterShareButton url={url} title={message}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
    
            <WhatsappShareButton url={url} title={message} separator=":: ">
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
    
            <button onClick={copyToClipboard}>
              {copied ? "Copiado!" : "Copiar Link"}
            </button>
          </ButtonsContainer>
        </ShareContainer>
      );
};

export default ShareButtons;