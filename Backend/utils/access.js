function idOf(value) {
  if (!value) {
    return '';
  }
  if (typeof value === 'object' && value._id) {
    return value._id.toString();
  }
  return value.toString();
}

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
  presentProject,
};
