// เปิด io session
const socket = io()

// focus countUpdated value from server
socket.on('countUpdated',(count)=>{
    // console log count to client terminal
    console.log('The count has been updated! ', count)

})

// query button from html and add event
document.querySelector('#increment').addEventListener('click', ()=>{
    // console log this action type to client terminal
    console.log('Clicked')
    // call function increment in server
    socket.emit('increment')

    
    // EX. CALLBACK
    // ถ้าเราต้องการให้ หลังจากส่งข้อความไปแล้ว มีแอคชั่นอะไรซักอย่างเกิดขึ้นใน ฝั่งไคแอนคนนี้ด้วย 
    // ก็ให้เราเพิ่ม callback function ตามหลัง parameter โดยที่ parameter นั่นจะมีกี่ตัวก็ได้ไม่จำเป็นต้องเป็นแค่ 1 ค่า
    socket.emit("sendMessage", message, (msgFSVR)=>{
        // ในที่นี้เมื่อข้อความของเราที่ถูกส่งไปยัง server และ server ได้กระจายให้ทุกคนจนครบแล้ว เราจะได้รับการเรียก callback 
        // ของเราจาก server ดังนั้นที่หน้าจอของเรา จะแสดง ว่า ข้อความได้ถูกส่งไปแล้ว
        console.log(msgFSVR)
    })
})

document.querySelector("#send-location").addEventListener("click",()=>{
    // เช็คว่า browser รองรับ geolocation ไหม
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    //ถ้า มีให้ขอ position
    navigator.geolocation.getCurrentPosition((position)=>{

        console.log(position)
        // ส่งข้อมูลไปให้ server ที่ function sendLocation
        // โดยลักษณะการส่งแบบ ปีกกา นี้ เป็นการส่ง แบบ object with key and value
        socket.emit("sendLocation",{latitude:position.coords.latitude,longitude:position.coords.longitude})
    })
})