import { useState, useEffect, Fragment } from "react";
import userService from '../services/userService';
import messageService from '../services/messageService';
import pushService from '../services/pushService';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Alert from 'react-bootstrap/Alert';

import Cookies from 'universal-cookie';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';
import Moment from 'react-moment';
import { getRegistrationsFromBrowser, isNotificationsGranted, requestNotificationPermission, subscribeUser, isSupportWebPushNotifications } from '../utils/pushSubscriptionUtils';

const cookies = new Cookies();

const isEmpty = inputObject => {
  if(inputObject) {
    return Object.keys(inputObject).length === 0;
  }
  return true;
};

const Me = (props) => {

const [show, setShow] = useState(false);
const [index, setIndex] = useState('');
const [title, setTitle] = useState('');

const handleClose = async () => {
  setShow(false);
}

const handleCloseOK = async () => {
  setShow(false);
  await handleRemoveFields(index);
}

const handleShow = (index) => {
  
  const values = [...inputFields];
  setTitle(values[index].plate);
  setShow(true);
  setIndex(index); 
}

//confirm modal for remove account, move to own component and use the same one, not this fast copy paste hack
const [showd, setShowd] = useState(false);

//delete account model hack copy paster:
const handleCloseOKD = async () => {
  setShowd(false);
  try {
    await userService.deleteUserAndPlates();

    const cookieName = process.env.REACT_APP_COOKIE_NAME  
    cookies.remove(cookieName, { path: '/',});
    props.props.history.push('/');

    toaster.notify(`Tilisi on poistettu`, {
      duration: 5000
    });
  } catch (e) {
      toaster.notify(`tapahtui virhe, kokeile myöhemmin uudestaan`, {
        duration: 5000
      });
    }
}

const handleCloseD = async () => {
  setShowd(false);
}

const handleShowD = () => {
  setShowd(true);
}

const handleDownloadData = async () => {
  try {
    const obj = await userService.downloadData();

    let link = document.createElement("a");
    link.download = `laturilla-tietosi.json`;
    let blob = new Blob([JSON.stringify(obj, null, 2)], { type: "appilication/json" });
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);

  } catch (e) {
    toaster.notify(`tapahtui virhe, kokeile myöhemmin uudestaan`, {
      duration: 5000
    });
  }
}

const [user, setUser] = useState({
  name: '',
  email: '',
  password: '',
  password2: '',
  description: '',
  emailMessagesEnabled: false,
  emailVerified: false,
  errors: {}
});

//password change
const [password, setPassword] = useState({
  password: '',
  passwordNew: ''
});

const [submittedPw, setSubmittedPw] = useState(false);

function handleChangePw(e) {
  const { name, value } = e.target;
  setPassword(password => ({ ...password, [name]: value }));
}

async function handleSubmitPw(e) {
  e.preventDefault();
  setSubmittedPw(true);
  
  if(password.passwordNew !== password.passwordNew2) {
    toaster.notify(`Uusi salasana ei vastaa vahvistettua salasanaa`, {
      duration: 5000
    });
    return;
  }
  
  const passwordRequest = {
    password: password.password,
    passwordNew: password.passwordNew
  }
  
  try {
    await userService.changePassword(passwordRequest);
    toaster.notify(`Salasana vaihdettu onnistuneesti`, {
      duration: 5000
    });
    setPassword({
      password: '',
      passwordNew: '',
      passwordNew2: ''
    });
    setSubmittedPw(false);

  } catch (e) {

    if(e.response.status === 400) {
      toaster.notify(`Väärä salasana, ei voi vaihtaa uuteen`, {
        duration: 5000
      });
    } else {
      toaster.notify(`virhe, salasanaa ei voitu vaihtaa, kokeile myöhemmin uudestaan`, {
        duration: 5000
      });
    }
  }
}

//set errors
const [error, setError] = useState(null);

const [vehicles, setVehicles] = useState({
  vehicle: []
});

const [subscriptions, setSubscriptions] = useState([
  {_id: '', createdAt: '', userAgent: '', platform: ''}
]);

