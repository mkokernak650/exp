import React from "react";
import PropTypes from "prop-types";
import {
  CssBaseline,
  Drawer,
  Hidden,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Button,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
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

// const [drawerWidth,setdrawerWidth] = useState(240);
let drawerWidth = 240;


const useStyles = makeStyles((theme) => ({
  paper: {
    top: 64,
  },
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
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
    color: "rgb(69 72 77)",
    "& span, & svg": {
      fontSize: "15px",
    },
    fontWeight: "bold!important",
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
      Icon: <SettingsIcon size="20" />,
      title: "Settings",
      active: false,
      collapse: true,
      submenu: [
        {
          title: "Add Market Exception",
          href: "market-exception-form",
          Icon: <UserIcon />,
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
          title: "Targets",
          href: "target",
          Icon: <UserIcon />,
        },
        // {
        //   title: "Television By Market Report",
        //   href: "zipcode.television.market",
        //   Icon: <UserIcon />,
        // },
        {
          title: "New Television By Market Report",
          href: "zipcode.television.market",
          Icon: <UserIcon />,
        },
        // {
        //   title: "Zip Code",
        //   href: "zipcode-data",
        //   Icon: <UserIcon />,
        // },
        {
          title: "Zipcode Database",
          href: "zipcode-data",
          Icon: <UserIcon />,
        },
        // {
        //   title: "Add Market",
        //   href: "add-market",
        //   Icon: <UserIcon />,
        // },
        // {
        //   title: "Markets",
        //   href: "market-report",
        //   Icon: <UserIcon />,
        // },
      ],
    },
    {
      id: 4,
      href: "webform.reports",
      Icon: <BarChartIcon size="20" />,
      title: "Webform Reports",
      active: false,
      collapse: false,
    },
  ];
  let [active, inActive] = useState();
  const handleClick = (id) => {
    for (let i = 0; i < items.length; i++) {
      if (id === items[i].id) {
        inActive(items[i].id);
      }
    }
  };
  const [activeSidebar, setActiveSidebar] = useState(true);
  const handleSidebar = () => {
    setActiveSidebar(false);
  };

  const drawer = (
    <div>
      {/* <Button color="primary" variant="contained" onClick={handleDrawerToggle}>
        Collapse
      </Button> */}
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
                  {active === menu.id ? <ExpandLess /> : <ExpandMore />}
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
                in={active === menu.id}
                timeout="auto"
                unmountOnExit
                className={`${
                  menu.active ? "classes.active" : "classes.inActive"
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
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
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
        </Hidden> */}
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            // onClose={handleDrawerToggle}
            // open={mobileOpen}
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










// import React from "react";
// import clsx from "clsx";
// import { makeStyles, useTheme } from "@material-ui/core/styles";
// import Drawer from "@material-ui/core/Drawer";
// import CssBaseline from "@material-ui/core/CssBaseline";
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import List from "@material-ui/core/List";
// import Typography from "@material-ui/core/Typography";
// import Divider from "@material-ui/core/Divider";
// import IconButton from "@material-ui/core/IconButton";
// import MenuIcon from "@material-ui/icons/Menu";
// import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
// import ChevronRightIcon from "@material-ui/icons/ChevronRight";
// import ListItem from "@material-ui/core/ListItem";
// import ListItemIcon from "@material-ui/core/ListItemIcon";
// import ListItemText from "@material-ui/core/Collapse";
// import Collapse from "@material-ui/core/ListItemText";
// import Navbar from "../Layout/Navbar";
// import {
//   BarChart as BarChartIcon,
//   Settings as SettingsIcon,
//   ShoppingBag as ShoppingBagIcon,
//   User as UserIcon,
//   Users as UsersIcon,
// } from "react-feather";
// import { InertiaLink } from "@inertiajs/inertia-react";
// import { useState } from "react";
// import { ExpandLess, ExpandMore } from "@material-ui/icons";

// const drawerWidth = 240;

// const useStyles = makeStyles((theme) => ({
//   root: {
//     display: "flex",
//   },
//   appBar: {
//     transition: theme.transitions.create(["margin", "width"], {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//   },
//   appBarShift: {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginLeft: drawerWidth,
//     transition: theme.transitions.create(["margin", "width"], {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   },
//   menuButton: {
//     marginRight: theme.spacing(2),
//   },
//   hide: {
//     display: "none",
//   },
//   drawer: {
//     width: drawerWidth,
//     flexShrink: 0,
//   },
//   drawerPaper: {
//     width: drawerWidth,
//   },
//   drawerHeader: {
//     display: "flex",
//     alignItems: "center",
//     padding: theme.spacing(0, 1),
//     // necessary for content to be below app bar
//     ...theme.mixins.toolbar,
//     justifyContent: "flex-end",
//   },
//   content: {
//     flexGrow: 1,
//     padding: theme.spacing(3),
//     transition: theme.transitions.create("margin", {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//     marginLeft: -drawerWidth,
//   },
//   contentShift: {
//     transition: theme.transitions.create("margin", {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//     marginLeft: 0,
//   },
// }));

// function PersistentDrawerLeft() {
//   const classes = useStyles();
//   const theme = useTheme();
//   const [open, setOpen] = React.useState(false);

//   const handleDrawerOpen = () => {
//     setOpen(true);
//   };

//   const handleDrawerClose = () => {
//     setOpen(false);
//   };

//   const items = [
//         {
//           id: 1,
//           href: "home",
//           Icon: <BarChartIcon size="20" />,
//           title: "Dashboard",
//           active: false,
//           collapse: false,
//         },
//         {
//           id: 2,
//           Icon: <UsersIcon size="20" />,
//           title: "Ringba",
//           active: false,
//           collapse: true,
//           submenu: [
//             {
//               title: "Get Ringba Data",
//               href: "get.ringbadata",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Temp Ringba Data",
//               href: "tempringbadata",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Call Logs Report",
//               href: "call-logs-report",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Archived Call Logs Report",
//               href: "archived-call-log-report",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Pending Call Logs Report",
//               href: "pending-call-log-report",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Exceptions",
//               href: "get.exceptions",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Billed Call Logs Report",
//               href: "billed-call-log-report",
//               Icon: <UserIcon />,
//             },
//           ],
//         },
//         {
//           id: 3,
//           Icon: <SettingsIcon size="20" />,
//           title: "Settings",
//           active: false,
//           collapse: true,
//           submenu: [
//             {
//               title: "Add Market Exception",
//               href: "market-exception-form",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Market Exception Report",
//               href: "market-exception-report",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Add Customer",
//               href: "add.customer",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Customer Report",
//               href: "customer-report",
//               Icon: <UserIcon />,
//             },
//             {
//               title: "Targets",
//               href: "target",
//               Icon: <UserIcon />,
//             },
//             // {
//             //   title: "Television By Market Report",
//             //   href: "zipcode.television.market",
//             //   Icon: <UserIcon />,
//             // },
//             {
//               title: "New Television By Market Report",
//               href: "zipcode.television.market",
//               Icon: <UserIcon />,
//             },
//             // {
//             //   title: "Zip Code",
//             //   href: "zipcode-data",
//             //   Icon: <UserIcon />,
//             // },
//             {
//               title: "Zipcode Database",
//               href: "zipcode-data",
//               Icon: <UserIcon />,
//             },
//             // {
//             //   title: "Add Market",
//             //   href: "add-market",
//             //   Icon: <UserIcon />,
//             // },
//             // {
//             //   title: "Markets",
//             //   href: "market-report",
//             //   Icon: <UserIcon />,
//             // },
//           ],
//         },
//         {
//           id: 4,
//           href: "webform.reports",
//           Icon: <BarChartIcon size="20" />,
//           title: "Webform Reports",
//           active: false,
//           collapse: false,
//         },
//       ];
//   let [active, inActive] = useState();
//   const handleClick = (id) => {
//     for (let i = 0; i < items.length; i++) {
//       if (id === items[i].id) {
//         inActive(items[i].id);
//       }
//     }
//   };

//   return (
//     <div className={classes.root}>
//       <CssBaseline />
//       <Navbar>
//         <Toolbar>
//           <IconButton
//             color="inherit"
//             aria-label="open drawer"
//             onClick={handleDrawerOpen}
//             edge="start"
//             className={clsx(classes.menuButton, open && classes.hide)}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" noWrap>
//             ConsumerEXP
//           </Typography>
//         </Toolbar>
//       </Navbar>
//       <Drawer
//         className={classes.drawer}
//         variant="persistent"
//         anchor="left"
//         open={open}
//         classes={{
//           paper: classes.drawerPaper,
//         }}
//       >
//         <div className={classes.drawerHeader}>
//           <IconButton onClick={handleDrawerClose}>
//             {theme.direction === "ltr" ? (
//               <ChevronLeftIcon />
//             ) : (
//               <ChevronRightIcon />
//             )}
//           </IconButton>
//         </div>
//         <Divider />
//         <List>
//           {items.map((menu) => (
//             <div key={menu.id}>
//               {menu.collapse ? (
//                 <InertiaLink
//                   href={menu.href ? route(menu.href) : "#"}
//                   onClick={() => handleClick(menu.id)}
//                   style={{ textDecoration: "none" }}
//                   key={menu.id}
//                 >
//                   <ListItem button key={menu.id}>
//                     <ListItemIcon className={classes.menuIcon}>
//                       {menu.Icon}
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={menu.title}
//                       className={classes.menuText}
//                     />
//                     {active === menu.id ? <ExpandLess /> : <ExpandMore />}
//                   </ListItem>
//                 </InertiaLink>
//               ) : (
//                 <InertiaLink
//                   href={route(menu.href)}
//                   style={{ textDecoration: "none" }}
//                 >
//                   <ListItem button>
//                     <ListItemIcon className={classes.menuIcon}>
//                       {menu.Icon}
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={menu.title}
//                       className={classes.menuText}
//                     />
//                   </ListItem>
//                 </InertiaLink>
//               )}
//               {menu.collapse ? (
//                 <Collapse
//                   in={active === menu.id}
//                   timeout="auto"
//                   unmountOnExit
//                   className={`${
//                     menu.active ? "classes.active" : "classes.inActive"
//                   }`}
//                 >
//                   <List component="div" disablePadding>
//                     {menu.submenu.map((submenu) => (
//                       <InertiaLink
//                         href={route(submenu.href)}
//                         style={{ textDecoration: "none" }}
//                         key={submenu.title}
//                       >
//                         <ListItem
//                           button
//                           className={classes.nested}
//                           key={submenu.id}
//                         >
//                           <ListItemIcon className={classes.menuIcon}>
//                             <ShoppingBagIcon size="15" />
//                           </ListItemIcon>
//                           <ListItemText
//                             primary={submenu.title}
//                             className={classes.item}
//                           />
//                         </ListItem>
//                       </InertiaLink>
//                     ))}
//                   </List>
//                 </Collapse>
//               ) : (
//                 ""
//               )}
//             </div>
//           ))}
//         </List>
//       </Drawer>
//       <main
//         className={clsx(classes.content, {
//           [classes.contentShift]: open,
//         })}
//       >
//         <div className={classes.drawerHeader} />
//         <Typography paragraph>
//           Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//           eiusmod tempor incididunt ut labore et dolore magna aliqua. Rhoncus
//           dolor purus non enim praesent elementum facilisis leo vel. Risus at
//           ultrices mi tempus imperdiet. Semper risus in hendrerit gravida rutrum
//           quisque non tellus. Convallis convallis tellus id interdum velit
//           laoreet id donec ultrices. Odio morbi quis commodo odio aenean sed
//           adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies
//           integer quis. Cursus euismod quis viverra nibh cras. Metus vulputate
//           eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo
//           quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat
//           vivamus at augue. At augue eget arcu dictum varius duis at consectetur
//           lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa sapien
//           faucibus et molestie ac.
//         </Typography>
//         <Typography paragraph>
//           Consequat mauris nunc congue nisi vitae suscipit. Fringilla est
//           ullamcorper eget nulla facilisi etiam dignissim diam. Pulvinar
//           elementum integer enim neque volutpat ac tincidunt. Ornare suspendisse
//           sed nisi lacus sed viverra tellus. Purus sit amet volutpat consequat
//           mauris. Elementum eu facilisis sed odio morbi. Euismod lacinia at quis
//           risus sed vulputate odio. Morbi tincidunt ornare massa eget egestas
//           purus viverra accumsan in. In hendrerit gravida rutrum quisque non
//           tellus orci ac. Pellentesque nec nam aliquam sem et tortor. Habitant
//           morbi tristique senectus et. Adipiscing elit duis tristique
//           sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
//           eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
//           posuere sollicitudin aliquam ultrices sagittis orci a.
//         </Typography>
//       </main>
//     </div>
//   );
// }

// export default PersistentDrawerLeft;
