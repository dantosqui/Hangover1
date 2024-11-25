import pg from 'pg';
import { DBConfig } from "./dbconfig.js";
import  Pagination  from '../src/entities/pagination.js';


export class PostRepository {
    constructor() {
        const { Client } = pg;
        this.DBClient = new Client(DBConfig);
        this.DBClient.connect();
    }

    
    async getPostById(id){
        
        const query = 
        `SELECT posts.*, 
        json_build_object (
            'id', users.id,
            'username', users.username,
            'profile_photo', users.profile_photo,
            'follower_number', (SELECT COUNT(id) FROM user_relationships WHERE followed_id = users.id)
        ) AS creatorUser,
        json_build_object (
            'front_image', posts.front_image,
            'back_image', posts.back_image
        ) AS post_image,
        (SELECT COUNT(id) FROM comments WHERE post_id = posts.id) AS total_comments
        FROM posts 
        INNER JOIN users on posts.creator_id = users.id
        WHERE posts.id = $1`;

        try {
            const post = (await this.DBClient.query(query, [id])).rows;
            return post;
        }
        catch(error) {
            console.error("Error capturado:", error);

            // Devolver un código de estado 500
            //res no existe aca res.status(500).send('Error interno del servidor');
        }
        
    }

    async getCommentsPost(id, limit_comments_post, page_comments_post){
        
        let query = 
        `SELECT
        json_build_object (
            'user_id', u.id,
            'username', u.username,
            'profile_photo', u.profile_photo,
            'date', c.date_posted,
            'content', c.content,
            'comment_id', c.id,
            'parent_id', c.parent_id,
            'likes', (SELECT COUNT(id) FROM comment_likes WHERE comment_id = c.id)
        ) AS comment,
        (SELECT COUNT(id) FROM comments WHERE parent_id = c.id) AS total_responses_comment
        FROM comments c
        INNER JOIN users u ON c.creator_id = u.id
        WHERE c.post_id = $1 AND c.parent_id IS NULL
        GROUP BY c.id, u.id
        LIMIT $2 OFFSET $3;
        `;
        const comments = (await this.DBClient.query(query, [id, limit_comments_post, page_comments_post * limit_comments_post])).rows;

        query = "SELECT COUNT(id) AS total FROM comments WHERE post_id = $1";
        const total_comments_post = (await this.DBClient.query(query, [id])).rows[0].total;

        return Pagination.BuildPagination(comments, limit_comments_post, page_comments_post, total_comments_post);
    }

    async getResponsesComment(idComment, limit_responses_comment, page_responses_comment){
        let query = 
        `SELECT
        json_build_object (
            'user_id', u.id,
            'username', u.username,
            'profile_photo', u.profile_photo,
            'date', c.date_posted,
            'content', c.content,
            'comment_id', c.id,
            'parent_id', c.parent_id,
            'likes', (SELECT COUNT(id) FROM comment_likes WHERE comment_id = c.id)
        ) AS comment
        FROM comments c
        INNER JOIN users u ON c.creator_id = u.id
        WHERE c.parent_id = $1
        LIMIT $2 OFFSET $3`;

        const responses = (await this.DBClient.query(query, [idComment, limit_responses_comment, page_responses_comment * limit_responses_comment])).rows;

        query = "SELECT COUNT(id) AS total FROM comments WHERE parent_id = $1";
        const total_responses_comment = (await this.DBClient.query(query, [id])).rows[0].total;

        return Pagination.BuildPagination(responses, limit, page, total_responses_comment);

    }

