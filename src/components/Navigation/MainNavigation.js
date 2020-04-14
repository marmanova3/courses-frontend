import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'reactstrap';
import { connect } from 'react-redux';
import GlobalMenu from './types/GlobalMenu';
import AuthOnlyMenu from './types/AuthOnlyMenu';
import UserDropdown from './types/UserDropdown';
import NotLoggedOnly from './types/VisitorOnlyMenu';

import './assets/Navigation.scss';
import logo from './assets/logo.svg';

// eslint-disable-next-line react/prefer-stateless-function
class MainNavigation extends Component {
  render() {
    const authenticated = this.props.authReducer._token !== null;
    const current = this.props.navReducer.current.main;
    return (
      <Navbar expand="md" className="main-nav">
        <Link className="navbar-brand" to="/dashboard">
          <img src={logo} alt="logo" /> MATFYZ.sk
        </Link>
        <Nav navbar>
          {!authenticated ? <NotLoggedOnly current={current} /> : null}
          {authenticated ? <AuthOnlyMenu current={current} /> : null}
          <GlobalMenu current={current} />
        </Nav>
        {authenticated ? (
          <Nav className="ml-auto" navbar>
            <UserDropdown
              name={this.props.authReducer.user.name}
              avatar={this.props.authReducer.user.avatar}
            />
          </Nav>
        ) : null}
      </Navbar>
    );
  }
}

const mapStateToProps = state => {
  return state;
};

export default connect(mapStateToProps)(MainNavigation);