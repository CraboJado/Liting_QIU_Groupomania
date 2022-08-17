const express = require('express')
const router = express.Router();
const {getPositions} = require('../controllers/positions')

router.get('/', getPositions);

module.exports = router