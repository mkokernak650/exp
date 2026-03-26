import NavBar from './NavBar'
export default function Layout({ children }) {
  return (
    <div className="layout">
      <NavBar main={children} />
    </div>
  )
}
