import { useState, useReducer, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, NavLink, Switch, Route } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Cookies from 'universal-cookie';
import jwt_decode from 'jwt-decode';
import 'moment/locale/fi';

//https://github.com/gglukmann/cra-sw/blob/master/src/App.js
import { useSelector } from 'react-redux';
import { SW_INIT, SW_UPDATE } from '../types';
import Alert from './Alert';

// SERVICES
import plateService from '../services/plateService';
import setAuthToken from '../utils/setAuthToken';
import isEmpty from '../utils/is-empty';
import { history } from '../utils/history'

import Car from './Car';
import Car404 from './Car404';
import Search from './Search';
import Body from './Body';
import Howto from './Howto';
import About from './About';
import Changepw from './Changepw';
import Forgotpw from './Forgotpw';
import ConfirmEmail from './ConfirmEmail';
import Feedback from './Feedback';
import Privacy from './Privacy';
import Register from './Register';
import Login from './Login';

//use lazy loading to split upp the chucks smaller, these will anyway use backend to fetch api
const Messages = lazy(() => import('./Messages'/* webpackChunkName: "Messages" */));
const Me = lazy(() => import('./Me'/* webpackChunkName: "Me" */));
const renderLoader = () => <p>Loading ...</p>;

const initialState = {
  loading: true,
  car: [],
  token: '',
  user: {},
  userInfo: {},
  errorMessage: null,
  isAuthenticated: false
};

const cookies = new Cookies();

let searchValueCopy;
let userInfo;

const reducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH_CAR_REQUEST':
      return {
        ...state,
        loading: true,
        errorMessage: null
      };
    case 'SEARCH_CAR_SUCCESS':
      return {
        ...state,
        loading: false,
        car: action.payload
      };
    case 'SEARCH_CAR_FAILURE':
      return {
        ...state,
        loading: false,
        errorMessage: action.error
      };
    case 'LOGIN_REQUEST':
      return {
          ...state,
          loggingIn: true,
          user: action.payload
        };
    case 'LOGIN_SUCCESS':
      return {
          ...state,
          loggedIn: true,
          user: action.payload
        };
    case 'LOGIN_FAILURE':
      return {};
    case 'SIGNUP_REQUEST':
      return {
          ...state,
          loggingIn: true,
          user: action.payload
        };
    case 'SIGNUP_SUCCESS':
      return {
          ...state,
          loggedIn: true,
          user: action.payload
        };
    case 'SIGNUP_FAILURE':
      return {};
    case 'GET_ERRORS':
        return action.payload;
    case 'SET_CURRENT_USER':
        return {
            ...state,
            isAuthenticated: !isEmpty(action.payload),
            user: action.payload
        };
    case 'SET_LOGOUT_USER':
      return {
          ...state,
          isAuthenticated: false,
          car: null
      };
    case 'SET_GETUSERINFO':
      return {
          ...state,
          userInfo: action.payload
      };
          
    default:
      return state;
  }
};

