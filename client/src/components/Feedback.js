import { useState } from 'react';
import messageService from '../services/messageService';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';

const Feedback = ({ isAuthenticated, props } ) => {

  const [message, setMessage] = useState({
    message: '',
    email: '',
    check: ''
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
      email: '',
      check: ''
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitted(true);
     
  if(message.message && message.check.toLowerCase() === 'koira') {
  
    try {
      // send feedback email
      await messageService.sendFeedbackEmail(message);
      resetInputField();
      toaster.notify(`Palaute lähetetty`, {
        duration: 5000
      });

    } catch (e) {

      toaster.notify(`uups, jotain meni pieleen, kokeile uudestaan`, {
        duration: 5000
      });
      setSubmitted(false);
    }
  }
}

  const messageForm = (
    <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>
    {!submittedOK && (
      <form onSubmit={ handleSubmit }>
        <div>
        
        <div className="form-group">
            <input
            type="email"
            autoFocus
            autoComplete="username"
            placeholder="Sähköpostiosoite"
            name="email"
            onChange={ handleMessageInput }
            value={ message.email }
            className={'form-control' + (submitted && !message.email ? ' is-invalid' : '')}
            />
            {submitted && !message.email && 
            <div className="invalid-feedback">sähköpostiosoite puuttuu</div>}
          </div>

          <div className="form-group">
            <textarea
                type="text"
                maxLength = "2000"
                rows="5"
                id="message"
                placeholder="Palaute (max 2000merkkiä)"
                name="message"
                onChange={ handleMessageInput }
                value={ message.message }
                className={'form-control' + (submitted && !message.message ? ' is-invalid' : '')}
            />
              {submitted && !message.message && 
              <div className="invalid-feedback">Viesti puuttuu</div>}
          </div>
          <p>Robottifiltteri: Kirjoita koira alla olevaan kenttään</p>
          <div className="form-group">
            <input
            type="check"
            placeholder=""
            name="check"
            onChange={ handleMessageInput }
            value={ message.check }
            className={'form-control' + (submitted && message.check.toLowerCase() !== 'koira' ? ' is-invalid' : '')}
            />
            {submitted && message.check.toLowerCase() !== 'koira' && 
            <div className="invalid-feedback">vinkki: koira puuttuu</div>}
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
      <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>
      <div>
      {submitted ? <h2>Palaute lähetetty </h2>: 
        (<div>
          <h2>Ota yhteyttä</h2>
          <p>Voit myös antaa palautetta 
          <a href="https://github.com/teemuhirsikangas/laturilla.fi/issues" target="_blank" rel="noopener noreferrer"> Github Issues</a> sivulta </p>
        </div>) 
      }

      </div>
        {messageForm}
      </div>
    </div>
  );
};

export default Feedback;