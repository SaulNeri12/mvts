const users = [
  { id: '00000240798', password: 'manager123', name: 'Bob Ross', rol: 'MANAGER', currentRefreshTokenHash: '', tokenVersion: 0 },
  { id: '00000213145', password: 'sentinel123', name: 'Jhon Doe', rol: 'SENTINEL', currentRefreshTokenHash: '', tokenVersion: 0 },
  { id: '00000584392', password: 'sentinel123', name: 'Martin Mcfly', rol: 'SENTINEL', currentRefreshTokenHash: '', tokenVersion: 0 }
];

// ---- USER QUERIES ----
exports.findByUserId = (id) => users.find(u => u.id === id) || null;
exports.getAllUsers = () => users;

// ---- TOKEN HANDLING ----
exports.updateRefreshTokenHash = (userId, hash) => {
  const user = users.find(u => u.id === userId);
  if (user) user.currentRefreshTokenHash = hash;
};

exports.getRefreshTokenHash = (userId) => {
  const user = users.find(u => u.id === userId);
  return user ? user.currentRefreshTokenHash : null;
};

// ---- TOKEN VERSION ----
exports.incrementTokenVersion = (userId) => {
  const user = users.find(u => u.id === userId);
  if (user) user.tokenVersion += 1;
};

exports.getTokenVersion = (userId) => {
  const user = users.find(u => u.id === userId);
  return user ? user.tokenVersion : null;
};  
