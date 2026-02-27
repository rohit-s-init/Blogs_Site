import * as groupServices from "../services/group.services.js"
export function getPosts(req, res) {
    const groupId = req.params.groupId;
    const offset = req.params.offset;
    const resp = groupServices.getPosts(req.user ? req.user.id : null, offset, groupId);
    return res.json({
        posts: resp
    })
}

export function getGroup(req, res) {
    const groupId = req.params.groupId;
    const group = groupServices.getGroupData(groupId,req.user?.id);
    res.json({
        status: true,
        group
    })
}

export function searchGroup(req, res) {
    const keyword = req.params.keyword;

    if (!keyword) {
        return res.json({
            status: false,
            message: "no keyword found"
        })
    }

    const result = groupServices.searchGroup(keyword);
    return res.json(
        {
            status: true,
            groups: result
        }
    )

}


export function getGroups(req, res) {
    

    const result = groupServices.getAllGroups(req.user?.id);
    return res.json(
        {
            status: true,
            groups: result
        }
    )
}


export function createGroup(req, res) {

    const { name, description } = req.body;
    try {
        const resp = groupServices.createGroup({ name, description, createdBy: req.user.id });
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


export function joinGroup(req, res) {
    const { groupId } = req.body;

    try {
        const resp = groupServices.joinGroup(groupId, req.user.id);
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

