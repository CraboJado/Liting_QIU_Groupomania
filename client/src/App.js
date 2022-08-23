import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"
import'./app.scss';
import Landing from './pages/landing/Landing';
import Signup from "./pages/signup/Signup";

import Login from "./pages/login/Login";



function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/home" element={ <div>HOME</div>}></Route>
        </Routes>
      </BrowserRouter>
    
  );
}

export default App;
