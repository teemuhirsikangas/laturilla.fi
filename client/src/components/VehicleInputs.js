const VehicleInputs = (props) => {

    const onChangeValue = event => {
        props.handleVehicleInputChange(event);
      };

    return (
    props.vehicles.map((val, idx)=> {
      let vehicleId = `vehicle-${idx}`, ageId = `Kuvaus-${idx}`
      return (
        <div key={idx}>
          <label htmlFor={vehicleId}>{`Ajoneuvo #${idx + 1}`}</label>
          <input
            type="text"
            name={vehicleId}
            data-id={idx}
            id={vehicleId}
            value={props.vehicles[idx].plate} 
            onChange={onChangeValue}
            className="plate"
          />
          <label htmlFor={ageId}>Kuvaus</label>
          <input
            type="text"
            name={ageId}
            data-id={idx}
            id={ageId}
            value={props.vehicles[idx].description} 
            className="description"
          />
        <button type="button" onClick={onChangeValue} >
          Clear Array
        </button>

        </div>
      )
    })
  )
}
export default VehicleInputs