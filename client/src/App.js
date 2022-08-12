import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"
import'./app.scss';
import Landing from './pages/Landing/Landing';
import Signup from "./pages/Signup/Signup";

import Login from "./pages/Login/Login";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/" element={<Landing />}></Route>
        </Routes>
      </BrowserRouter>
    
  );
}

export default App;
