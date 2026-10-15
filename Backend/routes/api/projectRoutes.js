const router = require('express').Router();
const { authMiddleware } = require('../../utils/auth');
const projectController = require('../../controllers/projectController');
const taskController = require('../../controllers/taskController');
const commentController = require('../../controllers/commentController');

router.use(authMiddleware);

router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.post('/:id/collaborators', projectController.addCollaborator);
router.delete('/:id/collaborators/:userId', projectController.removeCollaborator);
router.put('/:id/close', projectController.closeProject);
router.put('/:id/archive', projectController.archiveProject);
router.put('/:id/reopen', projectController.reopenProject);
router.post('/:projectId/tasks', taskController.createTask);
router.get('/:projectId/tasks', taskController.getAllTasks);
router.put('/:projectId/tasks/:taskId', taskController.updateTask);
router.delete('/:projectId/tasks/:taskId', taskController.deleteTask);
router.get('/:projectId/tasks/:taskId/comments', commentController.getComments);
router.post('/:projectId/tasks/:taskId/comments', commentController.createComment);
router.delete('/:projectId/tasks/:taskId/comments/:commentId', commentController.deleteComment);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