const [subscriptionForThisDevice, setSubscriptionForThisDevice] = useState({
  subscription: ''
});

const [inputFields, setInputFields] = useState([
  { _id: '', plate: '', description: '', allowAnnonMsg: true, modified: false }
]);

const [emailMessagesEnabled, setEmailMessagesEnabled] = useState({
  checked: false
})

const [userModified, setUserModified] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [submittedVehicle, setSubmittedVehicle] = useState(false);
const [isSubscription, setIsSubscription] = useState(false);

const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
    //fetch me user and dispatch the content for UI
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {

        const res = await userService.getUser();

        setUser(res.user);

        setEmailMessagesEnabled({
          checked: res.user.emailMessagesEnabled
        });
        //get car details array
        //remember to retains the previous vehicles also
        
        setVehicles({
          vehicle: res.vehicles
        });

        setInputFields(res.vehicles);

        //get subscription for this browser
         const browserSub = await getRegistrationsFromBrowser();
        let userSubs;
         if(browserSub) {
          userSubs = await pushService.getSubscriptionForUser(browserSub.subscription);

            if(userSubs.subscription) {
              setSubscriptionForThisDevice({
                subscription: userSubs.subscription
              });

              setIsSubscription(true);
            } else {
              // USER NOT subscribed in db, but has subs object in browser
              // todo: do auto subscription here if notfications == granted
              if (isNotificationsGranted()) {
                // push notification GRANTED, storing subs object to db'
                try {
                  userSubs = await pushService.subscribe(browserSub.subscription, browserSub.platform, browserSub.userAgent);

                  setSubscriptionForThisDevice({
                    subscription: userSubs.subscription
                  });
                  setIsSubscription(true);
                } catch (e) {
                  console.log(e);
                }
              }
            }
          } else {
            console.log('USER NOT subscribed in browser');
          }

        //fetch users all subs
        const subs = await pushService.getSubscriptions();

        //filter out this device from all the devices
        let myDevicePushId = 'empty'
        if(userSubs && userSubs.subscription && userSubs.subscription._id) {
          myDevicePushId = userSubs.subscription._id;
        }
        const filteredSubscriptions = subs.subscriptions.filter(sub => sub._id !== myDevicePushId);
        setSubscriptions(filteredSubscriptions);

      } catch (e) {
        setIsError(true);
        if(e && e.repsonse && e.response.status === 401) {
          toaster.notify(`Sessio vanhentunut, kirjaudu uudelleen sisään: `, {
            duration: 5000
          });
        }
        const cookieName = process.env.REACT_APP_COOKIE_NAME
        cookies.remove(cookieName, { path: '/',});
        // clear current user
        props.props.history.push('/signin');
      }
      setIsLoading(false);
    }

    try {
    fetchData();
    } catch(e) {
      console.log('fetchData failed');
    }
}, []);

const handleInputChange = (e) => {
  setUser({
      ...user,
      [e.target.name]: e.target.value
  });
  setUserModified(true);
};

const handleInputChangeEmailEnabled = (e) => {

  setEmailMessagesEnabled({
      checked: e.target.checked
  });
  setUser({
    ...user,
    [e.target.name]: e.target.checked
  });

  setUserModified(true);
};

//update vehicles
const handleAddFields = () => {
  const values = [...inputFields];
  values.push({ plate: '', description: '', allowAnnonMsg: true});
  setInputFields(values);
};