    async SearchPosts(query, limit, page) {
        const searchQuery = `%${query}%`;
        const offset = (page - 1);
        console.log("page",page)
        const sql = `
        SELECT 
        p.id AS post_id,
        json_build_object (
            'title', p.title,
            'description', p.description,
            'date_posted', p.date_posted,
            'likes', p.likes,
            'front_image', p.front_image,
            'back_image', p.back_image,
            'creator_user', json_build_object (
                'id', u.id,
                'username', u.username,
                'profile_photo', u.profile_photo
            ),
            'tags', COALESCE(json_agg(pt.tag_id) FILTER (WHERE pt.tag_id IS NOT NULL), '[]') -- Agregar los tags como un array JSON
        ) AS post,
        COUNT(pt.tag_id) AS tag_count,
        (CASE
            WHEN u.username LIKE $1 THEN 4
            WHEN p.title LIKE $1 THEN 3
            WHEN p.description LIKE $1 THEN 1
            ELSE 0
        END) AS relevance
        FROM 
            posts p
        JOIN 
            users u ON p.creator_id = u.id
        LEFT JOIN 
            post_tag pt ON p.id = pt.post_id
        WHERE 
            --ilike trains 
            u.username ILIKE $1 
            OR p.title ILIKE $1 
            OR p.description ILIKE $1
        GROUP BY 
            p.id, u.id, u.username, u.profile_photo
        ORDER BY 
            relevance DESC
        LIMIT 
            $2 OFFSET $3;
    
        `;

        try {
            const result = await this.DBClient.query(sql, [searchQuery, limit, offset]);
            
            // Contar el total de resultados que coinciden con la búsqueda
            const countQuery = `
                SELECT COUNT(DISTINCT p.id) AS total
                FROM posts p
                JOIN users u ON p.creator_id = u.id
                LEFT JOIN post_tag pt ON p.id = pt.post_id
                WHERE 
                    u.username LIKE $1 
                    OR p.title LIKE $1 
                    OR p.description LIKE $1
            `;
            const countResult = await this.DBClient.query(countQuery, [searchQuery]);
            const total = countResult.rows[0].total;
            console.log("total", total, "--", "page", page);
            return Pagination.BuildPagination(result.rows, limit, page, total);
        } catch (error) {
            console.error("Error fetching search results:", error);
            throw error; // Puedes lanzar el error para que lo maneje el controlador o middleware
        }
    }
    
    

    async getAllPost(limit, page, userId) {
        page = page - 1;
    
        let query = `
            SELECT
                p.id,
                json_build_object (
                    'creator_user', json_build_object (
                        'id', u.id,
                        'username', u.username,
                        'profile_photo', u.profile_photo
                    ),
                    'front_image', p.front_image
                ) AS post
            FROM 
                posts p
            INNER JOIN 
                users u ON p.creator_id = u.id
            INNER JOIN
                visibilities v ON p.visibility_id = v.id
            WHERE 
                v.visibility = 'public'
                AND NOT EXISTS (
                    SELECT 1 
                    FROM saved s 
                    WHERE s.user_id = $1 
                    AND s.post_id = p.id
                )
            LIMIT $2 OFFSET $3;
        `;
    
        const collection = (await this.DBClient.query(query, [userId, limit, page * limit])).rows;
    
        query = "SELECT COUNT(posts.id) AS total FROM posts inner join visibilities on posts.visibility_id=visibilities.id WHERE visibilities.visibility = 'public'"; // Adjust here as well
        const total = (await this.DBClient.query(query)).rows[0].total;
    
        return Pagination.BuildPagination(collection, limit, page, total);
    }

    async InsertPost(post) {
        try {
            const query = `
                INSERT INTO posts (creator_id, title, description, allow_comments, visibility_id, parent_id, likes, remixable, date_posted, front_image, back_image,price)
                VALUES ($1, $2, $3, $4, (select id from visibilities where visibility = $5), $6, 0, $7,CURRENT_DATE, (select image from designs where id=$8), '',35)
                RETURNING id;
            `;
            const values = [
                post.creator_id,
                post.title,
                post.description,
                post.allow_comments,
                post.visibility,
                post.parent_id, // Este es el valor que tienes temporalmente en null
                post.remixable,
                post.design_id
            ];
            
            console.log(values)
            const result = await this.DBClient.query(query, values);
            
            return result.rows[0].id;  // Devuelve el ID del post insertado
        } catch (error) {
            console.error('Error al crear post:', error);
            throw error;
        }
    }

