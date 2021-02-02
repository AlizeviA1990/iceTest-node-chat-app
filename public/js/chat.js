const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML  
const messageLacationTemplate = document.querySelector("#messageLocation-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    // offsetHeight จะไม่เปลี่ยนแปลง เล็กใหญ่ก็ว่ากันไปตามขนาดหน้าจอ
    const VisibleHeight = $messages.offsetHeight

    // Height of messages container
    // scrollHeight คือ content ข้างใน ซึ่งจะมากกว่าหรือเท่ากับ visibleHeight ก็ได้ 
    const containerHeight = $messages.scrollHeight
    
    // scrollTop คือ ขนาดที่เราเลื่อนสกอลงมานับจากบนสุด
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + VisibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on("message",(messageObj)=>{
    const html = Mustache.render(messageTemplate,{username:messageObj.username,msg:messageObj.text,createdAt:moment(messageObj.createdAt).format('H:MM a')})         // ถ้า {{msg}} ใน html เป็นตัวแปรชื่ออื่น เช่น messageD เราก็เขียนแบบเต็ม ว่า (messageTemplate,{messageD:msg})
    $messages.insertAdjacentHTML('beforeend', html)    
    autoscroll()
})

socket.on("messageLocation",(urlObj)=>{
    const html = Mustache.render(messageLacationTemplate,{username:urlObj.username,url:urlObj.url,createdAt:moment(urlObj.createdAt).format('H:MM a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener("submit",(e)=>{

    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled','disabled')      // disable button

    const message = e.target.elements.messageINP.value          // document.querySelector("input").value

    socket.emit("sendMessage", message, (error)=>{
        
        $messageFormButton.removeAttribute('disabled')          // enable button
        $messageFormInput.value = ''                            // clear text inside of input after test was send!

        if(error){
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener("click",()=>{

    $sendLocationButton.setAttribute('disabled','disabled')     // disable button

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position)=>{    
        socket.emit("sendLocation",{latitude:position.coords.latitude,longitude:position.coords.longitude},()=>{
            $sendLocationButton.removeAttribute('disabled')    // enable button
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})