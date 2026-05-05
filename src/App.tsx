import { useState } from 'react'
import './App.css'
import FlickerScreen from "./Components/FlickerScreen/FlickerScreen"
import Header from './Components/Header/Header' 
import MainPanel from './Components/MainPanel/MainPanel'
import TextEffect from './Components/TextEffect/TextEffect'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/* <FlickerScreen /> */}
    <Header/>
    <hr className="line" />
    <MainPanel />
    <TextEffect />
    

    </>
  )
}

export default App
