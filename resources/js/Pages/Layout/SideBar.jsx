import React from 'react';
import PropTypes from 'prop-types';
import { CssBaseline, Drawer, Hidden, List, ListItem, ListItemIcon, ListItemText, Typography }
    from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    AlertCircle as AlertCircleIcon,
    BarChart as BarChartIcon,
    Lock as LockIcon,
    Settings as SettingsIcon,
    ShoppingBag as ShoppingBagIcon,
    User as UserIcon,
    UserPlus as UserPlusIcon,
    Users as UsersIcon
} from 'react-feather';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { InertiaLink } from '@inertiajs/inertia-react';


const drawerWidth = 240;

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
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
        top: 64,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

function ResponsiveDrawer(props) {
    const { window } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const items = [
        {
            href: '/app/dashboard',
            Icon: BarChartIcon,
            title: 'Dashboard'
        },
        {
            href: '/app/customers',
            Icon: UsersIcon,
            title: 'Customers'
        },
        {
            href: '/app/products',
            Icon: ShoppingBagIcon,
            title: 'Products'
        },
        {
            href: '/app/account',
            Icon: UserIcon,
            title: 'Account'
        },
        {
            href: '/app/settings',
            Icon: SettingsIcon,
            title: 'Settings'
        },
        {
            href: '/login',
            Icon: LockIcon,
            title: 'Login'
        },
        {
            href: '/register',
            Icon: UserPlusIcon,
            title: 'Register'
        },
        {
            href: '/404',
            Icon: AlertCircleIcon,
            title: 'Error'
        }
    ];
    const [open, setOpen] = React.useState(true);

    const handleClick = () => {
        setOpen(!open);
    };
    const drawer = (
        <div>
            <List
            >
                <InertiaLink href=''>
                    <ListItem button>
                        <ListItemIcon>
                            <BarChartIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                </InertiaLink>
                <ListItem button onClick={handleClick}>
                    <ListItemIcon>
                        <InboxIcon />
                    </ListItemIcon>
                    <ListItemText primary="Ringba" />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open} timeout="auto" unmountOnExit style={{ marginLeft: "25px" }}>
                    <List component="div" disablePadding>
                        <InertiaLink href=''>
                            <ListItem button className={classes.nested}>
                                <ListItemIcon>
                                    <ShoppingBagIcon />
                                </ListItemIcon>
                                <ListItemText primary="Get Ringba Data" />
                            </ListItem>
                        </InertiaLink>
                        <ListItem button className={classes.nested}>
                            <ListItemIcon>
                                <ShoppingBagIcon />
                            </ListItemIcon>
                            <ListItemText primary="Call Logs Report" />
                        </ListItem>
                        <ListItem button className={classes.nested}>
                            <ListItemIcon>
                                <ShoppingBagIcon />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItem>
                    </List>
                </Collapse>

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
