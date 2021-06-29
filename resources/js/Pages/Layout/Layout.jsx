import SideBar from './SideBar';
import NavBar from './NavBar';
import { useState } from 'react'
export default function Layout() {
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    return (
        <div className='layout'>
            <NavBar />
            <SideBar onMobileClose={() => setMobileNavOpen(false)} openMobile={isMobileNavOpen} />
        </div>
    )
}
