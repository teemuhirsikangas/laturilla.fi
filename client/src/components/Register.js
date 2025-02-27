import { useState } from 'react';
import userService from '../services/userService';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';

//class Register extends Component {
const Register = (props) => {

    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
        errors: {}
    });

    const [vehicle, setVehicle] = useState({
        plate: '',
        description: '',
        allowAnnonMsg: true
    });

    const [annonMsg, setAnnonMsg] = useState({
        checked: true
    })


    const [submitted, setSubmitted] = useState(false);

    //button if vehicle data is saved also
    const [state, setState] = useState({
        checked: true
    });

    const handleSwitchChange = (e) => {
        setState({
            checked: e.target.checked
        });
      }

      const handleSwitchChangeAnnonMsg = (e) => {

        setAnnonMsg({
            checked: e.target.checked
        });
      }

    const handleInputChange = (e) => {

        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };



    const handleInputChangeVehicle = (e) => {

        let value;
        if(e.target.name === 'plate') {
            value = e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]+/g, "-");
        } else {
            value = e.target.value
        }

        setVehicle({
            ...vehicle,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const newUser = {
            name: user.name,
            email: user.email,
            password: user.password,
            password2: user.password2
        }
        //Add new car if user has chosen it
        let newVehicle = {};
        if(state.checked) {
            newVehicle.plate = vehicle.plate;
            newVehicle.description = vehicle.description; //not mandatory
            newVehicle.allowAnnonMsg = annonMsg.checked;
        }

        const signupRequest = {
            user: newUser,
            vehicle: newVehicle
        }

        if (user.name && user.email && user.password && user.password2) {
        
            if(user.password !== user.password2) {
                toaster.notify(`Salasanat eivät täsmää`, {
                    duration: 5000
                  });
                  return;
            }
            try {
                const res = await userService.signup(signupRequest);
                const { token } = res
                props.register(token);
                resetInputField();
                toaster.notify(`Lähetimme sähköpostia osoitteeseen ${user.email} jolla voit aktivoida tilisi`, {
                    duration: 7000
                  });
                toaster.notify(`Tili luotu onnistuneesti, voit täydentää tietoja asetukset sivulta`, {
                    duration: 7000
                  });
                props.history.push('/me');

            } catch (e) {
                if(e.response.status === 401) {
                    toaster.notify(`Käyttäjätunnus on jo käytössä`, {
                      duration: 5000
                    });
                }
                else if(e.response.status === 400) {
                    toaster.notify(e.response.data.message, {
                      duration: 5000
                    });
                }
                else if(e.response.status === 409) {
                    toaster.notify('Rekisterinumero on jo käytössä, käytä toista rekisterinumeroa tai ilmoita ylläpidolle', {
                        duration: 5000
                    });

                } else {
                    toaster.notify(`odottamaton virhe, kokeile myöhemmin uudestaan`, {
                      duration: 5000
                    });
                }
            }
        }
            
    };

    const resetInputField = () => {
        setUser({});
      };

    const componentWillReceiveProps = (nextProps) => {
        if(nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
        }
    };
// todo: description field bigger, enter changes LC, not to select register button!
    const vehicleForm = (
        <div>
            <div className="form-group">
                <input
                type="text"
                maxLength = "12"
                minLength = "3"
                placeholder="Auton rekisterinumero esim: ABC-123"
                name="plate"
                onChange={ handleInputChangeVehicle }
                value={ vehicle.plate }
                className={'form-control' + (submitted && (!vehicle.plate || !vehicle.plate.includes('-')) ? ' is-invalid' : '')}
                />
                {submitted && !vehicle.name && (!vehicle.plate || !vehicle.plate.includes('-')) &&
                <div className="invalid-feedback">rekisterinumero puuttuu tai on virheellinen</div>}
            </div>
            <div className="form-group">
                <textarea
                    type="text"
                    maxLength = "2000"
                    rows="5"
                    id="description"
                    placeholder="esim. kuvaus autosta, tarkemmat yhteystiedot, mitä vain tietoa haluat välittää jotka etsivät tällä rekisterinumerolla"
                    name="description"
                    onChange={ handleInputChangeVehicle }
                    value={ vehicle.description }
                    className={'form-control' + (submitted && !vehicle.description ? ' is-invalid' : '')}
                />
                {submitted && !vehicle.description && 
                <div className="invalid-feedback">Kuvaus puuttuu puuttuu</div>}
            </div>
            <label>Salli anonyymit viestit? (viestit käyttäjiltä jotka eivät ole kirjautuneet palveluun)</label>
            <div className='toggle-switch small-switch'>
                <input
                type='checkbox'
                className='toggle-switch-checkbox'
                name='toggleSwitch2'
                id='toggleSwitch2'
                checked={annonMsg.checked}
                onChange={handleSwitchChangeAnnonMsg}
                readOnly
                />
                <label className="toggle-switch-label" htmlFor="toggleSwitch2">
                    <span className="toggle-switch-inner" data-yes="Kyllä" data-no="Ei"></span>
                    <span className="toggle-switch-switch"></span>
                </label>
            </div>
            <br></br>
            <hr></hr>
            <label>Huom!: Voit lisätä useampia ajoneuvoja ja muita tietoja rekisteröitymisen jälkeen</label>

        </div>
    );

    return(
        
    <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>
        {/* <div>
        <h2>debug:</h2>
        <h3>Nimi: {user.name}</h3>
        <h4>Email: {user.email}</h4>
        <p>BUTTON: {state.checked.toString()}</p>
        <p>BUTTON2: {annonMsg.checked.toString()}</p>
        <p></p>
        </div> */}
        <h2 style={{marginBottom: '40px'}}>Rekisteröi tili</h2>
        <form onSubmit={ handleSubmit }>
            <div className="form-group">
                <label>Käyttäjätunnus/sähköpostiosoite (ei näy muille käyttäjille)</label>
                <input
                type="email"
                autoFocus
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
            <label>Nimi / Nimimerkki (Julkinen)</label>
            <div className="form-group">
                <input
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
                <input
                type="password"
                autoComplete="new-password"
                placeholder="Salasana"
                name="password"
                onChange={ handleInputChange }
                value={ user.password }
                className={'form-control' + (submitted && !user.password ? ' is-invalid' : '')}
                />
                {submitted && !user.password && 
                <div className="invalid-feedback">Salasana puuttuu</div>}
            </div>
            
            <div className="form-group">
                <input
                type="password"
                autoComplete="new-password"
                placeholder="Vahvista salasana"
                name="password2"
                onChange={ handleInputChange }
                value={ user.password2 }
                className={'form-control' + (submitted && !user.password2 ? ' is-invalid' : '')}
                />
               {submitted && !user.password2 && 
               <div className="invalid-feedback">Salasana puuttuu</div>}
            </div>
            <label>Tallenna auton tiedot samalla</label>
            <br></br>
            <div className='toggle-switch'>
                
                <input
                type='checkbox'
                className='toggle-switch-checkbox'
                name='toggleSwitch'
                id='toggleSwitch'
                checked={state.checked}
                onChange={handleSwitchChange}
                readOnly
                />
                <label className="toggle-switch-label" htmlFor="toggleSwitch">
                    <span className="toggle-switch-inner" data-yes="Kyllä" data-no="Ei"></span>
                    <span className="toggle-switch-switch"></span>
                </label>
            </div>
            <br></br>
            <br></br>

            {state.checked ? vehicleForm : 'Ajoneuvot voit lisätä rekisteröitymisen jälkeenkin'}
            <br></br>
            <br></br>
            <div className="form-group">
                <button type="submit" className="btn btn-primary"> Rekisteröi </button>
                {/* <input type="submit" value="Rekisteröi" /> */}

            </div>
        </form>
    </div>
    )
};

export default Register;