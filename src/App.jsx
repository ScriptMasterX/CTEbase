import './App.css'
import Login from './Login'


export default function App() {
  return (
    <main style={{overflowX: 'hidden', overflowY: 'hidden'}}>
      <div className="navbar">
        <h1>CTEbase</h1>
      </div>
      <Login />
      
    </main>
  )
}
