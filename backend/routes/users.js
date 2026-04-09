const router = require('express').Router();
const {
  getUserById,
  updateUserById,
  
} = require('../controllers/users');
const {
  updateUserAvatarValidate,
} = require('../validation');

router.get('/me', getUserById);
router.patch('/me', updateUserById);


module.exports = router;
