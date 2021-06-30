import React from 'react';
import PropTypes from 'prop-types';
import { CssBaseline, Drawer, Hidden, List, ListItem, ListItemIcon, ListItemText, Collapse }
    from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    BarChart as BarChartIcon,
    Settings as SettingsIcon,
    ShoppingBag as ShoppingBagIcon,
    User as UserIcon,
    Users as UsersIcon
} from 'react-feather';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { InertiaLink } from '@inertiajs/inertia-react';
import { useState } from 'react';

const drawerWidth = 280;

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
    inActive: {
        display: 'none',
    },
    menuIcon: {
        minWidth: 30,
    },
    menuText: {
        color: 'rgb(107, 119, 140)',
        fontSize: '14px',
    },
    link: {
        textDecoration: 'none'
    },
    nested: {
        marginLeft: "25px"
    }
}));

function ResponsiveDrawer(props) {
    const { window } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const items = [
        {
            id: 1,
            href: 'dashboard',
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
            active: true,
            collapse: true,
            submenu: [
                {
                    title: 'Get Ringba Data',
                    href: 'getringbadata',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Call Logs Report',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Generate Report Affiliate',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Generate Report Target',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Archived Call Logs',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Pending Bill Call Logs',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Billed Call Logs',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
            ]
        },
        {
            id: 3,
            href: 'getringbadata',
            Icon: <SettingsIcon size='20' />,
            title: 'Settings',
            active: false,
            collapse: true,
            submenu: [
                {

                    title: 'Get Ringba Data',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Call Logs Report',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Generate Report Affiliate',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Generate Report Target',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Archived Call Logs',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Pending Bill Call Logs',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
                {
                    title: 'Billed Call Logs',
                    href: '/app/dashboard',
                    Icon: <UserIcon />,
                },
            ]
        },

    ];
    const [open, setOpen] = useState(false)

    const handleClick = (id) => {
        // for (let i = 0; i < items.length; i++) {
        //     if (id === items[i].id) {
        //         items[i].active = !items[i].active;
        //     }
        // }
        setOpen(!open);
    };



    const drawer = (
        <div>
            <List
            >
                {items.map(menu => (
                    <>
                        {menu.collapse ?
                            <InertiaLink href={route(menu.href)} onClick={handleClick} style={{ textDecoration: 'none' }}>
                                <ListItem button>
                                    <ListItemIcon className={classes.menuIcon}>
                                        {menu.Icon}
                                    </ListItemIcon>
                                    <ListItemText primary={menu.title} className={classes.menuText} />
                                    {open ? <ExpandLess /> : <ExpandMore />}
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
                            <Collapse in={open} timeout="auto" unmountOnExit className={`${menu.active ? "active" : "inActive"}`}>
                                <List component="div" disablePadding>
                                    {menu.submenu.map(submenu => (
                                        <InertiaLink href={route(menu.href)} key={submenu.title} style={{ textDecoration: 'none' }}>
                                            <ListItem button className={classes.nested}>
                                                <ListItemIcon className={classes.menuIcon}>
                                                    <ShoppingBagIcon size="15" />
                                                </ListItemIcon>
                                                <ListItemText primary={submenu.title} className={classes.menuText} />
                                            </ListItem>
                                        </InertiaLink>
                                    ))}
                                </List>
                            </Collapse>
                            : ""}
                    </>
                ))}

            </List>
        </div>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

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
    );
}

ResponsiveDrawer.propTypes = {
    window: PropTypes.func,
};

export default ResponsiveDrawer;