function App() {

  const [state, dispatch] = useReducer(reducer, initialState);

  const { car, errorMessage, loading } = state;
  const { user, loggingIn, isAuthenticated } = state;
  //dropdown nav links autoHide
  const [expanded, setExpanded] = useState(false);
  const cookieTTL = process.env.REACT_APP_COOKIE_TTL
  const cookieName = process.env.REACT_APP_COOKIE_NAME

  const isServiceWorkerInitialized = useSelector(
    state => state.serviceWorkerInitialized,
  );
  const isServiceWorkerUpdated = useSelector(
    state => state.serviceWorkerUpdated,
  );
  const serviceWorkerRegistration = useSelector(
    state => state.serviceWorkerRegistration,
  );

  const updateServiceWorker = () => {
    const registrationWaiting = serviceWorkerRegistration.waiting;

    if (registrationWaiting) {
      registrationWaiting.postMessage({ type: 'SKIP_WAITING' });

      registrationWaiting.addEventListener('statechange', e => {
        if (e.target.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  const setPipari = (token) => {
    
    if(token) {
      let d = new Date();
      
      d.setTime(d.getTime() + (cookieTTL* 1000));

      cookies.set(cookieName, token, { path: '/', expires: d });
      //httpOnly: false, as we need to show user info based on the cookie, the token is encrypted anyway inside the cookie
      //this can be set on prod secure: true

      setAuthToken(token);
    } else {
      //remove auth token
      setAuthToken();
      //clear cookie
      cookies.remove(cookieName, token, { path: '/',});
    }
  };

  //THIS IS TO SET THE NAVBAR USER LOGGED IN IF USER HAS COOKIE AND COMES BACK TO THE SITE
      if (cookies.get(cookieName) && !isAuthenticated) {
        const currentTime = Date.now() / 1000;
        const decoded = jwt_decode(cookies.get(cookieName));
        setAuthToken(cookies.get(cookieName));
        //isAuthenticated = true;
        dispatch({
          type: 'SET_CURRENT_USER',
          payload: decoded
        });

        if ( (decoded.exp < currentTime)) {
          // Logout user
          console.error('TOKEN expired');
          setPipari();
          
          history.push('/signin');
          // clear current user
          dispatch({
            type: 'SET_LOGOUT_USER',
          });
          
        }
  
     
      if(!cookies.get(cookieName) && isAuthenticated) {
        //user not logged initialState
        console.log('no cookie, set user as logget out');
        dispatch({
          type: 'SET_LOGOUT_USER'
        });
        // todo: show message that session expired
      }
    }

  //set cookies when loading app fist time if there is one
  if(cookies.get(cookieName)) {
    setPipari(cookies.get(cookieName));
    
    }
  const getplates = async () => {
    const res = await plateService.getAll();
    return res;
  }

  const getPlate = async (plate) => {
    let res = await plateService.getPlate(plate);
    return res;
  }

  // will search the plate number from ui
  const search = async searchValue => {
    dispatch({
      type: 'SEARCH_CAR_REQUEST'
    });

    searchValueCopy = searchValue;
    let res = await plateService.getPlate(searchValue);
    if(res) {
      dispatch({
        type: 'SEARCH_CAR_SUCCESS',
        payload: res
      });
    } else {
      dispatch({
        type: 'SEARCH_CAR_FAILURE',
        error: res.error
    });
    }

    };

    const login = async token => {
  
      dispatch({
        type: 'LOGIN_REQUEST',
      });

        
        setPipari(token);
        const decoded = jwt_decode(token);
        dispatch({
          type: 'SET_CURRENT_USER',
          payload: decoded
        });

  };
  
  const updateUser = async user => {
    setAuthToken(user.token);
    setPipari(user.token);
    const decoded = jwt_decode(user.token);

    dispatch({
      type: 'SET_CURRENT_USER',
      payload: decoded
    });

  }

  const register = async token => {

    dispatch({
      type: 'SIGNUP_REQUEST',
    });
  
      setPipari(token);
      const decoded = jwt_decode(token);

      dispatch({
        type: 'SET_CURRENT_USER',
        payload: decoded
      });

  }

  const userInfo = async userInfo => {
    
    if(isAuthenticated) {
      console.log('userInfo:isAuthenticated');
    }  

    return (
      <Me key={userInfo} userInfo={userInfo} />
    );
};

  const renderUserInfo = me => {

    if(isAuthenticated) {
      return (
        <Me key={`${me.name}`} me={me} />
      );
    } else {
      console.log('Not found or not logged in');
      return (
        login()
      );
    }
  };
  

  const renderSearchResult = (car, props) => {

    if(!car) {
      return;
    }
    if(car.plate) {
      return (
        <Car key={`${car.plate}`} car={car} props={props} isAuthenticated={isAuthenticated} />
      );
    } else {
      return (
        <Car404 key={searchValueCopy} searchValueCopy={searchValueCopy} />
      );
    }
  };
  

  let authLinks;
  const dropDown = (
    <NavDropdown alignRight title='Lisää' id='basic-nav-dropdown' className='custom_nav_link'>
      {/* todo: show text if user has logged in */}
      {/* <NavDropdown.Item as={NavLink} to='/signup' exact>Luo tili</NavDropdown.Item> */}
      <NavDropdown.Item onClick={() => setExpanded(false)} as={NavLink} to='/feedback' exact>Anna Palautetta </NavDropdown.Item>
      <NavDropdown.Item onClick={() => setExpanded(false)} as={NavLink} to='/about' exact>Tietoa Palvelusta</NavDropdown.Item>
      {/* <NavDropdown.Item onClick={() => setExpanded(false)} as={NavLink} to='/privacy' exact>Tietosuojalauseke</NavDropdown.Item> */}
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={() => setExpanded(false)} as={NavLink} to='/logout' exact>Kirjaudu ulos</NavDropdown.Item>
    </NavDropdown>
  );
  // refactor, currently needed for user.sub on authlingks, make it better
  if(isAuthenticated) {

    let username = 'Hei'
    if(user && user.sub) {
      username = user.sub;
    }

    authLinks = (

      <ul className='navbar-nav ml-auto'>
          {/* <a href='#' className='nav-link' onClick={this.onLogout.bind(this)}> */}
              {/* <img alt={user.sub} title={user.sub}
                  className='rounded-circle'
                  style={{ width: '25px', marginRight: '5px'}} />
                      Logout */}
          {/* </a> */}
          <li className='custom_nav_link'>
          <Nav.Link onClick={() => setExpanded(false)} as={NavLink} to='/' exact>Home</Nav.Link>
         </li>
         <li className='custom_nav_link'>
          <Nav.Link onClick={() => setExpanded(false)} as={NavLink} to='/messages' exact>Viestit</Nav.Link>
          </li>
          <li className='custom_nav_link'>
          <Nav.Link onClick={() => setExpanded(false)} as={NavLink} to='/me' exact>{username}</Nav.Link>
          </li>
          <li className='custom_nav_link'>
            {dropDown}
          </li>
      </ul>
    );

  }

  const guestLinks = (
    <ul className='navbar-nav ml-auto'>
        <li className='custom_nav_link'>
        <Nav.Link onClick={() => setExpanded(false)} as={NavLink} to='/signin' exact>Kirjaudu sisään</Nav.Link>
        </li>
        <li className='custom_nav_link'>
        <Nav.Link onClick={() => setExpanded(false)} as={NavLink} to='/signup' exact>Luo tili</Nav.Link>
        </li>
        <li className='custom_nav_link'>
        {dropDown}
        </li>
    </ul>
  );

// main page, todo: move to
  return (
    <div className='App'>
      <div className="App-alert">
        {/* {isServiceWorkerInitialized && (
          <Alert text="Sovellus tallennettu offline modeen" type={SW_INIT} />
        )} */}
        {isServiceWorkerUpdated && (
          <Alert
            text="Uusi versio saatavilla."
            buttonText="Päivitä"
            type={SW_UPDATE}
            onClick={updateServiceWorker}
          />
        )}
      </div>


      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          isServiceWorkerInitialized:{' '}
          {JSON.stringify(isServiceWorkerInitialized)}
        </p>
        <p>isServiceWorkerUpdated: {JSON.stringify(isServiceWorkerUpdated)}</p>
      </header> */}
     {/* https://stackoverflow.com/questions/19733447/bootstrap-navbar-with-left-center-or-right-aligned-items */}
     <Router>
        <Navbar expanded={expanded} expand='lg' bg='dark' variant='dark'>
          <Navbar.Brand as={NavLink} to='/'>Laturilla.fi </Navbar.Brand>
          <Navbar.Toggle onClick={() => setExpanded(expanded ? false : 'expanded')} aria-controls='responsive-navbar-nav' />
          <Navbar.Collapse id='responsive-navbar-nav'>
            <Nav className='navbar-nav ml-auto'>
              {/* <Nav.Link as={NavLink} to='/signin' exact>Kirjaudu sisään</Nav.Link> */}
              {isAuthenticated ? authLinks : guestLinks}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/about' exact component={about} />
          <Route path='/feedback' exact component={feedback} />
          <Route path='/privacy' exact component={privacy} />
          <Route path='/signin' exact component={signin} />
          <Route path='/signup' exact component={signup} />
          <Route path='/logout' exact component={logout} />
          <Route path='/me' exact component={me} />
          <Route path='/messages' exact component={messages} />
          <Route path='/forgotpw' exact component={forgotpw} />
          <Route path='/changepw/:pwId' exact component={changepw} />
          <Route path='/confirm/:id' exact component={confirmEmail} />
          <Route component={Home} />
        </Switch>
      </Router>
     
     
     {/* <Header text='Laturilla.fi' /> */}
     {/* <Menu/> */}
   </div>
 );

  function Home(props) {

    useEffect(() => {
      
      if (cookies.get(cookieName) && !isAuthenticated) {
        const currentTime = Date.now() / 1000;
        const decoded = jwt_decode(cookies.get(cookieName));
        setAuthToken(cookies.get(cookieName));
        dispatch({
          type: 'SET_CURRENT_USER',
          payload: decoded
        });

        if ( (decoded.exp < currentTime)) {
          dispatch({
            type: 'SET_LOGOUT_USER'
          });
          setAuthToken();
          history.push('/signin');
          return signin();
        }
  
    } 
      if(!cookies.get(cookieName) && isAuthenticated) {
        // user not logged initialState
        console.log('no cookie, set user is logget out');
        dispatch({
          type: 'SET_LOGOUT_USER'
        });
        // todo: show message that session expired
      }


    }
    );

    return (
      <div>
    <Body text='placeholder' />
    <p className='App-intro'>Etsi rekisterinumerolla</p>
    <Search search={search} />
    {/* todo: ohje konseptista yms */}
    {(car && car.plate) || searchValueCopy || isAuthenticated ? '' :
    // show help what this service is about for non-logged in users
    <Howto/>
    }

    <div className='car'>
      {loading && !errorMessage ? (
      <span></span>
      ) : errorMessage ? (
        <div className='errorMessage'>{errorMessage}</div>
      ) : (
      renderSearchResult(car, props)
      )}
    </div>
    </div>
    ); 
  }

  function me(props) {
    
    //Todo: ask this after registration and check when viewing messages/me info
    //show this on modal to ask for permissions
    
    // This will output: granted, default or denied
    // console.log(Notification.permission)

    // if (!('serviceWorker' in navigator)) {
    //   throw new Error('No Service Worker support!');
    // }
    // if (!('PushManager' in window)) {
    //   throw new Error('No Push API Support!');
    // }
    
    // requestNotificationPermission();
    //displayNotification();
    //subscribeUser();
    
    return(
      <Suspense fallback={renderLoader()}>
        <Me updateUser={updateUser} props={props} isAuthenticated={isAuthenticated}/>
      </Suspense>
    );
  }

  function messages(props) {
    return(
      <Suspense fallback={renderLoader()}>
        <Messages props={props} isAuthenticated={isAuthenticated}/>
      </Suspense>
    );
  }

  function about() {
    return <About/>
  }

  function forgotpw(props) {
    return <Forgotpw props={props}/>
  }

  function changepw(props) {
    return <Changepw props={props}/>
  }

  function confirmEmail(props) {
    return <ConfirmEmail props={props}/>
  }

  function feedback(props) {
    return <Feedback props={props} isAuthenticated={isAuthenticated} />
  }

  function privacy() {
    return<Privacy/>
  }

  function signin(props) {
    return <Login login={login} props={props}/>
  }
  function signup(props) {
    return <Register register={register} history={props.history}/>
  }

  function logout(props) {

    // clear cookie and token
    setPipari();
    
    dispatch({
      type: 'SET_LOGOUT_USER',
    });
    props.history.push('/');
    return Home();
  }
}

export default App;