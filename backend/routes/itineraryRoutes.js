import express from 'express';
import {
  createItinerary,
  getItinerary,
  getUserItineraries,
  exportPDF,
  addActivity,
  removeActivity,
  updateActivity,
  updateDay,
  regenerateDay,
  generatePackingList,
  deleteItinerary
} from '../controllers/itineraryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware); // Protect all itinerary routes

router.post('/generate', createItinerary);
router.get('/:id', getItinerary);
router.delete('/:id', deleteItinerary);
router.get('/user/:userId', getUserItineraries);
router.post('/export-pdf', exportPDF);
router.post('/:id/activity', addActivity);
router.delete('/:id/activity/:dayIndex/:activityIndex', removeActivity);
router.put('/:id/activity/:dayIndex/:activityIndex', updateActivity);
router.put('/:id/day/:dayIndex', updateDay);
router.post('/:id/regenerate-day', regenerateDay);
router.post('/:id/packing-list', generatePackingList);

export default router;
