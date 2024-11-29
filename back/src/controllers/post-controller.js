import  express from "express";
import PostService from "../services/post-service.js";
import { AuthMiddleware } from "../auth/authMiddleware.js";
import { Comment } from "../entities/comment.js";
import { CommentLikes } from "../entities/comment_likes.js";
import { Liked } from "../entities/liked.js";
import { Saved } from "../entities/saved.js";


const router = express.Router()
const postService = new PostService()
router.get("/:id", AuthMiddleware, async (req, res) => {
    const idPost = req.params.id;
    const limitComments = req.query.limitComments;
    const offsetComments = req.query.offsetComments;
    const post = await postService.GetPostById(idPost);

    if (post === null) {
        return res.status(404).send();
    }

    const canComment = await postService.canComment(idPost);
    const comments = canComment ? await postService.GetCommentsPost(idPost, limitComments, offsetComments) : [];

    let liked = false;
    let saved = false;
    if (req.user != null) 
    {
        [liked, saved] = await postService.isLikedSaved(idPost, req.user.id);
    }

    return res.status(200).json({ post, comments, liked, saved, canComment });
});

router.get("/:id/comments", async (req, res) => {
    const idPost=req.params.id;
    const limitComments = req.query.limit;
    const page = req.query.page-1;
    var comments = null;
    const canComment = await postService.canComment(idPost);
    if(canComment == true){
        comments = await postService.GetCommentsPost(idPost,limitComments,offsetComments);
    }
        return res.status(200).json(comments);
    });
    
router.get("/comments/:idComment/responses", async (req, res) =>{
    const idComment = req.params.idComment;
    const limitResponses = req.query.limit;
    const page = req.query.page-1;
    const responses = await postService.GetResponsesComment(idComment, limitResponses, page);
    return res.status(200).json(responses);
});

router.get("/search/:searchQuery", async (req, res) => {
    const limit = req.query.limit;
    const page = req.query.page;
    const query = req.params.searchQuery;  // Asegúrate de que este nombre coincide con el del frontend
    const collection = await postService.SearchPosts(query, limit, page);
    if (collection.pagination.nextPage){
        const reqpath = req.path==="/" ? "" : req.path
        const nPage = Number(Number(req.query.page)+Number(1)) //javascript
        let nextPage="http://"+req.get('host') + req.baseUrl + reqpath+"/?limit="+req.query.limit+"&page="+nPage
        collection.pagination.nextPage=nextPage
    }
    if (collection === null) {
      return res.status(404).send();
    } else {
      return res.status(200).json(collection);
    }
  });

router.get("/",AuthMiddleware,async (req, res) =>{
    const limit = req.query.limit;
    const page = req.query.page;
    const userId = req.user === null ? null : req.user.id;
    const collection = await postService.GetAllPost(limit, page, userId);
    
    if (collection.pagination.nextPage){
        const reqpath = req.path==="/" ? "" : req.path
        const nPage = Number(Number(req.query.page)+Number(1)) //javascript
        let nextPage="http://"+req.get('host') + req.baseUrl + reqpath+"/?limit="+req.query.limit+"&page="+nPage
        collection.pagination.nextPage=nextPage
    }
    if(collection === null){
        return res.status(404).send();
    }
    else{
        return res.status(200).json(collection);
    }
});     

router.post("/", AuthMiddleware, async (req, res) => {
    const post = {
        creator_id: req.user.id,
        title: req.body.title,
        description: req.body.description,
        allow_comments: req.body.allow_comments,
        visibility: req.body.visibility,
        parent_id:null, //TEMPORAL
        remixable: req.body.remixable,
        design_id: req.body.designId
    };
    

    const inserted = await postService.InsertPost(post);
    if (inserted) {
        
        return res.status(201).send();
    } else {
        return res.status(400).send();
    }
})

router.post("/:id/comment", AuthMiddleware, async (req,res)=> {
    if(req.user){
        let comment = new Comment(
            null,
            req.body.post_id, 
            req.body.content,
            null,
            '0', 
            req.body.parent_id, 
            req.user.id
        );
        comment.likes=0
    
    
    
        const inserted = await postService.InsertComment(comment);
        if(inserted){
            return res.status(201).send();
        }
        else{
            return res.status(400).send();
        }
    }
    else{
        return res.status(401).send();
    }
    
});

router.post("/:idPost/comment/:idComment/like", AuthMiddleware, async (req,res)=> {
    const like = new CommentLikes(
        null,
        req.params.idComment,
        req.user    
    );

    const inserted = await postService.InsertCommentLikes(like);
    if(inserted){
        return res.status(201).send();
    }
    else{
        return res.status(400).send();
    }
    
});

router.delete("/:idPost/comment/:idComment/like", AuthMiddleware, async (req,res)=> {
    const like = new CommentLikes(
        null,
        req.params.idComment,
        req.user    
    );
    
    const deleted = await postService.DeleteCommentLikes(like);
    if(deleted){
        return res.status(204).send();
    }
    else{
        return res.status(400).send();
    }
    
});

router.post("/:id/like", AuthMiddleware, async (req,res)=> {
    const like = new Liked(
        null,
        req.user.id,
        req.params.id
    ); 
    const inserted = await postService.InsertLiked(like);
    
    if(inserted){
        return res.status(201).send();
    }
    else{
        return res.status(400).send();
    }
});

router.delete("/:id/like", AuthMiddleware, async (req, res) => {
    try {
        const like = {
            user_id: req.user.id,
            post_id: req.params.id
        };
        
        const deleted = await postService.DeleteLiked(like);
        if (deleted) {
            return res.status(200).json({ message: "Like removed successfully" });
        } else {
            return res.status(404).json({ error: "Like not found" });
        }
    } catch (error) {
        console.error("Error removing like:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/:id/save", AuthMiddleware, async (req,res) => {
    const saved = new Saved(
        null,
        req.user.id,
        req.params.id
    );


    const inserted = await postService.InsertSaved(saved);
    if(inserted){
        return res.status(201).send();
    }
    else{
        return res.status(400).send();
    }
});


router.delete("/:id/save", AuthMiddleware, async(req, res) => {
    const saved = new Saved(
        null,
        req.user.id,
        req.params.id
    );

    const deleted = await postService.DeleteSaved(saved);
    if(deleted){
        return res.status(204).send();
    }
    else{
        return res.status(400).send();
    }
});

//guardar post

export default router