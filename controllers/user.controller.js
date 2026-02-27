import * as userServices from "../services/user.services.js"


export function getMe(req, res) {
    return res.json({
        status: true,
        user: req.user
    })
}
export function getMyPosts(req, res) {
    const posts = userServices.getMyPosts(req.user.id);
    return res.json({
        status: true,
        posts: posts
    })
}
export function getMyPostsById(req, res) {
    const id = req.param.id;
    if(req.user.id!=id){
        return res.json({
            status: false,
            message: "not your post"
        })
    }
    const posts = userServices.getMyPostById(id);
    return res.json({
        status: true,
        posts: posts
    })
}
export function getUserStats(req, res) {
    const userId = req.user.id;

    const stats = userServices.getUserStats(userId);

    res.json(stats);
}


// get user profile /:userId
export function getUserProfile(req,res){
    const userId = req.params.userId;
    const profile = userServices.getUserById(userId);
    console.log(userId);
    console.log(profile);
    if(!profile){
        return res.status(400).json({
            status: false,
            message: "user not found",
        })
    }
    return res.json({
        profile
    })
}

// get recent posts /"userId/:offset"
export function getRecentPosts(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentPosts = userServices.getRecentPosts(userId,offset)
    return res.json({
        posts: recentPosts
    })
}

// get recent comments /"userId/:offset"
export function getRecentComment(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentComm = userServices.getRecentComment(userId,offset)
    return res.json({
        comments: recentComm
    })
}

// get recent posts /"follower/:following"
export function getIsFollowing(req,res){
    const follower = req.params.follower;
    const following = req.params.following;
    const isFollowing = userServices.isUserFollowing(follower,following)
    return res.json({
        isFollowing
    })
}

// get recent comments /"userId/:offset"
export function getRecentUpvotes(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentUpvotes = userServices.recentUpvoted(userId,offset)
    return res.json({
        upvotes: recentUpvotes
    })
}

// get recent comments /"userId/:offset"
export function getRecentDownvotes(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentDownvote = userServices.recentDownvoted(userId,offset)
    return res.json({
        upvotes: recentDownvote
    })
}


export function userSearch(req, res) {
    const keyword = req.params.keyword;
    console.log(keyword)

    if (!keyword) {
        return res.json({
            status: false,
            message: "no keyword found"
        })
    }

    const result = userServices.searchUser(keyword);
    console.log(result)
    return res.json(
        {
            status: true,
            users: result
        }
    )

}
export function getAllUsers(req, res) {

    const result = userServices.getAllUsers();
    console.log(result)
    return res.json(
        {
            status: true,
            users: result
        }
    )

}