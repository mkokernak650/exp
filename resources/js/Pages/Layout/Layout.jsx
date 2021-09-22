import NavBar from "./NavBar";
export default function Layout({ title, children }) {
  return (
    <div className="layout">
      <NavBar main={children} />
    </div>
  );
}
