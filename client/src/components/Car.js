import { useState } from 'react';
import messageService from '../services/messageService';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';
import Card from 'react-bootstrap/Card';
import Moment from 'react-moment';
import { Link } from "react-router-dom";

const Car = ({ car, isAuthenticated, props }) => {

  const [message, setMessage] = useState({
    message: '',
    plate: car.plate
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedOK, setSubmittedOK] = useState(false);

  const handleMessageInput = (e) => {

    setMessage({
       ...message,
       [e.target.name]: e.target.value
   });
 };

  const resetInputField = () => {
    setSubmittedOK(true);
    setMessage({
      message: '',
      plate: car.plate
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitted(true);
     
  if(message.message) {
  
    try {
      //if user is authenticated, can send any message
      if(isAuthenticated) {
        await messageService.sendMessage(message);
      } else {
        // if not logged in, send anon message if it's allowed by user
        await messageService.sendMessageAnon(message);
      }
      toaster.notify(`Viesti lähetetty käyttäjälle`, {
        duration: 5000
      });
    resetInputField();

    } catch (e) {

        if(e.response.status === 403) {
            toaster.notify(`Käyttäjätunnus on jo käytössä`, {
              duration: 5000
            });
        }

        if(e.response.status === 401) {
          toaster.notify(`Sessio vanhentunut, kirjaudu uudelleen sisään: `, {
            duration: 5000
          });
          props.history.push('/signin');
        }

      }
  }
}

  const messageForm = (
    <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>
    {!submittedOK && (
      <form onSubmit={ handleSubmit }>
        <div>
            <div className="form-group">
                <textarea
                    type="text"
                    maxLength = "2000"
                    rows="5"
                    id="message"
                    placeholder="Lähetä viesti käyttäjälle"
                    // className="form-control"
                    name="message"
                    onChange={ handleMessageInput }
                    value={ message.message }
                    className={'form-control' + (submitted && !message.message ? ' is-invalid' : '')}
                />
                {submitted && !message.message && 
                <div className="invalid-feedback">Kuvaus puuttuu</div>}
            </div>
        </div>
        <div className="form-group">
                <button type="submit" className="btn btn-primary"> Lähetä </button>
                {/* <input type="submit" value="Rekisteröi" /> */}

            </div>
      </form>
    )}
    </div>
);

  return (
      <div>
      {/* <h3>{JSON.stringify(car)}</h3> */}
     {/* set color to #e9ecef; */}
    <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>
    {/* <div id={'divRef'} ref={divRef} />; */}
    <Card bg="light">
        <Card.Header>Käyttäjä: <b>{car.user.name}</b> </Card.Header>
           <Card.Body>
           {/* <Card.Title>title</Card.Title> */}
              <Card.Subtitle className="mb-2 text-muted">Yleinen kuvaus:</Card.Subtitle>
              <Card.Text>
                {car.user.description}
              </Card.Text>
           </Card.Body>

      </Card>
      <hr/>
     <Card bg="light">
        <Card.Header>Rekisterinumero: <b>{car.plate}</b> </Card.Header>
           <Card.Body>
           {/* <Card.Title>title</Card.Title> */}
              {/* <Card.Subtitle className="mb-2 text-muted">Käyttäjän jättämä kuvaus:</Card.Subtitle> */}
              <Card.Text>
                {car.description}
              </Card.Text>
           </Card.Body>
           <Card.Footer>
             <small className="text-muted">Viestiä päivitetty <Moment fromNow>{car.updatedAt}</Moment></small>
           </Card.Footer>
      </Card>
    </div>
     <br></br>
      { car.allowAnnonMsg || isAuthenticated ? messageForm : <p>Käyttäjä ei salli nimettomiä viestejä, <Link to="/signin">Kirjaudu sisään</Link></p> }
      {/* <p>{ car.allowAnnonMsg ? "Lähetä viesti tästä" : "" }</p> */}
      {/* <p>userID: {JSON.stringify(car)}</p> */}
      {/* <span></span> */}
      </div>
  );
};

        // <li key={car._id} className="list__item plate">
        //   <p className="plate__desc">Rekisterinumero:</p>
        //   <h3 className="plate__plate">{car.plate}</h3>
        //   <p className="plate__description">Kuvaus:{car.description}</p>
        // </li>


export default Car;