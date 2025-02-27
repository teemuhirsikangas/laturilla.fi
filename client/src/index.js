import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './css/index.css';
import './css/toggleSwitch.css';
import './css/App.css';
import App from './components/App';
import configureStore from './store';
import { SW_INIT, SW_UPDATE } from './types';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const store = configureStore();

ReactDOM.render( <Provider store={store}>
                    <App/>
                 </Provider>, document.getElementById('root'));

serviceWorkerRegistration.register({
  onSuccess: () => store.dispatch({ type: SW_INIT }),
  onUpdate: registration =>
    store.dispatch({ type: SW_UPDATE, payload: registration }),
}); //for web-push

reportWebVitals(console.log);