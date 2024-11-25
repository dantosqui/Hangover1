import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Carta from "../../components/Carta/carta.jsx";
import config from "../../config";
import "./Explorar.css";

const Explorar = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadedPostIds = useRef(new Set());
  const observer = useRef();

  const fetchPosts = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.url}post`, {
        params: { limit: 10, page },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const newPosts = response.data.collection.filter(newPost => {
        // Only add posts not already loaded
        if (!loadedPostIds.current.has(newPost.id)) {
          loadedPostIds.current.add(newPost.id);
          return true;
        }
        return false;
      });

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setHasMore(response.data.pagination.nextPage !== false);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      setError("Error fetching posts");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page]);

  useEffect(() => {
    fetchPosts();
  }, []); 

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts();
        }
      }, {
        rootMargin: '100px',
        threshold: 0.1,
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchPosts]
  );

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="explorar-container">
      <div className="wrapbusqueda">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            ref={index === posts.length - 1 ? lastPostElementRef : null}
          >
            <Carta
              putLike={true}
              className="card"
              post_id={post.id}
              profile_photo={post.post.creator_user.profile_photo}
              username={post.post.creator_user.username}
              user_id={post.post.creator_user.id}
              cloth={post.post.front_image}
            />
          </Link>
        ))}
      </div>
      {loading && <div>Cargando...</div>}
    </div>
  );
};

export default memo(Explorar);