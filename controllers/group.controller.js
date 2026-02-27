import * as groupServices from "../services/group.services.js"
export async function getPosts(req, res) {
    const groupId = req.params.groupId;
    const offset = req.params.offset;
    const resp = await groupServices.getPosts(req.user ? req.user.id : null, offset, groupId);
    return res.json({
        posts: resp
    })
}

export async function getGroup(req, res) {
    const groupId = req.params.groupId;
    const group = await groupServices.getGroupData(groupId,req.user?.id);
    res.json({
        status: true,
        group
    })
}

export async function searchGroup(req, res) {
    const keyword = req.params.keyword;

    if (!keyword) {
        return res.json({
            status: false,
            message: "no keyword found"
        })
    }

    const result = await groupServices.searchGroup(keyword);
    return res.json(
        {
            status: true,
            groups: result
        }
    )

}


export async function getGroups(req, res) {
    

    const result = await groupServices.getAllGroups(req.user?.id);
    return res.json(
        {
            status: true,
            groups: result
        }
    )
}


export async function createGroup(req, res) {

    const { name, description } = req.body;
    try {
        const resp = await groupServices.createGroup({ name, description, createdBy: req.user.id });
        return res.json({
            status: true,
            resp
        })

    } catch (error) {
        console.log(error);
        return res.json({
            status: false,
            mesages: "group with this name already exist"
        })
    }
}


export async function joinGroup(req, res) {
    const { groupId } = req.body;

    try {
        const resp = await groupServices.joinGroup(groupId, req.user.id);
        return res.json({
            status: true,
            resp
        })
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: "failed to join group"
        })
    }

}

