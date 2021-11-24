import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import OtherPage from './OtherPage';
import Fib from './Fib';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="App-header">
          <Link to="/">Home</Link>
          <Link to="/otherpage">Secret Page</Link>
        </div>
        <div>
            <Route exact path="/" component={Fib} />
            <Route path="/otherpage" component={OtherPage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