const handleSubmitVehicle = async (index) => {

  setSubmittedVehicle(true);
  const values = [...inputFields];
  
  let vehicle = {};
  if(values[index].modified) {
      vehicle.plate = values[index].plate;
      vehicle.description = values[index].description; //not mandatory
      vehicle.allowAnnonMsg = values[index].allowAnnonMsg;
  }

  try { 
    let data;      
    data = await userService.updateVehicle(vehicle);
    values[index] = data;
    setInputFields(values);
    setSubmittedVehicle(false);

    toaster.notify('Tallennus onnistui', {
      duration: 5000
    });

  } catch (e) {

    if(e.response.status === 409) {
      toaster.notify(`Rekisterinumeroa "${vehicle.plate}" ei voida lisätä, koska se on jo rekisteröity toiselle käyttäjälle`, {
        duration: 5000
      });

      setError('Rekisteröity jo toiselle käyttäjälle');

    } else if(e.response.status === 400) {
      toaster.notify(`Rekisterinumero "${vehicle.plate}" on virheellinen, tietoa ei voitu tallentaa, rekisterinumerosta puuttuu "-" merkki`, {
        duration: 5000
      });

    } else if(e.response.status === 401) {
        toaster.notify(`Sessio vanhentunut, kirjaudu uudelleen sisään: `, {
          duration: 3000
        });
          props.props.history.push('/signin');
                
      } else {
        toaster.notify(`uups, tapahtui joku virhe`, {
          duration: 5000
        });
      }
  }

};

// remove subscriptions
const handleRemoveSubscription = async (index) => {

  try {

  const values = [...subscriptions];  
  const id = values[index]._id;

    if(id) {
      await pushService.removeSubscriptionWithId(id);
    }
    values.splice(index, 1);
    setSubscriptions(values);

  } catch (e) { 
    toaster.notify(`'tapahtui joku virhe, yritä uudelleen`, {
      duration: 5000
    });
  }

}

const handleRemoveThisDeviceSubscription = async (id) => {

  try {
    if(id) {
      await pushService.removeSubscriptionWithId(id);
      toaster.notify(`Push notifikaatio poistettu onnistuneesti tälle laitteelle`, {
        duration: 5000
      });
    }

    setSubscriptionForThisDevice({
      subscription: ''
    });
    setIsSubscription(false);

  } catch (e) { 
    toaster.notify(`tapahtui joku virhe, yritä uudelleen`, {
      duration: 5000
    });
  }

}

const testPushNofitications = async () => {
  try {

    await pushService.sendTestPush('noInUse');
    toaster.notify(`Push notifikaatio testiviesti lähetetty laitteillesi`, {
      duration: 3000
    });
  } catch (e) {
    //todo: check if session is active
  }

}

const handleAddThisDeviceSubscription = async () => {
  //todo: Open popup with instructions if push notifications are not allowed yet
  if(!isNotificationsGranted()) {
    //will trigger notification pop up and will change the isNotificationGranted status
    await requestNotificationPermission();
  }

  if(isNotificationsGranted()) {
    //get subscription from browser
    const browserSub = await getRegistrationsFromBrowser();
    //subscribe automatically if there is subscription object
    if(browserSub) {

      try {
        const res = await pushService.subscribe(browserSub.subscription, browserSub.platform, browserSub.userAgent);

        setSubscriptionForThisDevice({
          subscription: res.subscription
        });

        setIsSubscription(true);

        console.log('automatically subscribed to push notifications');

        toaster.notify(`Push notifikaatio lisätty onnistuneesti tälle selaimelle/laitteelle`, {
          duration: 20000
        });

      } catch (e) {
        if(e.response.status === 409) {
          toaster.notify(`Virhe: ${e.response.status}. Push notifikaatio ei voitu lisätä tällee selaimelle/laitteelle`, {
            duration: 10000
          });
        }
      }
      
    } else {
    // subscribe the user
      //Creating new subscription for user
      const userSubs = await subscribeUser();
      if(userSubs) {

        try {
          const res = await pushService.subscribe(userSubs.subscription, userSubs.platform, userSubs.userAgent);
          setSubscriptionForThisDevice({
            subscription: res.subscription
          });
          setIsSubscription(true);

          toaster.notify(`Push notifikaatio lisätty onnistuneesti tälle selaimelle/laitteelle`, {
            duration: 20000
          });

        } catch (e) {
          if(e.response.status === 409) {
            toaster.notify(`Virhe: ${e.response.status}. Push notifikaatio ei voitu lisätä tällee selaimelle/laitteelle`, {
              duration: 10000
            });
          }
        }
      }
    }

    
  } else {

  //push notificatins are not allowed:
    toaster.notify(`Notifikaatiot on estetty selaimesta, vaihda asetus selaimen osoitepalkin info nappulasta`, {
      duration: 20000
    });
  }

}

