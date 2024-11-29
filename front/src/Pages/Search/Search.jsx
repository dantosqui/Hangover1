import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Carta from "../../components/Carta/carta";
import config from "../../config";

const Search = () => {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { search } = useParams();
  const observer = useRef();
  const loadingRef = useRef(null);

  const fetchResults = useCallback(async (pageNum, reset = false) => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      
      const response = await axios.get(`${config.url}post/search/${search}`, {
        params: { limit: 10, page: pageNum },
      });

      const newResults = response.data.collection;
      setResults((prevResults) => (reset ? newResults : [...prevResults, ...newResults]));
      setHasMore(response.data.pagination.nextPage !== false);
      setPage((prevPage) => (reset ? 2 : prevPage + 1));
    } catch (error) {
      setError("Error fetching search results");
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  }, [search, hasMore, loading]);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchResults(1, true);
  }, [search]);

  useEffect(() => {
    const currentObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchResults(page);
        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      currentObserver.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        currentObserver.unobserve(loadingRef.current);
      }
    };
  }, [fetchResults, hasMore, loading, page]);

  const dividedPosts = results.reduce((acc, post, index) => {
    const groupIndex = index % 4;
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(post);
    return acc;
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="centrador">
      <div className="wrapbusqueda">
        {results.length > 0 ? (
          dividedPosts.map((group, groupIndex) => (
            <div key={groupIndex} className={`wrapbusqueda-group${groupIndex}`}>
              {group.map((post) => (
                <Link
                  key={post.post_id || post.id}
                  to={`/post/${post.post_id || post.id}`}
                >
                  <Carta 
                    putLike={true}
                    className={`cardGroup${groupIndex}`} 
                    post_id={post.post_id || post.id} 
                    profile_photo={post.post.creator_user.profile_photo} 
                    username={post.post.creator_user.username} 
                    user_id={post.post.creator_user.id} 
                    cloth={post.post.front_image} 
                  />
                </Link>
              ))}
            </div>
          ))
        ) : (
          <p className="no-results">No results found</p>
        )}
        <div ref={loadingRef} className="loading-trigger">
          {loading && <div className="loading-indicator">Loading...</div>}
        </div>
      </div>
    </div>
  );
};

export default Search;