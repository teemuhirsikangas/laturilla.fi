const Howto = () => {
  return (
    <div className="container" style={{ bottom: 0, alignSelf: "flex-end"}}>
      <br/>
      <h3>Kuinka palvelu toimii?</h3>
      <p>1. Hae käyttäjiä palvelusta rekisterinumerolla</p>
      <p>2. Voit lähettää viestin</p>
      <p>3. Rekisterinumeron käyttäjä saa sähköposti/push notifikaatioviestin jolla hän voi vasta sinulle. (Jos olet lähettänyt sisäänkirjautuneena) <br/> Vastaanottaja ei saa sinusta muuta tietoa kuin nimen/nimimerkkisi ja viestisi</p>
      <p> <a href="/about" target="_blank" rel="noopener noreferrer"> Lisää tietoa palvelusta</a> </p>
      <span></span>
    </div>
  );
};

export default Howto;