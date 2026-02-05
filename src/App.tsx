import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/events" element={<Events />} />
    </Routes>

      


    

    </>
  )
}

export default App