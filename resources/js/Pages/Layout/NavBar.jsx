import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import StoreIcon from '@material-ui/icons/Store';
import DialpadIcon from '@material-ui/icons/Dialpad';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleIcon from '@material-ui/icons/People';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { User as UserIcon, Minus as MinusIcon } from 'react-feather';
import { CalendarToday, ExpandLess, ExpandMore, History, Language, Storage ,GroupAddOutlined} from '@material-ui/icons';
import { InertiaLink } from '@inertiajs/inertia-react';
import { useState } from 'react';
import Logo from '../../../images/webform/logo.png';
import MoreIcon from '@material-ui/icons/MoreVert';

const drawerWidth = 280;

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  paper: {
    top: 64,
  },
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    overflow: 'auto',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  menuIcon: {
    minWidth: 30,
  },
  menuText: {
    color: 'rgb(69 72 77)',
    '& span, & svg': {
      fontSize: '15px',
    },
    fontWeight: '500!important',
  },
  link: {
    textDecoration: 'none',
  },
  nested: {
    paddingLeft: '25px',
    backgroundColor: '#f9f9f9',
  },
  item: {
    color: 'rgb(107, 119, 140)',
    '& span, & svg': {
      fontSize: '13px',
    },
  },
}));

export default function PersistentDrawerLeft(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true });
  };

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false });
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <InertiaLink href={route('user.profile.index')} className={classes.link} as="div">
        <MenuItem onClick={handleMenuClose}> My Profile</MenuItem>
      </InertiaLink>
      <InertiaLink method="post" href={route('logout')} className={classes.link} as="div">
        <MenuItem onClick={handleMenuClose}> Logout</MenuItem>
      </InertiaLink>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';

  const items = [
    {
      id: 2,
      Icon: <Language  size="20" />,
      title: 'Ringba',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Get Ringba Data',
          href: 'get.ringba.data.form',
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
        },
        {
          title: 'Exceptions',
          href: 'get.exceptions',
          Icon: <UserIcon />,
        },
        {
          title: 'Billed Call Logs Report',
          href: 'billed-call-log-report',
          Icon: <UserIcon />,
        },
      ],
    },

    {
      id: 3,
      Icon: <LibraryBooksIcon size="20" />,
      title: 'Generate Reports',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Pay Per Call-Affiliate',
          href: 'generate.report.affiliate',
          Icon: <UserIcon />,
        },
        {
          title: 'Pay Per Call-Customer',
          href: 'generate.report.target',
          Icon: <UserIcon />,
        },
        {
          title: 'Pay Per Call-Exceptions',
          href: 'generate.report.market.exception',
          Icon: <UserIcon />,
        },
        {
          title: 'Pay Per Call-Summary',
          href: 'generate.report.destination',
          Icon: <UserIcon />,
        },
        {
          title: 'Pay Per Call-Length',
          href: 'generate.report.call.length',
          Icon: <UserIcon />,
        },
        {
          title: 'Pay Per Call-Homes per call',
          href: 'generate.report.market.target',
          Icon: <UserIcon />,
        },
        {
          title: 'Phone and Coupon Codes',
          href: 'ecommerce.report',
          Icon: <UserIcon />,
        },
      ],
    },
    {
      id: 4,
      Icon: <DialpadIcon size="20" />,
      title: 'Pay Per Call Setup',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Campaign List',
          href: 'campaign.setting.report',
          Icon: <UserIcon />,
        },
        {
          title: 'Set Duration',
          href: 'campaign.setting.form',
          Icon: <UserIcon />,
        },
        {
          title: 'Create Annotations',
          href: 'annotation.create',
          Icon: <UserIcon />,
        },
        {
          title: 'Add Exceptions',
          href: 'market.exception.form',
          Icon: <UserIcon />,
        },
        {
          title: 'Market Exception Report',
          href: 'market.exception.report',
          Icon: <UserIcon />,
        },
        {
          id: 7,
          Icon: <SettingsIcon size="20" />,
          title: 'Targets',
          active: false,
          collapse: true,
          name: 'sub-child',
          submenu: [
            {
              title: 'Add Target',
              href: 'target.form',
              Icon: <UserIcon />,
            },
            {
              title: 'Targets',
              href: 'target.report',
              Icon: <UserIcon />,
            },
            {
              title: 'Target Names',
              href: 'target_names.report',
              Icon: <UserIcon />,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      Icon: <StoreIcon size="20" />,
      title: 'Phone and Coupon Codes',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Create Campaign',
          href: 'ecommerce-campaigns.create',
          Icon: <UserIcon />,
        },
        {
          title: 'All Campaigns',
          href: 'ecommerce-campaigns.index',
          Icon: <UserIcon />,
        },
        {
          title: 'Create Phone or Code',
          href: 'ecommerce-affiliates.create',
          Icon: <UserIcon />,
        },
        {
          title: 'All Phone and Codes',
          href: 'ecommerce-affiliates.index',
          Icon: <UserIcon />,
        },
        {
          title: 'Import Sales Report',
          href: 'ecommerce-sales.import',
          Icon: <UserIcon />,
        },
        {
          title: 'Historical sales',
          href: 'ecommerce-sales.index',
          Icon: <UserIcon />,
        },
        {
          title: 'Custom Email',
          href: 'custom.email',
          // Icon: <UserIcon />,
        },
      ],
    },
    {
      id: 6,
      Icon: <SettingsIcon size="20" />,
      title: 'Affiliates',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Add Affiliate',
          href: 'add.affiliate',
          Icon: <UserIcon />,
        },
        {
          title: 'Affiliate Report',
          href: 'affiliate.report',
          Icon: <UserIcon />,
        },
        {
          title: 'Archived Affiliates',
          href: 'archived.affiliates',
          Icon: <UserIcon />,
        },
      ],
    },
    {
      id: 8,
      Icon: <PeopleIcon size="20" />,
      title: 'Customers',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Add Customer',
          href: 'add.customer',
          Icon: <UserIcon />,
        },
        {
          title: 'Customer Report',
          href: 'customer.report',
          Icon: <UserIcon />,
        },
        {
          title: 'Archived Customers',
          href: 'archived.customers',
          Icon: <UserIcon />,
        },
      ],
    },
    {
      id: 9,
      Icon: <Storage size="20" />,
      title: 'Database',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'TV Markets By Zip Codes',
          href: 'zipcode.television.market',
          Icon: <UserIcon />,
        },
        {
          title: 'Telephone and Zip Codes',
          href: 'zipcode.data',
          Icon: <UserIcon />,
        },
        {
          title: 'Add TV Households',
          href: 'add.tv.households',
          Icon: <UserIcon />,
        },
        {
          title: 'TV Households Report',
          href: 'tv.households.report',
          Icon: <UserIcon />,
        },
      ],
    },
    {
      id: 10,
      Icon: <CalendarToday size="20" />,
      title: 'Calendar',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Add Broadcast Month',
          href: 'add.broadcast.month',
          Icon: <UserIcon />,
        },
        {
          title: 'Broadcast Month Report',
          href: 'broadcast.month.report',
          Icon: <UserIcon />,
        },
        {
          title: 'Add Broadcast Week',
          href: 'add.broadcast.week',
          Icon: <UserIcon />,
        },
        {
          title: 'Broadcast Week Report',
          href: 'broadcast.week.report',
          Icon: <UserIcon />,
        },
      ],
    },
    {
      id: 11,
      href: 'webform.reports',
      Icon: <AssessmentIcon size="20" />,
      title: 'Webform Reports',
      active: false,
      collapse: false,
    },
    {
      id: 12,
      href: 'activity.log',
      Icon: <History size="20" />,
      title: 'Activity Log',
      active: false,
      collapse: false,
    },

    {
      id: 13,
      Icon: <GroupAddOutlined size="20" />,
      title: 'Users',
      active: false,
      collapse: true,
      submenu: [
        {
          title: 'Add User',
          href: 'user.create',
          Icon: <UserIcon />,
        },
        {
          title: 'Show User',
          href: 'user.index',
          Icon: <UserIcon />,
        }
      ],
    },
  ];

  const [activeItems, setActiveItems] = useState({
    id: '',
    active: false,
    submenu: {
      id: '',
      active: false,
    },
  });

  const handleClick = (id, type) => {
    items.forEach((item) => {
      if (type === 'parent') {
        if (item.id === id && activeItems.id === id && activeItems.active) {
          let tmpActiveItems = { ...activeItems };
          tmpActiveItems.id = item.id;
          tmpActiveItems.active = false;
          item.submenu.forEach((child) => {
            if (child?.name) {
              if (child.id === activeItems.submenu.id && activeItems.submenu.active) {
                tmpActiveItems.submenu.id = child.id;
                tmpActiveItems.submenu.active = false;
              }
            }
          });
          setActiveItems(tmpActiveItems);
        } else if (item.id === id) {
          let tmpActiveItems = { ...activeItems };
          tmpActiveItems.id = item.id;
          tmpActiveItems.active = true;
          setActiveItems(tmpActiveItems);
        }
      } else {
        item?.submenu?.forEach((child) => {
          if (child?.name) {
            if (child.id === activeItems.submenu.id && activeItems.submenu.active) {
              let tmpActiveItems = { ...activeItems };
              tmpActiveItems.submenu.id = child.id;
              tmpActiveItems.submenu.active = false;
              setActiveItems(tmpActiveItems);
            } else if (child.id === id) {
              let tmpActiveItems = { ...activeItems };
              tmpActiveItems.submenu.id = child.id;
              tmpActiveItems.submenu.active = true;
              setActiveItems(tmpActiveItems);
            }
          }
        });
      }
    });
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
            ''
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
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

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
            <InertiaLink href="/home">
              <img src={Logo} alt="consumer-exp-logo"></img>
            </InertiaLink>
          </div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {items.map((menu) => {
            return (
              <div key={menu.id}>
                {menu.collapse ? (
                  <ListItem button onClick={() => handleClick(menu.id, 'parent')} key={menu.id}>
                    <ListItemIcon className={classes.menuIcon}>{menu.Icon}</ListItemIcon>
                    <ListItemText primary={menu.title} className={classes.menuText} />
                    {activeItems.id === menu.id && activeItems.active ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItem>
                ) : (
                  <InertiaLink href={route(menu.href)} style={{ textDecoration: 'none' }}>
                    <ListItem button>
                      <ListItemIcon className={classes.menuIcon}>{menu.Icon}</ListItemIcon>
                      <ListItemText primary={menu.title} className={classes.menuText} />
                    </ListItem>
                  </InertiaLink>
                )}

                {menu.collapse && (
                  <Collapse
                    in={activeItems.id === menu.id && activeItems.active}
                    timeout="auto"
                    unmountOnExit
                    style={{ overflow: 'hidden' }}
                  >
                    <List component="div" disablePadding>
                      {menu.submenu.map((submenu) => {
                        if (submenu?.name) {
                          return (
                            <List component="div" disablePadding>
                              <ListItem
                                button
                                onClick={() => handleClick(submenu.id, 'child')}
                                key={submenu.id}
                                style={{ paddingLeft: '22px' }}
                              >
                                <ListItemIcon className={classes.menuIcon}>
                                  {submenu.Icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={submenu.title}
                                  className={classes.menuText}
                                />
                                {activeItems?.submenu?.id === submenu?.id &&
                                activeItems?.submenu?.active ? (
                                  <ExpandLess />
                                ) : (
                                  <ExpandMore />
                                )}
                              </ListItem>
                              <Collapse
                                in={
                                  activeItems?.submenu?.id === submenu?.id &&
                                  activeItems?.submenu?.active
                                }
                                timeout="auto"
                                unmountOnExit
                                style={{ overflow: 'hidden' }}
                              >
                                {submenu.submenu.map((child) => {
                                  return (
                                    <List component="div" disablePadding>
                                      <InertiaLink
                                        href={route(child.href)}
                                        style={{ textDecoration: 'none' }}
                                        key={child.title}
                                      >
                                        <ListItem
                                          button
                                          key={submenu?.id}
                                          className={classes.nested}
                                        >
                                          <ListItemIcon className={classes.menuIcon}>
                                            <MinusIcon size="15" />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={child.title}
                                            className={classes.item}
                                          />
                                        </ListItem>
                                      </InertiaLink>
                                    </List>
                                  );
                                })}
                              </Collapse>
                            </List>
                          );
                        } else {
                          return (
                            <InertiaLink
                              href={route(submenu.href)}
                              style={{ textDecoration: 'none' }}
                              key={submenu.title}
                            >
                              <ListItem button className={classes.nested} key={submenu.id}>
                                <ListItemIcon className={classes.menuIcon}>
                                  <MinusIcon size="15" />
                                </ListItemIcon>
                                <ListItemText primary={submenu.title} className={classes.item} />
                              </ListItem>
                            </InertiaLink>
                          );
                        }
                      })}
                    </List>
                  </Collapse>
                )}
              </div>
            );
          })}
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

    </div>
  );
}
