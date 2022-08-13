const express = require('express')
const router = express.Router();
const {getDpts} = require('../controllers/departments')

router.get('/', getDpts);

module.exports = router