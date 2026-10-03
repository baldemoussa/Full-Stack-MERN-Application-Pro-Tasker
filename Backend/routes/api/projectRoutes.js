const router = require('express').Router();
const { authMiddleware } = require('../../utils/auth');
const projectController = require('../../controllers/projectController');
const taskController = require('../../controllers/taskController');

router.use(authMiddleware);

router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.post('/:projectId/tasks', taskController.createTask);
router.get('/:projectId/tasks', taskController.getAllTasks);
router.put('/:projectId/tasks/:taskId', taskController.updateTask);
router.delete('/:projectId/tasks/:taskId', taskController.deleteTask);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
