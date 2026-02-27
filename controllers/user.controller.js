import * as userServices from "../services/user.services.js"


export function getMe(req, res) {
    return res.json({
        status: true,
        user: req.user
    })
}
export async function getMyPosts(req, res) {
    const posts = await userServices.getMyPosts(req.user.id);
    return res.json({
        status: true,
        posts: posts
    })
}
export async function getMyPostsById(req, res) {
    const id = req.param.id;
    if(req.user.id!=id){
        return res.json({
            status: false,
            message: "not your post"
        })
    }
    const posts = await userServices.getMyPostById(id);
    return res.json({
        status: true,
        posts: posts
    })
}
export async function getUserStats(req, res) {
    const userId = req.user.id;

    const stats = await userServices.getUserStats(userId);

    res.json(stats);
}


// get user profile /:userId
export async function getUserProfile(req,res){
    const userId = req.params.userId;
    const profile = await userServices.getUserById(userId);
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
export async function getRecentPosts(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentPosts = await userServices.getRecentPosts(userId,offset)
    return res.json({
        posts: recentPosts
    })
}

// get recent comments /"userId/:offset"
export async function getRecentComment(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentComm = await userServices.getRecentComment(userId,offset)
    return res.json({
        comments: recentComm
    })
}

// get recent posts /"follower/:following"
export async function getIsFollowing(req,res){
    const follower = req.params.follower;
    const following = req.params.following;
    const isFollowing = await userServices.isUserFollowing(follower,following)
    return res.json({
        isFollowing
    })
}

// get recent comments /"userId/:offset"
export async function getRecentUpvotes(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentUpvotes = await userServices.recentUpvoted(userId,offset)
    return res.json({
        upvotes: recentUpvotes
    })
}

// get recent comments /"userId/:offset"
export async function getRecentDownvotes(req,res){
    const userId = req.params.userId;
    const offset = req.params.offset
    const recentDownvote = await userServices.recentDownvoted(userId,offset)
    return res.json({
        upvotes: recentDownvote
    })
}


export async function userSearch(req, res) {
    const keyword = req.params.keyword;
    console.log(keyword)

    if (!keyword) {
        return res.json({
            status: false,
            message: "no keyword found"
        })
    }

    const result = await userServices.searchUser(keyword);
    console.log(result)
    return res.json(
        {
            status: true,
            users: result
        }
    )

}
export async function getAllUsers(req, res) {

    const result = await userServices.getAllUsers();
    console.log(result)
    return res.json(
        {
            status: true,
            users: result
        }
    )

}