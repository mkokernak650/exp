import React from "react";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import {
    makeStyles,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Hidden,
    MenuItem,
    Menu,
    TextField,
} from "@material-ui/core";
import MoreIcon from "@material-ui/icons/MoreVert";
import { InertiaLink } from "@inertiajs/inertia-react";
import NormalModal from "../../Shared/NormalModal";
import { usePage } from "@inertiajs/inertia-react";

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
    link: {
        textDecoration: "none",
        color: "black",
    },
}));

export default function PrimarySearchAppBar({ onMobileNavOpen }) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [showModal, setShowModal] = React.useState({ open: false });
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [values, setValues] = React.useState();
    const { auth } = usePage().props;
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((oldValues) => ({
            ...oldValues,
            [name]: value,
        }));

    };

    const handleSubmit = (e) => {
        e.preventDefault();
        cosnole.log(values);
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

    return (
        <div className={classes.grow}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography className={classes.title} variant="h6" noWrap>
                        Consumerexp
                    </Typography>

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

                    <Hidden smUp>
                        <IconButton color="inherit" onClick={onMobileNavOpen}>
                            <MenuIcon  />
                        </IconButton>
                    </Hidden>
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}

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
