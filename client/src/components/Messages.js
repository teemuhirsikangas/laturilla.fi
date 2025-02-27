import { useState, useEffect, Fragment } from "react";
import userService from '../services/userService';
import pushService from '../services/pushService';
import messageService from '../services/messageService';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import Cookies from 'universal-cookie';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';
import { Link } from "react-router-dom";
import { getRegistrationsFromBrowser, isNotificationsGranted, requestNotificationPermission, subscribeUser } from '../utils/pushSubscriptionUtils';

import Moment from 'react-moment';

const cookies = new Cookies();

const Messages = (props) => {

//confirm modal, move to own component
const [show, setShow] = useState(false);
const [showReplyBox, setShowReplyBox] = useState(false);
const [index, setIndex] = useState('');
const [title, setTitle] = useState('');

const [submitted, setSubmitted] = useState(false);
const [submittedOK, setSubmittedOK] = useState(false);
const [message, setMessage] = useState({
  message: '',
  to: ''
});

const handleClose = async () => {
  setShow(false);
}

const handleCloseReply = async () => {
  setShowReplyBox(false);
}

//handle close modal from reply message
const handleCloseOK = async () => {
  setShow(false);
  await handleRemoveFields(index);
}

//handle when pressing send button on reply message
const handleReplyOK = async (e) => {
  setSubmitted(true);
  if(!message.message) {
    return;
  }

  setShowReplyBox(false);
  await handleReplySubmit(e);
}

//show delete message modal
const handleShow = (index) => {

  const values = [...inputFields];

  if(values[index].anonymous) {
    setTitle('anonyymi');    
  } else {
    setTitle(values[index].from.name);
  }

  setShow(true);
  setIndex(index); 
}

//show reply box if user clicks "reply button"
const handleShowReplyBox = (index) => {

  const values = [...inputFields];

  if(values[index].anonymous || !values[index].from) {
    setTitle('anonyymi');
  } else {
    console.log(values[index].from);
    setTitle(values[index].from.name);
  }

  setShowReplyBox(true);
  setIndex(index); 
}

const [user, setUser] = useState({
  name: '',
  email: '',
  password: '',
  password2: '',
  errors: {}
});

//store all the fetched messages for the user
const [messages, setMessages] = useState({
  messages: []
});

//message fields
const [inputFields, setInputFields] = useState([
  { _id: '', from: { name: '', _id: ''}, plate: '', message: '', anonymous: true, createdAt: '' }
]);

const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);

const [isAuthenticated, setIsAuthenticated] = useState(false);
//use effect to fetch messages for the user when starting page
  useEffect(() => {
    //fetch me user and dispatch the content for UI
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const res = await userService.getUser();
        setUser(res.user);

        const res2 = await messageService.getMessages();

        //get car details array
        //remember to retains the previous vehicles also

        setMessages({
          messages: res2
        });

        setInputFields(res2);

        //Autosubscribe to push notification if type is GRANTED
        const browserSub = await getRegistrationsFromBrowser();
        let userSubs;
         if(browserSub) {
          userSubs = await pushService.getSubscriptionForUser(browserSub.subscription);

            if(!userSubs.subscription) {

              //'USER NOT subscribed in db, but has subs object in browser'
              if (isNotificationsGranted()) {
                try {
                  userSubs = await pushService.subscribe(browserSub.subscription, browserSub.platform, browserSub.userAgent);
                } catch (e) {
                  console.log(e);
                }
              }
            }
          } else {
            console.log('USER NOT subscribed in browser');
          }


      } catch (e) {
        setIsError(true);
        if(e.response.status === 401) {
          toaster.notify(`Sessio vanhentunut, kirjaudu uudelleen sisään: `, {
            duration: 5000
          });
        }
        props.props.history.push('/signin');
      }
      setIsLoading(false);
    }

    fetchData();
}, []);


