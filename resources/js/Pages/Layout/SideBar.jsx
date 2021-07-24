import React from 'react'
import PropTypes from 'prop-types'
import { CssBaseline, Drawer, Hidden, List, ListItem, ListItemIcon, ListItemText, Collapse }
    from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import {
    BarChart as BarChartIcon,
    Settings as SettingsIcon,
    ShoppingBag as ShoppingBagIcon,
    User as UserIcon,
    Users as UsersIcon
} from 'react-feather'
import { ExpandLess, ExpandMore } from '@material-ui/icons'
import { InertiaLink } from '@inertiajs/inertia-react'
import { useState } from 'react'

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
    paper: {
        top: 64
    },
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },

    },
    appBar: {
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
        },
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
        top: 64,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    menuIcon: {
        minWidth: 30,
    },
    menuText: {
        color: 'rgb(69 72 77)',
        '& span, & svg': {
            fontSize: '15px'
        },
        fontWeight: 'bold!important'
    },
    link: {
        textDecoration: 'none'
    },
    nested: {
        marginLeft: "25px"
    },
    item: {
        color: 'rgb(107, 119, 140)',
        '& span, & svg': {
            fontSize: '13px'
        }
    },

}))

function ResponsiveDrawer(props) {
    const { window } = props
    const classes = useStyles()
    const theme = useTheme()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const items = [
        {
            id: 1,
            href: 'home',
            Icon: <BarChartIcon size='20' />,
            title: 'Dashboard',
            active: false,
            collapse: false,
        },
        {
            id: 2,
            href: 'getringbadata',
            Icon: <UsersIcon size='20' />,
            title: 'Ringba',
            active: false,
            collapse: true,
            submenu: [
                {
                    title: 'Get Ringba Data',
                    href: 'getringbadata',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Temp Ringba Data',
                    href: 'tempringbadata',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Call Logs Report',
                    href: 'call-logs-report',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Archived Call Logs Report',
                    href: 'archived-call-log-report',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Pending Call Logs Report',
                    href: 'pending-call-log-report',
                    Icon: <UserIcon />,
                }
            ]
        },
        {
            id: 3,  
            href: 'market-exception-report',
            Icon: <SettingsIcon size='20' />,
            title: 'Settings',
            active: false,
            collapse: true,
            submenu: [
                // {

                //     title: 'Add Market Exception',
                //     href: 'market-exception-form',
                //     Icon: <UserIcon />,
                // },
                {
                    title: 'Market Exception Report',
                    href: 'market-exception-report',

                    Icon: <UserIcon />,
                },
                // {
                //     title: 'Add Market',
                //     href: 'add-market',
                //     Icon: <UserIcon />,
                // },
                {
                    title: 'Market Report',
                    href: 'market-report',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Customer Report',
                    href: 'customer-report',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Television Market Report',
                    href: 'zipcode.television.market',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Zip Code',
                    href: 'zipcode.data',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Market',
                    href: 'market.data',
                    Icon: <UserIcon />,
                }
            ]
        },

    ]
    let [active, inActive] = useState()
    const handleClick = (id) => {
        for (let i = 0; i < items.length; i++) {
            if (id === items[i].id) {
                inActive(items[i].id)
            }
        }
    }

    const drawer = (
        <div>
            <List
            >
                {items.map(menu => (
                    <div key={menu.id}>
                        {menu.collapse ?
                            <InertiaLink href={route(menu.href)} onClick={() => handleClick(menu.id)} style={{ textDecoration: 'none' }} key={menu.id}>
                                <ListItem button key={menu.id} >
                                    <ListItemIcon className={classes.menuIcon}>
                                        {menu.Icon}
                                    </ListItemIcon>
                                    <ListItemText primary={menu.title} className={classes.menuText} />
                                    {active === menu.id ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                            </InertiaLink> :
                            <InertiaLink href={route(menu.href)} style={{ textDecoration: 'none' }}>
                                <ListItem button>
                                    <ListItemIcon className={classes.menuIcon}>
                                        {menu.Icon}
                                    </ListItemIcon>
                                    <ListItemText primary={menu.title} className={classes.menuText} />
                                </ListItem>
                            </InertiaLink>
                        }
                        {menu.collapse ?
                            <Collapse in={active === menu.id} timeout="auto" unmountOnExit className={`${menu.active ? "classes.active" : "classes.inActive"}`}>
                                <List component="div" disablePadding>
                                    {menu.submenu.map(submenu => (
                                        <InertiaLink href={route(submenu.href)} style={{ textDecoration: 'none' }} key={submenu.title}>
                                            <ListItem button className={classes.nested} key={submenu.id}>
                                                <ListItemIcon className={classes.menuIcon}>
                                                    <ShoppingBagIcon size="15" />
                                                </ListItemIcon>
                                                <ListItemText primary={submenu.title} className={classes.item} />
                                            </ListItem>
                                        </InertiaLink>
                                    ))}
                                </List>
                            </Collapse>
                            : ""}
                    </div>
                ))}

            </List>
        </div>
    )

    const container = window !== undefined ? () => window().document.body : undefined

    return (
        <div className={classes.root}>
            <CssBaseline />
            <nav className={classes.drawer} aria-label="mailbox folders">
                <Hidden smUp implementation="css" >
                    <Drawer
                        container={container}
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,

                        }}
                        variant="permanent"

                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {props.main}

            </main>
        </div>
    )
}

ResponsiveDrawer.propTypes = {
    window: PropTypes.func,
}

export default ResponsiveDrawer
