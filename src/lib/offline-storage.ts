import { OfflineStorageStructure, MigrationFunction } from '@/types/offline-storage';
import { TodoProps, ProjectProps, LabelProps } from '@/types';

const STORAGE_KEY = 'shiba-todo:offline-data';
const CURRENT_VERSION = 2;

// ローカルストレージのデータ取得
export function getOfflineData(): OfflineStorageStructure | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // バージョンチェックとマイグレーション
    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      return migrateData(parsed);
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
}

// ローカルストレージへのデータ保存
export function setOfflineData(data: OfflineStorageStructure): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      version: CURRENT_VERSION
    }));
  } catch (error) {
    console.error('Failed to save offline data:', error);
  }
}

// 既存データから新構造へのマイグレーション
export function migrateData(oldData: any): OfflineStorageStructure {
  // バージョン1（現在の構造）からバージョン2への移行
  if (!oldData.version || oldData.version === 1) {
    // 既存のローカルストレージから読み取る
    const existingTodos = getLocalStorageItem<TodoProps[]>('data') || [];
    const existingProjects = getLocalStorageItem<ProjectProps[]>('projects') || [];
    const existingLabels = getLocalStorageItem<LabelProps[]>('labels') || [];
    const existingListId = getLocalStorageItem<string>('list_id') || 'local-default';
    
    const newData: OfflineStorageStructure = {
      version: CURRENT_VERSION,
      lists: {
        [existingListId]: {
          id: existingListId,
          name: 'デフォルトリスト',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isLocal: true
        }
      },
      todos: {
        [existingListId]: existingTodos
      },
      projects: {
        [existingListId]: existingProjects
      },
      labels: {
        [existingListId]: existingLabels
      },
      currentListId: existingListId,
      settings: {
        todo_is_first_visit: getLocalStorageItem<boolean>('todo_is_first_visit') || undefined,
        ganttc: getLocalStorageItem<any>('ganttc')
      }
    };
    
    return newData;
  }
  
  return oldData;
}

// 既存のローカルストレージアイテムを取得
function getLocalStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(`shiba-todo:${key}`);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

// 初期データ構造を作成
export function createInitialOfflineData(): OfflineStorageStructure {
  const defaultListId = 'local-default';
  
  return {
    version: CURRENT_VERSION,
    lists: {
      [defaultListId]: {
        id: defaultListId,
        name: 'デフォルトリスト',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLocal: true
      }
    },
    todos: {
      [defaultListId]: []
    },
    projects: {
      [defaultListId]: []
    },
    labels: {
      [defaultListId]: []
    },
    currentListId: defaultListId,
    settings: {}
  };
}

// リスト操作関数
export function addOfflineList(name: string): string {
  const data = getOfflineData() || createInitialOfflineData();
  const newListId = `local-${Date.now()}`;
  
  data.lists[newListId] = {
    id: newListId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLocal: true
  };
  
  // 新しいリスト用の空配列を初期化
  data.todos[newListId] = [];
  data.projects[newListId] = [];
  data.labels[newListId] = [];
  
  setOfflineData(data);
  return newListId;
}

export function updateOfflineList(listId: string, name: string): void {
  const data = getOfflineData();
  if (!data || !data.lists[listId]) return;
  
  data.lists[listId] = {
    ...data.lists[listId],
    name,
    updatedAt: new Date().toISOString()
  };
  
  setOfflineData(data);
}

export function deleteOfflineList(listId: string): void {
  const data = getOfflineData();
  if (!data || !data.lists[listId]) return;
  
  // デフォルトリストは削除不可
  if (listId === 'local-default') return;
  
  delete data.lists[listId];
  delete data.todos[listId];
  delete data.projects[listId];
  delete data.labels[listId];
  
  // 現在のリストが削除されたら別のリストに切り替え
  if (data.currentListId === listId) {
    const remainingListIds = Object.keys(data.lists);
    data.currentListId = remainingListIds.length > 0 ? remainingListIds[0] : null;
  }
  
  setOfflineData(data);
}

// 現在のリストIDを取得
export function getCurrentListId(): string {
  const data = getOfflineData();
  if (!data || !data.currentListId) {
    const initialData = createInitialOfflineData();
    setOfflineData(initialData);
    return initialData.currentListId!;
  }
  return data.currentListId;
}

// 現在のリストIDを設定
export function setCurrentListId(listId: string): void {
  const data = getOfflineData() || createInitialOfflineData();
  data.currentListId = listId;
  setOfflineData(data);
}