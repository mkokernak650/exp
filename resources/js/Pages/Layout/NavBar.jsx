import React from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import AccountCircle from "@material-ui/icons/AccountCircle";
import NormalModal from "../../Shared/NormalModal";
import {
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
  User as UserIcon,
  Users as UsersIcon,
} from "react-feather";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { InertiaLink } from "@inertiajs/inertia-react";
import { useState } from "react";
import Logo from "../../../images/webform/logo.png";
import MoreIcon from "@material-ui/icons/MoreVert";

const drawerWidth = 280;

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  paper: {
    top: 64,
  },
  root: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    overflow: "hidden",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  menuIcon: {
    minWidth: 30,
  },
  menuText: {
    color: "rgb(69 72 77)",
    "& span, & svg": {
      fontSize: "15px",
    },
    fontWeight: "500!important",
  },
  link: {
    textDecoration: "none",
  },
  nested: {
    marginLeft: "25px",
  },
  item: {
    color: "rgb(107, 119, 140)",
    "& span, & svg": {
      fontSize: "13px",
    },
  },
}));

export default function PersistentDrawerLeft(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [showModal, setShowModal] = useState({ open: false });
  const [values, setValues] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  const openModal = () => {
    setShowModal({ open: true });
  };
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((oldValues) => ({
      ...oldValues,
      [name]: value,
    }));
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={openModal}>Profile</MenuItem>
      <InertiaLink
        method="post"
        href={route("logout")}
        className={classes.link}
        as="div"
      >
        <MenuItem onClick={handleMenuClose}> Logout</MenuItem>
      </InertiaLink>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p onClick={openModal}>Profile</p>
      </MenuItem>
    </Menu>
  );

  const items = [
    {
      id: 1,
      href: "home",
      Icon: <BarChartIcon size="20" />,
      title: "Dashboard",
      active: false,
      collapse: false,
    },
    {
      id: 2,
      Icon: <UsersIcon size="20" />,
      title: "Ringba",
      active: false,
      collapse: true,
      submenu: [
        {
          title: "Get Ringba Data",
          href: "get.ringbadata",
          Icon: <UserIcon />,
        },
        {
          title: "Temp Ringba Data",
          href: "tempringbadata",
          Icon: <UserIcon />,
        },
        {
          title: "Call Logs Report",
          href: "call-logs-report",
          Icon: <UserIcon />,
        },
        {
          title: "Archived Call Logs Report",
          href: "archived-call-log-report",
          Icon: <UserIcon />,
        },
        {
          title: "Pending Call Logs Report",
          href: "pending-call-log-report",
          Icon: <UserIcon />,
        },
        {
          title: "Exceptions",
          href: "get.exceptions",
          Icon: <UserIcon />,
        },
        {
          title: "Billed Call Logs Report",
          href: "billed-call-log-report",
          Icon: <UserIcon />,
        },
      ],
    },

    {
      id: 3,
      Icon: <UsersIcon size="20" />,
      title: "Generate Reports",
      active: false,
      collapse: true,
      submenu: [
        {
          title: "Affiliate",
          href: "generate.report.affiliate",
          Icon: <UserIcon />,
        },
        {
          title: "Target",
          href: "generate.report.target",
          Icon: <UserIcon />,
        },
        {
          title: "Market Exception",
          href: "call-logs-report",
          Icon: <UserIcon />,
        }
      ],
    },
    {
      id: 4,
      Icon: <SettingsIcon size="20" />,
      title: "Settings",
      active: false,
      collapse: true,
      submenu: [
        {
          title: "Add Market Exception",
          href: "market-exception-form",
          // Icon: <UserIcon />,
        },
        {
          title: "Market Exception Report",
          href: "market-exception-report",
          Icon: <UserIcon />,
        },
        {
          title: "Add Customer",
          href: "add.customer",
          Icon: <UserIcon />,
        },
        {
          title: "Customer Report",
          href: "customer-report",
          Icon: <UserIcon />,
        },
        {
          title: "Add Target",
          href: "target.form",
          Icon: <UserIcon />,
        },
        {
          title: "Targets",
          href: "target.report",
          Icon: <UserIcon />,
        },

        {
          title: "New Television By Market Report",
          href: "zipcode.television.market",
          Icon: <UserIcon />,
        },

        {
          title: "Zipcode Database",
          href: "zipcode-data",
          Icon: <UserIcon />,
        },

        {
          title: "Add Broadcast Month",
          href: "add.broadcast.month",
          Icon: <UserIcon />,
        },
        {
          title: "Broadcast Month Report",
          href: "broadcast.month.report",
          Icon: <UserIcon />,
        },
        {
          title: "Add Broadcast Week",
          href: "add.broadcast.week",
          Icon: <UserIcon />,
        },
        {
          title: "Broadcast Week Report",
          href: "broadcast.week.report",
          Icon: <UserIcon />,
        },
      ],
    },
    {
      id: 5,
      href: "webform.reports",
      Icon: <BarChartIcon size="20" />,
      title: "Webform Reports",
      active: false,
      collapse: false,
    },
  ];

  const [active, inActive] = useState({
    id:'',active: false
  });
  const handleClick = (id) => {
    for (let i = 0; i < items.length; i++) {
      if (id === items[i].id) {
        
        // inActive(items[i].id);
        inActive({...active,id:items[i].id,active:!active.active});
      }
    }
  };


  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          {!open ? (
            <div className="logo">
              <img src={Logo} alt="consumer-exp-logo"></img>
            </div>
          ) : (
            ""
          )}
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <div className="logo">
            <img src={Logo} alt="consumer-exp-logo"></img>
          </div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          {items.map((menu) => (
            <div key={menu.id}>
              {menu.collapse ? (
                <InertiaLink
                  href={menu.href ? route(menu.href) : "#"}
                  onClick={() => handleClick(menu.id)}
                  style={{ textDecoration: "none" }}
                  key={menu.id}
                >
                  <ListItem button key={menu.id}>
                    <ListItemIcon className={classes.menuIcon}>
                      {menu.Icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={menu.title}
                      className={classes.menuText}
                    />
                    {active.id === menu.id && active.active ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                </InertiaLink>
              ) : (
                <InertiaLink
                  href={route(menu.href)}
                  style={{ textDecoration: "none" }}
                >
                  <ListItem button>
                    <ListItemIcon className={classes.menuIcon}>
                      {menu.Icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={menu.title}
                      className={classes.menuText}
                    />
                  </ListItem>
                </InertiaLink>
              )}
              {menu.collapse ? (
                <Collapse
                  in={active.id === menu.id && active.active}
                  timeout="auto"
                  unmountOnExit
                  className={`${
                    menu.active ? "sidebar-menu-active" : "sidebar-menu-inactive"
                  }`}
                >
                  <List component="div" disablePadding>
                    {menu.submenu.map((submenu) => (
                      <InertiaLink
                        href={route(submenu.href)}
                        style={{ textDecoration: "none" }}
                        key={submenu.title}
                      >
                        <ListItem
                          button
                          className={classes.nested}
                          key={submenu.id}
                        >
                          <ListItemIcon className={classes.menuIcon}>
                            <ShoppingBagIcon size="15" />
                          </ListItemIcon>
                          <ListItemText
                            primary={submenu.title}
                            className={classes.item}
                          />
                        </ListItem>
                      </InertiaLink>
                    ))}
                  </List>
                </Collapse>
              ) : (
                ""
              )}
            </div>
          ))}
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {props.main}
      </main>

      <NormalModal
        open={showModal.open}
        setOpen={setShowModal}
        width={"600px"}
        title={"My Profile"}
      >
        <div className="myprofile">
          <form className={classes.form}>
            <span>First Name:</span>
            <TextField
              fullWidth
              margin="normal"
              name="firstname"
              type="text"
              variant="outlined"
              required="true"
              onChange={handleChange}
            />
            <span>Last Name:</span>
            <TextField
              fullWidth
              margin="normal"
              name="lastname"
              type="text"
              variant="outlined"
              required="true"
              onChange={handleChange}
            />
            <span>Email:</span>
            <TextField
              fullWidth
              margin="normal"
              name="email"
              type="email"
              variant="outlined"
              required="true"
              onChange={handleChange}
            />
          </form>
        </div>
      </NormalModal>
    </div>
  );
}
