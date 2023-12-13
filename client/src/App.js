import {useState,useEffect} from "react"
import './App.css';
import io from 'socket.io-client'; // This line imports the io function from the 'socket.io-client' library. The io function is the primary method for creating a Socket.IO client.
const socket = io.connect("http://localhost:8379");// Initialize Socket Connection: Create a socket connection to the server running at http://localhost:8386 using the io.connect method. The resulting object (socket) will be used to interact with the Socket.IO server.
const userSocket = io("http://localhost:8379/user",{ auth:{token:'Test'}})
console.log(userSocket)

function App() {
  const [initialValue,setValue] = useState("");
  const [initialJoinValue,setJoinValue] =useState("");
  const [content,setContent] = useState("")
  
  const typeMessage = (event)=>{
    //call setValue function which is used to update
    setValue(event.target.value)
  }
  const joinTyping= (event)=>{
    setJoinValue(event.target.value)
  }

  const sendMessage = ()=>{
    socket.emit("send_message",{initialValue,initialJoinValue})
  }

  const joinRoom =()=> {
    socket.emit("join_room",initialJoinValue,(roomIdChar)=>displayRoom(roomIdChar))
  }

  const displayRoom=(roomId)=>{
    alert(`joined ${roomId}`)
  }

  useEffect(()=>{
    socket.on("receive_message",(dataReceived)=>{
      setContent(dataReceived)
    })
  },[])

  return (
    <div className="mainBg">
      <div className="bg">
        <p>You are connected with id: {socket.id}</p>
        <p>{content}</p>
      </div>

      <div className="input-group">
        <input type="text" value={initialValue} placeholder="Type your message" onChange={typeMessage} />
        <button type="button" onClick={sendMessage}>Send</button>
      </div>

      <div className="input-group">
      <input type="text" value={initialJoinValue} placeholder="Join Room" onChange={joinTyping} />
      <button type="button" onClick={joinRoom}>Join</button>
      </div>      

    </div>
  );
}

export default App;
