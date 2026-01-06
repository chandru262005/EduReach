import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { validateRequest, userValidators } from '../validators/authValidators';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', userValidators.createUser, validateRequest, createUser);
router.put('/:id', userValidators.updateUser, validateRequest, updateUser);
router.delete('/:id', deleteUser);

export default router;
