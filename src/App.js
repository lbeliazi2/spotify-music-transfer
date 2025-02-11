import './App.css';
import SpotifyLogin from "./app/pages/SpotifyLogin";
import {Route, Routes} from "react-router-dom";
import Menu from "./app/pages/Menu";

function App() {
  return (
    <div className="App">
        <Routes>
            <Route path="/" element={<SpotifyLogin/>}  />
            <Route path="/callback" element={<SpotifyLogin />} />
            <Route path="/menu" element={<Menu />} />
        </Routes>
    </div>
  );
}

export default App;
