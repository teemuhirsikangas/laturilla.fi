import { Jumbotron } from 'reactstrap';
import Alert from 'react-bootstrap/Alert';

const Header = () => {
  return (
    <header className="App-body">

      <Jumbotron>
      {/* <h2>{props.text}</h2> */}
         {/* <h1 className="display-3">Laturilla</h1> */}
         <p className="lead">Onko edellisellä käyttäjällä lataus valmis ja tarvitset paikkaa? Lähetä viesti käyttäjälle</p>
         {/* <hr className="my-2" /> */}
         {/* <p>Lähetä viesti</p> */}
         {/* <p className="lead"></p> */}
       </Jumbotron>
       <div>
        
        {/* <Offline>
          <Alert variant="danger">
            <Alert.Heading>Voi ei, verkkoyhteysongelma</Alert.Heading>
            <p>
              Verkkoyhteys näyttää olevan poikki. Tarkista että laitteesi on kytketty verkkoon.
              Haku ei toimi ennen kuin yhteys on korjaantunut
            </p>
          </Alert>
      </Offline> */}
       </div>

    </header>
  );
};

export default Header;