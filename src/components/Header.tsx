import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Link,
  styled,
  Typography,
} from '@mui/material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1976d2',
  boxShadow: 'none',
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  marginRight: theme.spacing(4),
  fontSize: '0.9rem',
  fontWeight: 500,
  opacity: 0.9,
  '&:hover': {
    opacity: 1,
    color: 'white',
  },
}));

const Logo = styled(Typography)({
  color: 'white',
  fontWeight: 600,
  fontSize: '1.5rem',
  textDecoration: 'none',
});

const Header = () => {
  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <Logo variant="h6">
            AutoDraft
          </Logo>
        </RouterLink>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 4 }}>
          <NavLink component={RouterLink} to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink component={RouterLink} to="/grants">
            Grants
          </NavLink>
          <NavLink component={RouterLink} to="/applications">
            Applications
          </NavLink>
          <NavLink component={RouterLink} to="/analytics">
            Analytics
          </NavLink>
        </Box>
        <Box>
          <Button
            component={RouterLink}
            to="/login"
            sx={{ 
              mr: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Sign up
          </Button>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header; 