//handle sending reply message 
const handleReplySubmit = async (e) => {

  e.preventDefault();
  setSubmitted(true);
     
  if(message.message) {

    const reply = {}; 
    reply.message = message.message
    if(inputFields[index].from) {
      reply.to = inputFields[index].from._id
    } else {
      toaster.notify(`Viestiä ei voitu lähettää, vastaanottaja poistanut tilin`, {
        duration: 5000
      });
      return;
    }

    try {
      //if user is authenticated, can send any message
        await messageService.replyMessage(reply);
      toaster.notify(`Viesti lähetetty käyttäjälle`, {
        duration: 5000
      });
      resetInputField();
        //use props to keep on this page
    } catch (e) {
      if(e.response.status === 403) {
          toaster.notify(`Jotain meni vikaanä`, {
            duration: 5000
          });
      }
      if(e.response.status === 401) {
        toaster.notify(`Sessio vanhentunut, kirjaudu uudelleen sisään: `, {
          duration: 5000
        });
        props.props.history.push('/signin');
      }
    }
  }
};

//reset message sending form
const resetInputField = () => {

  setSubmittedOK(true);
  setMessage({
    message: '',
    to: ''
  });
};

// handle removing message
const handleRemoveFields = async (index) => {

  const values = [...inputFields];
  const id = values[index]._id;
  try {

    if(id) {
      await messageService.deleteMessage(id);
      toaster.notify(`Viesti poistettu onnistuneesti`, {
        duration: 5000
      });
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


const getName = (fromObject, index) => {
  const obj = fromObject.from;
  if(obj) {
    //console.log(obj.name);
    return obj.name;
  }

  //check if the account has been removed, from object is null
  //set the from as anynymous so that the messages cannot be replied anymore
  const values = [...inputFields];  
  values[index].anonymous = true;
  setInputFields(values);

  return 'anonyymi';
}


//handle reply message input fields
const handleMessageInput = (e) => {

  setMessage({
     ...message,
     [e.target.name]: e.target.value
 });

};

//confirm modal to remove message from "inbox"
function ConfirmModal() {
  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal show={show} onHide={handleClose} animation={false} backdrop="static" keyboard={ false }
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
        <Modal.Header closeButton>
          <Modal.Title>Poista Viesti?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Haluatko varmasti poistaa tämän viestin käyttäjältä: {title}?
        </Modal.Body>
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


const removeButton = function (index) {

    return (
      <button
        className="btn btn-light btn-sm"
        type="button"
        onClick={() => handleShow(index)}
        >
        Poista
      </button>
    )
};
const replyButton = function (index, enabled) {

  if(enabled) {
    return (
      <button
       className="btn btn-primary btn-sm"
       type="button"
       onClick={() => handleShowReplyBox(index)}
       > Vastaa </button>
    )
  }
  return (
    <button className="btn btn-primary btn-sm" type="button" disabled> Vastaa </button>
  )
}


  return (
    <div className="messages">
      {isError && <div>Something went wrong, could not fetch userdata, please login ...</div>}
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <div>
        {/* <h2>Käyttäjätiedot debug:</h2>
        <h3>Nimi: {user.name}</h3>
        <h4>Email: {user.email}</h4>
        <p>id: {user.id}</p>
        <p>error: {error}</p>
        <p>messages data: {JSON.stringify(messages)}</p>
        <p>isauth:{isAuthenticated.toString()}</p> */}

        <div>
    <ConfirmModal/>
    {/* <ReplyMessageModal/> */}

    <Modal show={showReplyBox} onHide={handleCloseReply} animation={false} backdrop="static"  
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
        <Modal.Header closeButton>
          <Modal.Title>Lähetä viesti käyttäjälle: {title}</Modal.Title>
        </Modal.Header>
        <form>
          <Modal.Body>
            <div className="form-group">
                <textarea
                    type="text"
                    maxLength = "2000"
                    rows="5"
                    id="message"
                    placeholder="Lähetä viesti käyttäjälle"
                    // className="form-control"
                    name="message"
                    autoFocus
                    onChange={ handleMessageInput }
                    //onChange={event => setTxtLetter(event)}
                    value={ message.message }
                    className={'form-control' + (submitted && !message.message ? ' is-invalid' : '')}
                />
                {submitted && !message.message && 
                <div className="invalid-feedback">Viesti puuttuu</div>}
            </div>

            {/* todo: näytä teksti että käyttäjä näkee vain sun nimen/nimimerkin? */}
        </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseReply}>
              Peruuta
            </Button>
            <Button variant="primary" onClick={(e) => handleReplyOK(e)}>
              Lähetä
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

    </div>
      <div className="container" style={{ marginTop: '25px', 'maxWidth': '400px'}}>

      {/* <div>
          <Chat user={this.user}
              messages={this.state.messages}
              onMessageSend={this.addNewMessage}
              width={400}
              messageTemplate={MessageTemplate}>
          </Chat>
      </div> */}

          {/* <h2 style={{marginBottom: '40px'}}>Tili tiedot</h2> */}       

          <div>
            <h1>Saapuneet Viestit</h1>
            
            <button 
             className="btn btn-primary btn-sm"
             type="button" 
             onClick={() => window.location.reload(false)}>Päivitä
             </button>
            <br/>
            {!isNotificationsGranted() ? (
            <div>
              <p>Huom: Push Notifikaatiot on estetty tälle selaimelle, katso <Link to="/me">asetukset</Link>  </p>
            </div>) : '' }
            <br/>
            {/* todo: show how many messages, and how many new messages
            todo: check if user has disabled subscriptions and if yes, show button to take to the settings */}
{/* https://dev.to/fuchodeveloper/dynamic-form-fields-in-react-1h6c */}

        <div className="messages">
          {inputFields.length === 0 ? 'Ei viestejä' : ''}
          {inputFields.map((inputField, index) => (
            <Fragment key={`${inputField}~${index}`}>

              {/*<p>Viesti käyttäjältä: {inputField.anonymous ? 'anonyymi': getName(inputField, index)}</p>
              <p>Ajoneuvollesi: {inputField.plate}</p>
              <p>Viesti: {inputField.message}</p>
              <p>Lähetetty: {inputField.createdAt}</p>
              <p>Anonyymi: {JSON.stringify(inputField.anonymous)}</p> */}
              {/* <Card style={{ width: '40rem' }}> */}
              <Card bg="light">
                <Card.Header >
                  <Container fluid="false">
                    <Row>
                      <Col>Lähettäjä: <b>{inputField.anonymous ? 'anonyymi': getName(inputField, index) }</b></Col>
                      
                      <Col>
                      {/* //todo: use clock icon */}
                        <Moment locale="fi" fromNow>{inputField.createdAt}</Moment>
                      </Col>
                    </Row>
                  </Container>  
                </Card.Header>
                <Card.Body>
                  {/* <Card.Title>title</Card.Title> */}

                  <Card.Subtitle className="mb-2 text-muted">
                    {(inputField.plate === '') ? '': `Autollesi: ${inputField.plate}`  }
                  </Card.Subtitle>

                  <Card.Text>
                    {inputField.message}
                  </Card.Text>
                  
                  </Card.Body>
                   <Card.Footer>
                  { removeButton(index) }

                  {/* <Card.Link href="#">Poista</Card.Link> */}
                  {inputField.anonymous ? replyButton(index, false): replyButton(index, true)  }

                </Card.Footer>
              </Card>
              {/* {inputField.showReplyBox ? messageForm(index) : ''  } */}
            
              {/* todo: add confirmation modal */}
              {/* <div className="form-group">
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => handleShow(index)}
                >
                  Poista
                </button> */}
                {/* invoke store only if ther are changed to the vehicle data */}
                {/* {inputField.modified ? sendMessageButton(index) : (<button className="btn btn-link" type="button" disabled={ !inputField.modified }> Vastaa </button>) } */}

              {/* </div> */}
                <hr></hr>
            </Fragment>
          ))}
        </div>
        {/* Lähetä uusi viesti */}
        {/* { inputFields.length >= 5 ? (<button className="btn btn-link" type="button" disabled={true} onClick={() => handleAddFields()}>Lisää uusi auto (max 5) </button>) :  (<button className="btn btn-link" type="button" onClick={() => handleAddFields()}>Lisää uusi auto </button>) } */}
        <br/>
        {/* <pre>
          {JSON.stringify(inputFields, null, 2)}
        </pre> */}

          </div>

      </div>
      </div>
      )}

    </div>
  );
};


export default Messages;