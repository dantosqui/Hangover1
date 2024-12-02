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
  const cancelTokenSource = useRef(null);

  const fetchPosts = useCallback(async () => {
    // Cancel previous request
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('New request initiated');
    }

    // Create new cancel token
    cancelTokenSource.current = axios.CancelToken.source();

    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.url}post`, {
        params: { limit: 10, page },
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: cancelTokenSource.current.token
      });
      
      const newPosts = response.data.collection.filter(newPost => {
        if (!loadedPostIds.current.has(newPost.id)) {
          loadedPostIds.current.add(newPost.id);
          return true;
        }
        return false;
      });

      setPosts(prevPosts => {
        const combinedPosts = [...prevPosts, ...newPosts];
        return combinedPosts.filter((post, index, self) => 
          index === self.findIndex(t => t.id === post.id)
        );
      });

      setHasMore(response.data.pagination.nextPage !== false);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError("Error fetching posts");
        console.error("Error fetching posts:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [hasMore, page, loading]);

  useEffect(() => {
    fetchPosts();
    return () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel('Component unmounted');
      }
    };
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

  if (loading && posts.length === 0) {
    return <div>Cargando...</div>;
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
      {loading && posts.length > 0 && <div>Cargando más...</div>}
    </div>
  );
};

export default memo(Explorar);