import { useState } from "react";
import messageService from '../services/messageService';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';

//class Register extends Component {
const Forgotpw = ({ props},) => {

  const [inputs, setInputs] = useState({
    email: '',
    errors: {}
  });
  const [submitted, setSubmitted] = useState(false);
  const [linksend, setLinksend] = useState(true);

  function handleChange(e) {
      const { name, value } = e.target;
      setInputs(inputs => ({ ...inputs, [name]: value }));
      setLinksend(false);
      setSubmitted(false);
  }

  async function handleSubmit(e) {
      e.preventDefault();
      setSubmitted(true);
      setLinksend(true);

      if(inputs.email) {

          try {
              messageService.sendResetEmail({ email: inputs.email });
          } catch (e) {
            toaster.notify(`Odottamaton virhe tapahtui, kokeile myöhemmin uudestaan`, {
                duration: 5000
            });
          }
      }
  }

  return (
    <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>
        <h2>Ongelmia sisäänkirjautumisessa?</h2>
        <p>Anna sähköpostiosoitteesi. Lähetämme linkin (voimassa 24h), jonka avulla pääset kirjautumaan takaisin tilillesi</p>
        <form name="form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Käyttäjätunnus (email)</label>
                <input type="email" name="email" autoComplete="username" autoFocus value={inputs.email} onChange={handleChange} className={'form-control' + (submitted && !inputs.email ? ' is-invalid' : '')} />
                {submitted && !inputs.email &&
                    <div className="invalid-feedback">Käyttäjätunnus puuttuu</div>
                }
            </div>
            <div className="form-group">
                <button 
                  className="btn btn-primary"
                  disabled={ linksend } >
                    Lähetä salasanan vaihtolinkki
                </button>
            </div>
        </form>
        <br/>
        <br/>
        {submitted ? (<h4>Jos käyttäjätunnus löytyy järjestelmästä, Salasananvaihto linkki on lähetetty sähköpostiisi: {inputs.email}</h4>) : ('')}
      </div>
    );
  
};

export default Forgotpw;