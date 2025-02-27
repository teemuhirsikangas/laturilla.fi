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

  //fetch me user and dispatch the content for UI
  const fetchData = async () => {
    setIsError(false);
    setIsLoading(true);

    //fetch the email reset uuid here'
    try {
      const res = await messageService.getEmailUuid(props.match.params.pwId);

      if(res.type !== 'RESET') {
        // must be RESET type
        setIsError(true);
      }

    } catch (e) {
      setIsError(true);
    }


    setIsLoading(false);
  };

  fetchData();
  //run during unmount:
}, []);

//password change
  const [password, setPassword] = useState({
    passwordNew: '',
    passwordNew2: ''
  });

  const [submittedPw, setSubmittedPw] = useState(false);

    const handleChangePw = (e) => {
      setPassword({
          ...password,
          [e.target.name]: e.target.value
      });
  };

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
          password: password.passwordNew,
          uuid: props.match.params.pwId
        }

        try {
          await userService.changeForgotPassword(passwordRequest);
          toaster.notify(`Salasana vaihdettu onnistuneesti`, {
            duration: 5000
          });

          setPassword({
            passwordNew: '',
            passwordNew2: '',
          });
          setSubmittedPw(false);
          props.history.push('/signin');

        } catch (e) {
      
          if(e.response.status === 400) {
            toaster.notify(`Salasanan tarvitsee olla vähintään 8 merkkiä pitkä`, {
              duration: 5000
            });
          } else if(e.response.status === 409) {
            toaster.notify(`salasanaa ei voitu vaihtaa, tee uusi salasananpyynto email`, {
              duration: 5000
            });
          } else {
            toaster.notify(`virhe, salasanaa ei voitu vaihtaa, kokeile myöhemmin uudestaan, tai tee uusi salasanan nollaus pyynto`, {
              duration: 5000
            });
          }
        }
      }

    const componentWillReceiveProps = (nextProps) => {
        if(nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
        }
    };

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
            <h2 style={{marginBottom: '40px'}}>Vaihda uusi salasana</h2>

            {isError ? (<div>Tämä Salasanan vaihtolinkki on vanhentunut (voimassa 24h) tai jo kertaalleen käytetty. <hr/> <p> Voit pyytää uuden salasanavaihtolinkin <Link to="/forgotpw">tästä</Link></p></div>) : (

            <form onSubmit={ handleSubmitPw }>
                <div className="form-group">
                    <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Uusi Salasana"
                    name="passwordNew"
                    onChange={ handleChangePw }
                    value={ password.passwordNew }
                    className={'form-control' + (submittedPw && !password.passwordNew ? ' is-invalid' : '')}
                    />
                    {submittedPw && !password.passwordNew && 
                    <div className="invalid-feedback">Salasana puuttuu</div>}
                </div>
                
                <div className="form-group">
                    <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Vahvista uusi salasana"
                    name="passwordNew2"
                    onChange={ handleChangePw }
                    value={ password.passwordNew2 }
                    className={'form-control' + (submittedPw && !password.passwordNew2 ? ' is-invalid' : '')}
                    />
                  {submittedPw && !password.password2 && 
                  <div className="invalid-feedback">Salasana puuttuu</div>}
                </div>
                <br></br>
                <div className="form-group">
                    <button type="submit" className="btn btn-primary"> Tallenna </button>
                    {/* <input type="submit" value="Rekisteröi" /> */}

                </div>
            </form>
            )}
            </div>
            )}
        </div>
        
    )};

export default Changepw;