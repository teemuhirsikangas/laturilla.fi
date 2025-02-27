import { useState } from "react";
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import toaster from 'toasted-notes' 
import 'toasted-notes/src/styles.css';

const Login = (props) => {

    const [inputs, setInputs] = useState({
        email: '',
        password: '',
        errors: {}
    });
    const [submitted, setSubmitted] = useState(false);
    const { email, password } = inputs;
    let loggingIn;

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        
        if(email && password) {
        const user = {email, password};

            try {
                // store user to db
                let res = await userService.login(user);
                const { token } = res;
                await props.login(token);
                props.props.history.push('/');

            } catch (e) {

                if(e.response.status === 401) {
                    toaster.notify(`Käyttäjätunnus tai salasana väärä`, {
                    duration: 5000
                    });
                } else if (e.response.status === 400) {
                    toaster.notify(`Käyttäjätunnus tarvitsee olla email osoite`, {
                    duration: 5000
                    });
                } else {
                    toaster.notify(`Odottamaton virhe tapahtui, kokeile myöhemmin uudestaan`, {
                        duration: 5000
                    });
                }
            }
        }
    }

    return (
        <div className="container" style={{ marginTop: '25px', 'maxWidth': '450px'}}>
            <h2>Kirjaudu sisään</h2>
            <form name="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Käyttäjätunnus (email)</label>
                    <input type="text" name="email" autoComplete="username" autoFocus value={email} onChange={handleChange} className={'form-control' + (submitted && !email ? ' is-invalid' : '')} />
                    {submitted && !email &&
                        <div className="invalid-feedback">Käyttäjätunnus puuttuu</div>
                    }
                </div>
                <div className="form-group">
                    <label>Salasana</label>
                    <input type="password" name="password" autoComplete="current-password" value={password} onChange={handleChange} className={'form-control' + (submitted && !password ? ' is-invalid' : '')} />
                    {submitted && !password &&
                        <div className="invalid-feedback">Salasana puuttuu</div>
                    }
                </div>
                <div className="form-group">
                    <button className="btn btn-primary">
                        {loggingIn && <span className="spinner-border spinner-border-sm mr-1"></span>}
                        Kirjaudu sisään
                    </button>
                    <Link to="/signup" className="btn btn-link">Luo tili</Link>
                </div>
                <Link to="/forgotpw" className="btn btn-link">Unohtuko salasana?</Link>
                
            </form>
        </div>
    );
}

export default Login