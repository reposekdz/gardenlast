const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academicYearController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const ADMINS = ['admin', 'director', 'dod', 'director_of_discipline', 'accountant', 'registrar'];
const READ   = ['admin', 'director', 'dod', 'director_of_discipline', 'accountant', 'registrar', 'teacher'];

// Read
router.get('/',                verifyToken, verifyRole(READ),   ctrl.listYears);
router.get('/current',         verifyToken, verifyRole(READ),   ctrl.getCurrentYear);
router.get('/ladder',          verifyToken, verifyRole(READ),   ctrl.getLadder);
router.get('/promotions',      verifyToken, verifyRole(READ),   ctrl.listPromotions);
router.get('/graduates',       verifyToken, verifyRole(READ),   ctrl.listGraduates);
router.get('/:id',             verifyToken, verifyRole(READ),   ctrl.getYear);
router.get('/:id/preview-close', verifyToken, verifyRole(ADMINS), ctrl.previewClose);

// Write
router.post('/',               verifyToken, verifyRole(ADMINS), ctrl.createYear);
router.post('/:id/set-current',verifyToken, verifyRole(ADMINS), ctrl.setCurrent);
router.post('/:id/close',      verifyToken, verifyRole(ADMINS), ctrl.closeYear);

// Year admin management
router.delete('/:id',               verifyToken, verifyRole(ADMINS), ctrl.deleteYear);
router.put('/:id',                  verifyToken, verifyRole(ADMINS), ctrl.editYear);
router.post('/:id/reopen',          verifyToken, verifyRole(ADMINS), ctrl.reopenYear);
router.get('/:id/admin-details',    verifyToken, verifyRole(ADMINS), ctrl.getAdminDetails);
router.get('/:id/terms/:termId/details', verifyToken, verifyRole(ADMINS), ctrl.getTermDetails);

// Terms
router.get('/terms/active',             verifyToken, verifyRole(['admin', 'accountant']), ctrl.listActiveTerms);
router.put('/:yearId/terms/:termId',     verifyToken, verifyRole(ADMINS), ctrl.updateTerm);
router.post('/:yearId/terms/:termId/end',verifyToken, verifyRole(ADMINS), ctrl.endTerm);

module.exports = router;
