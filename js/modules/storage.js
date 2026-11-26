// Gestió de sales visitades amb localStorage — EndinsART

export const ROOMS = ['expo1', 'expo2', 'expo3'];

const STORAGE_KEY = 'endinsartVisitedRooms';

const readList = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const writeList = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    if (e.name === 'QuotaExceededError') localStorage.removeItem(STORAGE_KEY);
  }
};

export const markRoomVisited = (roomId) => {
  const visited = readList();
  if (visited.includes(roomId)) return;
  writeList([...visited, roomId]);
};

export const isRoomVisited = (roomId) => readList().includes(roomId);

export const getVisitedRooms = () => readList();

export const clearVisitedRooms = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* silenci */ }
};
