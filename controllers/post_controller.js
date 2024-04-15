const getAllPosts = (req,res,next)=>{
res.send('get all posts')
}

const AddNewPost = (req,res,next)=>{
    res.send('create post')

}

module.exports = {
   AddNewPost,
    getAllPosts
}