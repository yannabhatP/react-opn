import { useEffect, Fragment, useState } from 'react'
import { socket } from './socket/socket'

let Omise


function App() {

  const [qrcode, setQrcode] = useState("")
  const [roomSource, setRoomSource] = useState("")
  const [isPaid, setIsPaid] = useState(false)


  const handleLoadScript = () => {
    Omise = window?.Omise
    Omise.setPublicKey("pkey_test_5zlw05cusd3t3tr4e2r")
  }

  const onCheckOut = () => {

    const source =  {
      "amount" : 10000,
      "currency" : "THB",
    }

    Omise.createSource(
      "promptpay",
      source,
      async(_, response)=>{
        source.source = response.id
        setRoomSource(()=>response.id)

        const request = new Request("http://localhost:3000/charge",{
          method : "POST",
          body : JSON.stringify(source),
          headers : {
            "Content-Type" : "application/json"
          }
        })

        const result =  await
        fetch(request)
        .then( res => res.json())
        .then( res => ({ code : true, res}))
        .catch(err => ({ code : false, err}))

        if(result.code){
          // console.log(result.res)
          setQrcode(()=>result.res?.source?.scannable_code?.image?.download_uri)
        }
      }

    )
  }

  useEffect(()=>{
    socket.on("connect",()=>{
      // socket.emit(roomSource,"test")
    })
    // socket.on("disconnect",()=>{})
      // socket.on(roomSource,(arg) => {
        //   console.log(roomSource)
        //   console.log(arg)
        // })
        
        handleLoadScript()
  },[])

  useEffect(() => {
    socket.on(roomSource,(arg) =>{ 
      setIsPaid(()=>true)
    })
  },[roomSource])

      
      
  // socket.emit(roomSource,"test")

  return(
    <Fragment>
      {qrcode === "" && !isPaid && <button onClick={onCheckOut}>Check Out</button>}
      {qrcode !== "" && !isPaid && <img src={qrcode} width={500} height={500}/>}
      {isPaid && <h1> Payment Completed</h1>}
    </Fragment>
  )
}

export default App