const handleRemoveFields = async (index) => {

  const values = [...inputFields];
  const id = values[index]._id;
  try {

    if(id) {
      await userService.removeVehicle(id);
    }
    values.splice(index, 1);
    setInputFields(values);

  } catch (e) { 
    toaster.notify(`'tapahtui joku virhe, yritä uudelleen`, {
      duration: 5000
    });
  }
};

function asBoolean(value) {
  return (''+value) === 'true'; 
}

const handleInputChangeV = (index, event) => {
  const values = [...inputFields];
  if (event.target.name === "plate") {
    values[index].plate = event.target.value.toUpperCase().replace(/[^a-zA-Z0-9]+/g, "-");
  }
  if (event.target.name === "description") {
    values[index].description = event.target.value;
  } if (event.target.name === "allowAnnonMsg") {
    values[index].allowAnnonMsg = !asBoolean(event.target.value);

  }
  values[index].modified = true;
  setInputFields(values);

};

//name, email, description
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitted(true);

  if (user.name && user.email) {

      try {
        const res = await userService.updateUser(user);

        if(res) {
          props.updateUser(res);

          toaster.notify(`Tietojen päivitys onnistui `, {
            duration: 5000
          });
        }
      } catch(e) {

      //email already in use
      if(e.response.status === 409) {
        toaster.notify('Sähköpostiosoite on jo käytössä, käytä jotain muuta osoitetta', {
          duration: 5000
        });
      }

      if(e.response.status === 401) {
        toaster.notify('Sessio vanhentunut, kirjaudu uudelleen sisään: ', {
          duration: 5000
        });

      }
    }

  }
  
}
const saveVehicleButton = index => (
                 <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => handleSubmitVehicle(index)}
                >
                Tallenna
                </button> );

