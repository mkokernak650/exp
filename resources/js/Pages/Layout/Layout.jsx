import SideBar from './SideBar';
import NavBar from './NavBar';
import { useState } from 'react'
export default function Layout({ title, children }) {
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <div className='layout'>
            <NavBar />
            <div className="main">
                <SideBar onMobileClose={() => setMobileNavOpen(false)} openMobile={isMobileNavOpen} main={children}/>
            </div>
        </div>
    )
}
