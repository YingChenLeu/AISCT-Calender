import { Routes, Route } from "react-router-dom";
import Calender from "./components/calender";

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Calender />
            </>
          }
        />
      </Routes>
    </>
  );
};

export default App;
