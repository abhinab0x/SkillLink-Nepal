import './App.css'
import JobList from './components/JobList'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>SkillLink Nepal</h1>
        <p>Connecting local talent with local opportunity</p>
      </header>
      <main>
        <JobList />
      </main>
    </div>
  )
}

export default App