import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userService from '../services/userService';
import messageService from '../services/messageService';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';

//class Register extends Component {
const Changepw = ({ props},) => {

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {

  // fetch me user and dispatch the content for UI
  const fetchData = async () => {
    setIsError(false);
    setIsLoading(true);

    // fetch the email reset uuid here
    try {
      const res = await messageService.getEmailUuid(props.match.params.id);

      if(res.type !== 'ONBOARD') {
        // must be RESET type
        setIsError(true);
      }

      try {
        await userService.confirmEmailAddress({ uuid: props.match.params.id });
        toaster.notify(`Tilisi on vahvistettu onnistuneesti`, {
          duration: 10000
        });
  
  
      } catch (e) {
          toaster.notify(`virhe, tiliä ei voitu vahvistaa, kokeile myöhemmin uudestaan, tai tee uusi tilinvahvistus pyynto asetuksista`, {
            duration: 5000
          });
        }

    } catch (e) {
      setIsError(true);
    }


    setIsLoading(false);
  };

  fetchData();
  //run during unmount:
}, []);
 

  return(

    <div className="changepw">
        
        {isLoading ? (
          <div>Loading ...</div>
        ) : (

      <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>

          {/* <div>
          <h2>debug:</h2>
          <h3>Nimi: {user.name}</h3>
          <h4>Email: {user.email}</h4>
          <p>BUTTON: {state.checked.toString()}</p>
          <p>BUTTON2: {annonMsg.checked.toString()}</p>
          <p></p>
          </div> */}
          {/* <p>change password here</p>
          <p>{props.match.params.pwId}</p>
          <p>change password here</p> */}
          <h2 style={{marginBottom: '40px'}}>Vahvista käyttäjätilisi</h2>


          {isError ? (<div>Tämä vahvista linkki on vanhentunut (voimassa 24h) tai jo kertaalleen käytetty. <hr/> <p> Voit pyytää uuden vahvistus sähköpostin tilisi  <Link to="/me">asetuksista</Link></p></div>) : (

              <div className="form-group">
                <h3>Tili vahvistettu onnistuneesti!</h3>

                  <br/>
                  <p>Voit asetukset sivulta mm. tilata sähköposti-ilmoitukset ja/tai push notifikaatiot puhelimeesi kun saat uusia viestejä muilta käyttäjiltä</p>
              </div>
          )}
          </div>
          )}
      </div>
      
  )};

export default Changepw;