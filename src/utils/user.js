const users = []

const addUser = ({id, username, room})=>{
    //  clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room){
        return{
            error:'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]    // normally retrun Array of all item we remove 
    }
}



const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// วิธีใช้
// วิธีการแอด user คือ
// addUser({
//     id:22,
//     username:'Andrew',
//     room:'South Philly'
// })
// addUser({
//     id:42,
//     username:'Mike',
//     room: 'South Philly'
// })
// addUser({
//     id:32,
//     username:'Andrew',
//     room:'Center City'
// })
// วิธีลบ user คือ
// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)
// console.log(getUser(42))
// console.log(getUsersInRoom('Center City'))