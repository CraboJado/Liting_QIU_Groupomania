import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"
import'./app.scss';
import Landing from './pages/Landing';
import Signup from "./pages/Signup";

import Login from "./pages/Login";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/" element={<Landing />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
