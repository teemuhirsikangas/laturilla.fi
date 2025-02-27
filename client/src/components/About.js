const About = () => {
  return (
    <div className="container" style={{ marginTop: '25px', 'maxWidth': '400px'}}>
      <h1>Laturilla.fi</h1>
      <p>Palvelun käyttötarkoitus on helpottaa viestien lähetystä ajoneuvojen käyttäjien välillä latauspaikoilla tai muualla asioidessa.
      Palvelun avulla käyttäjät voivat rekisteröidä ajoneuvonsa rekisterinumeron ja muut käyttäjät voivat lähettää viestejä heille. Käyttäjät eivät saa tietoon muista käyttäjistä kuin nimen/nimimerkin.<br/>
      Palvelu lähettää Push notifikaation kännykkään/selaimeen jokaisesta viestistä, jolloin kommunikaatio on nopeaa ja välitöntä.</p>
      <p>Miksi palvelu on tehty, kun vastaavia palveluita on jo olemassa?</p>
      <p>Palvelun on tarkoitus olla täysin kotimainen palvelu ja kaikki tiedot säilytetään suomalaisella palvelimella. Palvelu on helpompi räätälöidä suomalaiseen käyttöön Suomessa ajaville ihmisille. Palvelulla ei ole sidonnaisuuksia kansainvälisiin toimijoihin, jolloin käyttäjiä ei myöskään seurata ja yksityisyys on paremmit taattu.</p>
      <p>Voit myös lähettää palautetta 
     <a href="https://laturilla.fi/feedback" target="_blank" rel="noopener noreferrer"> Palaute</a> sivulta, tai
      <a href="https://github.com/teemuhirsikangas/laturilla.fi/issues" target="_blank" rel="noopener noreferrer"> Github Issues</a> sivulta </p>
      <p>V.{process.env.REACT_APP_VERSION} &copy;2021: <a href="https://teemu.hirsikangas.fi/" target="_blank" rel="noopener noreferrer">Teemu Hirsikangas</a> </p>
  
  <hr/>
  <h1>Tietosuojalauseke</h1>
  <h3>Käyttäjän antamat tai henkilökohtaisesti tunnistavat tiedot:</h3>
  <ul>
   <li>Nimi/nimimerkki</li>
   <li>Salasanatiiviste sekä käyttäjän yksilöivä tunnus</li>
   <li>Sähköpostiosoite</li>
   <li>Rekisterinumerot</li>
  </ul>
     
   <h3>Muuta tallennettua tietoa</h3>
  <ul>
    <li>Käyttäjän lähettämät viestit toisille käyttäjille, kunnes vastaanottaja sen poistaa</li>
    <li>Käyttäjän kirjoittama julkinen profiilikuvaus, tai ajoneuvon kuvaus rekisterinumerolle</li>
    <li>Selaimeen Cookie, sisältää vain tiedon kirjautumis sessiosta käyttää palvelua (id, käyttäjätunnus, nimi, session vahentumisaika). </li>
    <li>Käyttäjä voi ladata kaikki tietonsa JSON muodossa käyttäjätiedot sivulta </li>
  </ul>

  <h3>Tietojen poistaminen</h3>
     <ul>
     <li>Käyttäjä voi poistaa kaikki tiedot pysyvästi käyttäjätiedot sivulta </li>
     </ul>
     
  <h3>Muuta tietoa</h3>
     <p>Tiedot tallennetaan vain Suomen rajojen sisälle, pääsyä ei anneta muille toimitsijoille ja tietoa ei jaeta kenellekään.</p>
     <p>Tällä hetkellä sivut ovat myös mainosvapaat, eikä käyttäjiä seuraavia 3rd party kikkareita ole.</p>
  </div>
  
  );
};


export default About;