// Decides whether the caller is the owner, an editor, or a viewer. Closed and archived projects stay readable but are not editable.
// A populated user is an object. Everywhere else the id is already a string or ObjectId.
function idOf(value) {
  if (!value) {
    return '';
  }
  if (typeof value === 'object' && value._id) {
    return value._id.toString();
  }
  return value.toString();
}

// owner, edit, view, or null when the caller is not on the project.
function accessLevel(project, userId) {
  const id = idOf(userId);
  if (idOf(project.user) === id) {
    return 'owner';
  }

  const match = (project.collaborators || []).find((entry) => idOf(entry.user) === id);
  return match ? match.permission : null;
}

function canView(level) {
  return level === 'owner' || level === 'edit' || level === 'view';
}

function canEdit(level) {
  return level === 'owner' || level === 'edit';
}

// Missing status is treated as open so older projects stay editable.
function isActive(project) {
  return !project.status || project.status === 'active';
}

function inactiveMessage(project) {
  if (project.status === 'archived') {
    return 'This project is archived. Reopen it to make changes.';
  }
  return 'This project is closed. Reopen it to make changes.';
}

// access is computed for this response. It is not stored on the project.
function presentProject(project, userId) {
  const plain = project.toObject();
  plain.access = accessLevel(project, userId);
  return plain;
}

module.exports = {
  idOf,
  accessLevel,
  canView,
  canEdit,
  isActive,
  inactiveMessage,
  presentProject,
};