    async insertComment(comment){
        const query = "INSERT INTO comments (post_id, content, date_posted, likes, parent_id, creator_id) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)";
        const values = [comment.post_id, comment.content, comment.likes, comment.parent_id, comment.creator_id];                
        try{
            const inserted = await this.DBClient.query(query, values);
            return inserted.rowCount > 0;
        } catch (error) {
            console.error("Error capturado:", error);

            // Devolver un código de estado 500
            return false;
        }
        
    }
    
    async insertCommentLikes(like){
        const query = "INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)";
        const values = [like.comment_id, like.user_id];
        try{
            const inserted = await this.DBClient.query(query, values);
            return inserted.rowCount > 0;
        }
        catch ( error ) {
            console.error("Error capturado:", error);

            // Devolver un código de estado 500
            return false;
        }
    }

    async deleteCommentLikes(like){
        const query = "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2";
        const values = [like.comment_id, like.user_id];
        try{
            const deleted = await this.DBClient.query(query, values);
            return deleted.rowCount > 0;
        } catch(error){
            console.error("Error capturado:", error);

            // Devolver un código de estado 500
            return false;
        }
    }
async isLiked(filters){
    
    const query = "SELECT * FROM LIKED WHERE user_id = $1 and post_id = $2"
    const values = [filters.user_id, filters.post_id]
    try{
const likes = await this.DBClient.query(query,values)
return likes.rowCount>0;
    }catch(error){
        console.error("ERROR BUSCANDO LIKES FILTRADOS: ",error)
        return false;
    }
}
    async insertLiked(like){
        const query = "INSERT INTO liked (user_id, post_id) VALUES ($1, $2)";
        const values = [like.user_id, like.post_id];
       
        try{
            const inserted = await this.DBClient.query(query, values);
            return inserted.rowCount > 0;
        }
        catch ( error ) {
            console.error("Error capturado:", error);

            // Devolver un código de estado 500
            return false;
        }
    }
    async deleteLiked(like) {
        const query = "DELETE FROM liked WHERE user_id = $1 AND post_id = $2";
        const values = [like.user_id, like.post_id];
        try {
            const result = await this.DBClient.query(query, values);
            return result.rowCount > 0;
        } catch (error) {
            console.error("Error deleting like:", error);
            throw error;  // Propaga el error para que pueda ser manejado en el controlador
        }
    }
    async insertSaved(saved){
        const query = "INSERT INTO saved (post_id, user_id) VALUES ($1, $2)";
        const values = [saved.post_id, saved.user_id];
        try{
            const inserted = await this.DBClient.query(query, values);
            return inserted.rowCount > 0;
        }
        catch(error){
            console.error("Error capturado:", error);
            return false;
        }
    }

    async deleteSaved(saved){
        const query = "DELETE FROM saved WHERE user_id=$1 AND post_id=$2";
        const values = [saved.user_id, saved.post_id];
        try{
            const deleted = await this.DBClient.query(query, values);
            return deleted.rowCount > 0;
        }
        catch(error){
            console.error("Error capturado:", error);
            return false;
        }
    }

    async isLikedByUser(idUser, idPost) {
        try {
          const query = `
            SELECT *
            FROM liked
            WHERE user_id = $1 AND post_id = $2
          `;
          const result = await this.DBClient.query(query, [idUser, idPost]);
          return result.rowCount > 0;
        } catch (error) {
          console.error("Error checking if post is liked by user:", error);
          throw error;
        }
      }

      async isSavedByUser(idUser, idPost) {
        try {
          const query = `
            SELECT COUNT(*) AS count
            FROM saved
            WHERE user_id = $1 AND post_id = $2
          `;
      
          const result = await this.DBClient.query(query, [idUser, idPost]);
      
          return result.rowCount > 0;
        } catch (error) {
          console.error("Error checking if post is saved by user:", error);
          throw error;
        }
      }
      
      async puedeComentar(postId){
        const query = "SELECT allow_comments FROM posts WHERE id = $1"
        const result = await this.DBClient.query(query, [postId]);
        console.log("este es el result: "+ result.rows[0].allow_comments)
        return result.rows[0].allow_comments;
      }



}