function ConfirmModal() {
  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal show={show} onHide={handleClose} animation={false}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
        <Modal.Header closeButton>
          <Modal.Title>Poista Ajoneuvo</Modal.Title>
        </Modal.Header>
        <Modal.Body>Haluatko varmasti poistaa ajoneuvon rekisterinumerolla: {title}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Peruuta
          </Button>
          <Button variant="primary" onClick={handleCloseOK}>
            Poista
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function ConfirmModalD() {
  return (
    <>
      <Modal show={showd} onHide={handleCloseD} animation={false}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter1"
            centered>
        <Modal.Header closeButton>
          <Modal.Title>Olet poistamassa tiliä: {user.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>Haluatko varmasti poistaa tilisi? kaikki ajoneuvot, viestisi ja tietosi poistetaan, niitä ei voi palauttaa</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseD}>
            Peruuta
          </Button>
          <Button variant="primary" onClick={handleCloseOKD}>
            Poista
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

async function handleSendEmailConfigButton() {

  try {
    await messageService.sendOnboardEmail({ email: user.email });
    toaster.notify(`Vahvistusviesti lähetetty osoitteeseen ${user.email}`, {
      duration: 5000
    });

  } catch (e) {
      toaster.notify(`jotain meni pieleen vahvistusviestin lähettämisessä`, {
        duration: 5000
      });
    }
}

const handleNotifButton = function (id, enabled) {


  //user has notifications enabled for this browser
  if(enabled) {
    return (
      <button
       className="btn btn-primary btn-sm"
       type="button"
       onClick={() => handleRemoveThisDeviceSubscription(id)}
       > Poista push notifikaatio tälle selaimelle </button>
    )
  } // false, user doesn't have notifications enabled
  return (
    <button 
     className="btn btn-primary btn-sm"
     type="button"
     onClick={() =>  handleAddThisDeviceSubscription()}
     > Salli push notifikaatiot tälle selaimelle  </button>
  )
}

  return (
    <div className="me">
      {isError && <div>Something went wrong, could not fetch userdata, please login ...</div>}
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
  <div>
        {/* <h2>Käyttäjätiedot debug:</h2>
        <h3>Nimi: {user.name}</h3>
        <h4>Email: {user.email}</h4>
        <p>Kuvaus: {user.description}</p>
        <p>id: {user.id}</p>
        <p>error: {error}</p>
        <p>vehicles: {JSON.stringify(vehicles)}</p>
        <p>isauth:{isAuthenticated.toString()}</p>
        <p>user:{JSON.stringify(user)}</p>        
        <p>SUBS: {JSON.stringify(subscriptions)}</p> */}
        <div>
    <ConfirmModal/>
    </div>
      <div className="container" style={{ marginTop: '25px', 'maxWidth': '400px'}}>
          {/* <h2 style={{marginBottom: '40px'}}>Tili tiedot</h2> */}
          <h1>Käyttäjätiedot</h1>

          {/* show information if email is not yet confirmed */}
          {user.emailVerified ? ('') : (
          <div><p><b>Huom:</b>Sähköpostiosoitetta ei ole vielä vahvistettu, voit lähettää uuden vahvistus viestin sähköpostiisi tästä:</p>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={() => handleSendEmailConfigButton()}>
              Lähetä vahvistussähköposti
            </button>
            <br/>
            <br/>
          </div>
          )}
          
          <form name="me" onSubmit={ handleSubmit }>
              <div className="form-group">
                  <label>Nimi / Nimimerkki (Julkinen)</label>
                  <input
                  label="laavei"
                  type="text"
                  placeholder="Nimi"
                  name="name"
                  onChange={ handleInputChange }
                  value={ user.name }
                  className={'form-control' + (submitted && !user.name ? ' is-invalid' : '')}
                  />
                  {submitted && !user.name && 
                  <div className="invalid-feedback">Nimi puuttuu</div>}
              </div>
              <div className="form-group">
                  <label>Käyttäjätunnus/sähköpostiosoite (ei näy muille käyttäjille)</label>
                  <input
                  type="email"
                  autoComplete="username"
                  placeholder="Käyttäjätunnus (sähköpostiosoite)"
                  name="email"
                  onChange={ handleInputChange }
                  value={ user.email }
                  className={'form-control' + (submitted && !user.email ? ' is-invalid' : '')}
                  />
                 {submitted && !user.email && 
                 <div className="invalid-feedback">Käyttäjätunnus puuttuu</div>}
              </div>
              {/* Show the option to receive emails only if email has been verified */}
              {user.emailVerified ? (<div>
              <label>Vastaanota sähköposti-ilmoitus uusista viesteistä</label>
              <div className='toggle-switch'>
              
                <input
                type='checkbox'
                className='toggle-switch-checkbox'
                id='emailMessagesEnabled'
                name="emailMessagesEnabled"
                checked={emailMessagesEnabled.checked}
                // value={user.emailMessagesEnabled}
                onChange={handleInputChangeEmailEnabled}
                readOnly
                />
                <label className="toggle-switch-label" htmlFor={'emailMessagesEnabled'}>
                    <span className="toggle-switch-inner" data-yes="Kyllä" data-no="Ei"></span>
                    <span className="toggle-switch-switch"></span>
                </label>
            </div>
            <br/>
                <br/>
                </div>
              ) : ('') }
              <div className="form-group">
                <label htmlFor="description">Profiilisi julkinen kuvaus</label>
                <textarea
                  rows="5"
                  className="form-control" 
                  id="description"
                  name="description"
                  placeholder="Yleinen kuvaus, voit välittää tässä yleistä tietoa mitä et halua autokohtaisesti välittää"
                  maxLength = "2000"
                  value={ user.description}
                  onChange={handleInputChange}
                  // todo: form-control handler?
                />
              </div>
              <div className="form-group">
                  <button type="submit" className="btn btn-primary" disabled={ !userModified }> Päivitä </button>
                  {/* <input type="submit" value="Rekisteröi" /> */}
              </div>

          </form>
          <hr></hr>
          <div>
          <form name="mePw" onSubmit={ handleSubmitPw }>

              <div className="form-group">
              {/* add the hidden field
              <input type="hidden" name="username" autoComplete="username" value="a_b"/> */}
                  <label>Vanha salasana</label>
                  <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Salasana"
                  name="password"
                  minLength="8"
                  onChange={ handleChangePw }
                  value={ password.password }
                  className={'form-control' + (submittedPw && !password.password ? ' is-invalid' : '')}
                  />
                  {submitted && !password && 
                  <div className="invalid-feedback">Salasana puuttuu</div>}
              </div>
              
              <div className="form-group">
              <label>Uusi salasana</label>
                  <input
                  type="password"
                  autoComplete="new-password"
                  minLength="8"
                  placeholder="Uusi salasana"
                  name="passwordNew"
                  onChange={ handleChangePw }
                  value={ password.passwordNew }
                  className={'form-control' + (submittedPw && !password.passwordNew ? ' is-invalid' : '')}
                  />
                 {submitted && !password.passwordNew && 
                 <div className="invalid-feedback">Salasana puuttuu</div>}
              </div>
              <div className="form-group">
              <label>Vahvista uusi salasana</label>
                  <input
                  type="password"
                  autoComplete="new-password"
                  minLength="8"
                  placeholder="Vahvista uusi salasana"
                  name="passwordNew2"
                  onChange={ handleChangePw }
                  value={ password.passwordNew2 }
                  className={'form-control' + (submittedPw && !password.passwordNew2 ? ' is-invalid' : '')}
                  />
                 {submitted && !password.passwordNew2 && 
                 <div className="invalid-feedback">Salasana puuttuu</div>}
              </div>
              <div className="form-group">
                  <button type="submit" className="btn btn-primary"> Vaihda salasana </button>
                  {/* <input type="submit" value="Rekisteröi" /> */}
  
              </div>
              <hr></hr>
          </form>
          </div>

          <div>
          <h1>Push Notifikaatiot</h1>

          {/* Jos ei notifikaatioita käyttäjällä tässä browserissa -> näytä enable button
          //hae notifikaatiot löytyykö tälle browserille
          --> popup missä ne voi enabloida + ohje
          else:
            näytä clients: Created - User Agent
             (per käyttäjä user agentti)
            -> poista kaikki notifikaatiot käytöstä myös tälle käyttäjä tilille
            -> poista notifikaatio tälle laitteelle -> disabloi ettei sitä automaattisesti enabloida
            -> testaa notifikaatiota button? */}
          
          <h3>Tämä selain/laite:</h3>
          
          {!isSupportWebPushNotifications() ? (
            <div>
              <Alert variant="info">
                <Alert.Heading>Voi ei, push notifikaatiossa ongelmia</Alert.Heading>
                <p>
                  Tälle selaimelle ei ole push notifikaatiota vielä. Tuki puuttuu Apple iOS selaimilta. Notifikaatiot toimivat Android, Win10: Chrome, firefox, opera, Edge. Voit pistää email notifikaatiot päälle kunnes tuki lisätään myös iOS:lle
                </p>
              </Alert>
            </div>
            ): ''} 
          {!isNotificationsGranted() ? (
            <div>
              <p>Salli Push notifikaatiot puhelimesi selaimesta saadaksesi viestit suoraan puhelimen ilmoituskenttään </p>
              <p>Huom:Notifikaatiot on estetty selaimesta, vaihda asetus selaimen osoitepalkin info nappulasta</p>
            </div>) : '' }
          {/* {<p>{JSON.stringify(subscriptionForThisDevice)}</p> } */}
          {!isSubscription ? '':
          //show this only if there is subscription for this device  
          <ListGroup horizontal="xl" className="my-3" key={index} >
                  <ListGroup.Item><Moment locale="fi">{subscriptionForThisDevice.subscription.createdAt}</Moment></ListGroup.Item>
                  <OverlayTrigger
                      trigger="click"
                      key={index}
                      placement="top"
                      variant="light"
                      overlay={
                        <Popover id={`popover-positioned-${index}`}>
                          <Popover.Title as="h3">{`Push notification info:`}</Popover.Title>
                          <Popover.Content>
                            <strong>userAgent:</strong> {subscriptionForThisDevice.subscription.userAgent}  <br/>
                            <strong>platform:</strong> {subscriptionForThisDevice.subscription.platform} <br/>
                            <strong>created:</strong> {subscriptionForThisDevice.subscription.createdAt}  <br/>
                          </Popover.Content>
                        </Popover>
                      }
                    >
                      <ListGroup.Item ><Button variant="link">{subscriptionForThisDevice.subscription.platform}</Button></ListGroup.Item>
                      
                    </OverlayTrigger>
                    {/* <ListGroup.Item>
                      <button
                      className="btn btn-link"
                      type="button"
                      // TODO removal
                      onClick={() => handleRemoveSubscription(index)}
                      >
                        Poista
                      </button>
                    </ListGroup.Item> */}
                  </ListGroup>
                    }

                      {/* {(!isEmpty(subscriptionForThisDevice.subscription)).toString()} */}
          {!isEmpty(subscriptionForThisDevice.subscription) ? handleNotifButton(subscriptionForThisDevice.subscription._id, true): handleNotifButton(index, false)  }


          <h3><br/>Muut selaimet:</h3>
          <div className="notifications">
          {!isEmpty(subscriptions) ? '' : <p>Ei Notifikaatioita muille laitteille. <br/> Kirjaudu uudelle laitteella/selaimelle ja tilaa notifikaatiot asetussivuilta</p>  }
              {subscriptions.map((subscription, index) => (
                <Fragment key={`${subscription}~${index}`}>
                 {/* <p>{JSON.stringify(subscription)}</p> */}
                 {/* TODO: skip if the _id === subscriptionForThisDevice.subscription._id */}

                  <ListGroup horizontal="xl" className="my-2" key={index} >
                  <ListGroup.Item><Moment locale="fi">{subscription.createdAt}</Moment></ListGroup.Item>
                  <OverlayTrigger
                      trigger="click"
                      key={index}
                      placement="top"
                      variant="light"
                      overlay={
                        <Popover id={`popover-positioned-${index}`}>
                          <Popover.Title as="h3">{`Push notification info:`}</Popover.Title>
                          <Popover.Content>
                            <strong>userAgent:</strong> {subscription.userAgent}  <br/>
                            <strong>platform:</strong> {subscription.platform}  <br/>
                            <strong>created:</strong> {subscription.createdAt}  <br/>
                          </Popover.Content>
                        </Popover>
                      }
                    >
                      <ListGroup.Item ><Button variant="link">{subscription.platform}</Button></ListGroup.Item>
                      
                    </OverlayTrigger>
                    <ListGroup.Item>
                      <button
                      className="btn btn-link"
                      type="button"
                      onClick={() => handleRemoveSubscription(index)}
                      >
                        Poista
                      </button>
                    </ListGroup.Item>
                  </ListGroup>
                  
                </Fragment>
              ))}
          </div>
          <button
       className="btn btn-primary btn-sm"
       type="button"
       onClick={() => testPushNofitications()}
       > Testaa push notifikaatioita </button>
          <hr></hr>        

          </div>
          <div>
            <h1>Ajoneuvojen tiedot</h1>
{/* https://dev.to/fuchodeveloper/dynamic-form-fields-in-react-1h6c */}
        { inputFields.length >= 5 ? (<button className="btn btn-link" type="button" disabled={true} onClick={() => handleAddFields()}>Lisää uusi auto (max 5) </button>) :  (<button className="btn btn-link" type="button" onClick={() => handleAddFields()}>Lisää uusi auto </button>) }
        <hr/>
      <form >
        <div className="vehicle">
          {inputFields.map((inputField, index) => (
            <Fragment key={`${inputField}~${index}`}>
              <div className="form-group">
                <label htmlFor="plate">Rekisterinumero</label>
                <input
                  type="text"
                  id={`plate_${index}`}
                  name="plate"
                  placeholder="ABC-123"
                  minLength = "3"
                  maxLength = "12"
                  autoFocus
                  value={inputField.plate}
                  disabled={!isEmpty(inputField._id)}
                  onChange={event => handleInputChangeV(index, event)}
                  className={'form-control' + (submittedVehicle && (!inputField.plate || !inputField.plate.includes('-')) ? ' is-invalid' : '')}
                  />
                 {submittedVehicle && (!inputField.plate || !inputField.plate.includes('-')) && 
                 <div className="invalid-feedback">Rekisterinumero puuttuu tai on virheellinen</div> }
                 {submittedVehicle &&  !isEmpty(error) &&
                 <div className="invalid-feedback">{error}</div>}
                
              </div>
              <div className="form-group">
                <label htmlFor="description">Autosi julkinen Kuvaus</label>
                <textarea
                  rows="5"
                  className="form-control" 
                  id={`description_${index}`}
                  name="description"
                  placeholder="esim. kuvaus autosta, tarkemmat yhteystiedot, mitä vain tietoa haluat välittää jotka etsivät tällä rekisterinumerolla"
                  maxLength = "2000"
                  value={inputField.description}
                  onChange={event => handleInputChangeV(index, event)}
                />
              </div>
              {/* <div className="form-group">
                <input
                  type='checkbox'
                  className="form-control" 
                  id="allowAnnonMsg"
                  name="allowAnnonMsg"
                  checked={inputField.allowAnnonMsg}
                  value={inputField.allowAnnonMsg}
                  // readOnly
                  onChange={event => handleInputChangeV(index, event)}
                />
              </div> */}
              <label>Salli anonyymit viestit (käyttäjiltä jotka eivät ole kirjautuneet palveluun)</label>
              <div className='toggle-switch'>
              
                <input
                type='checkbox'
                className='toggle-switch-checkbox'
                id={`allowAnnonMsg_${index}`}
                name="allowAnnonMsg"
                checked={inputField.allowAnnonMsg}
                value={inputField.allowAnnonMsg}
                onChange={event => handleInputChangeV(index, event)}
                readOnly
                />
                <label className="toggle-switch-label" htmlFor={`allowAnnonMsg_${index}`}>
                    <span className="toggle-switch-inner" data-yes="Kyllä" data-no="Ei"></span>
                    <span className="toggle-switch-switch"></span>
                </label>
            </div>
            
              {/* todo: add confirmation modal */}
              <div className="form-group">
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => handleShow(index)}
                >
                  Poista
                </button>
                {/* invoke store only if ther are changed to the vehicle data */}
                {inputField.modified ? saveVehicleButton(index) : (<button className="btn btn-link" type="button" disabled={ !inputField.modified }> Tallenna </button>) }

              </div>
                <hr></hr>
            </Fragment>
          ))}
        </div>
        {/* { inputFields.length >= 5 ? (<button className="btn btn-link" type="button" disabled={true} onClick={() => handleAddFields()}>Lisää uusi auto (max 5) </button>) :  (<button className="btn btn-link" type="button" onClick={() => handleAddFields()}>Lisää uusi auto </button>) } */}
        <br/>
        <br/>
        <ConfirmModalD/>
        <div className="form-group">
          <button 
            className="btn btn-danger btn-sm"
            type="button"
            onClick={() => handleShowD()}
          > Poista tili ja kaikki tiedot </button>
        </div>
        <div className="form-group">
          <button 
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => handleDownloadData()}
          > Lataa tietosi </button>
        </div>

        {/* { <pre>
          {JSON.stringify(inputFields, null, 2)}
        </pre> } */}
      </form>

          </div>

      </div>
      </div>
      )}

    </div>
  );
};

export default Me;