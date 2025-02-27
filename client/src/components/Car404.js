const Car404 = ({ searchValueCopy }) => {
  return (
    <div className="car404">
      <h2>Rekisterinumeroa <b>{searchValueCopy}</b> ei löytynyt.</h2>
      <p>Käyttäjä ei ole vielä rekisteröitynyt palveluun</p>
      
      <span></span>
    </div>
  );
};

export default Car404;