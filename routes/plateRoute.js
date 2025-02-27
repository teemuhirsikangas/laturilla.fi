const mongoose = require('mongoose');
const Plates = mongoose.model('plates');

module.exports = (app) => {

  app.get(`/api/plate`, async (req, res) => {
    let Plate = await Plates.find();
    return res.status(200).send(Plate);
  });


  app.get(`/api/plate/:plate`, async (req, res) => {
    const { plate } = req.params;

    // check indexes for the plateSearch
    let Plate
    const timestamp = new Date().toISOString();
    console.log(`search: ${plate}  | ${timestamp}`);
    if( plate.includes('-')) {
      Plate = await Plates.findOne({plate}).select("-__v").select("-_id").select("-createdAt").populate('user', ['name', 'description']);
    } else {
      Plate = await Plates.findOne({plateSearch: plate}).select("-__v").select("-_id").select("-createdAt").populate('user', ['name', 'description']);
    }

    return res.status(200).send(Plate);
  });

  app.put(`/api/plate/:id`, async (req, res) => {
    const {id} = req.params;

    let Plate = await Plates.findByIdAndUpdate(id, req.body);

    return res.status(202).send({
      error: false,
      Plate
    })

  });

  app.delete(`/api/plate/:id`, async (req, res) => {
    const {id} = req.params;

    let Plate = await Plates.findByIdAndDelete(id);

    return res.status(202).send({
      error: false,
      Plate
    })

  })

}