import { useState } from "react";

let placeholder = "ABC123";

const Search = (props) => {
  const [searchValue, setSearchValue] = useState("");
  
  const handleSearchInputChanges = (e) => {
    setSearchValue(e.target.value.toUpperCase());
    placeholder=e.target.value.toUpperCase();
  };

  const resetInputField = () => {
    setSearchValue("");
  };

  const callSearchFunction = (e) => {
    e.preventDefault();
    props.search(searchValue);
    resetInputField();
  }
// todo, min value
return (
      <form className="search">
        <input
          placeholder={placeholder}
          value={searchValue}
          minLength="2"
          onChange={handleSearchInputChanges}
          type="text"
        />
        {/* <input onClick={callSearchFunction} type="submit" value="Hae" /> */}
        <button onClick={callSearchFunction} type="submit" className="btn btn-primary"> Hae </button>
      </form>
    );
};

export default Search;