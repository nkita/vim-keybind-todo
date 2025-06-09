import { useEffect, useState, useCallback } from 'react';
import { TodoProps, ProjectProps, LabelProps } from '@/types';
import { ListItem, ListId } from '@/types/todo-context';
import {
  getOfflineData,
  setOfflineData,
  createInitialOfflineData,
  addOfflineList,
  updateOfflineList,
  deleteOfflineList,
  getCurrentListId,
  setCurrentListId as setStorageListId
} from '@/lib/offline-storage';

export function useOfflineStorage() {
  const [currentListId, setCurrentListIdState] = useState<ListId | null>(null);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [todos, setTodos] = useState<TodoProps[]>([]);
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [labels, setLabels] = useState<LabelProps[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化とマイグレーション
  useEffect(() => {
    const initializeData = () => {
      let data = getOfflineData();
      
      // 既存データがない場合、またはマイグレーションが必要な場合
      if (!data) {
        data = createInitialOfflineData();
        
        // 既存のローカルストレージから移行
        try {
          const oldTodos = localStorage.getItem('shiba-todo:data');
          const oldProjects = localStorage.getItem('shiba-todo:projects');
          const oldLabels = localStorage.getItem('shiba-todo:labels');
          const oldListId = localStorage.getItem('shiba-todo:list_id');
          
          if (oldTodos || oldProjects || oldLabels) {
            const defaultListId = oldListId ? JSON.parse(oldListId) : 'local-default';
            
            data.lists[defaultListId] = {
              id: defaultListId,
              name: 'デフォルトリスト',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isLocal: true
            };
            
            data.todos[defaultListId] = oldTodos ? JSON.parse(oldTodos) : [];
            data.projects[defaultListId] = oldProjects ? JSON.parse(oldProjects) : [];
            data.labels[defaultListId] = oldLabels ? JSON.parse(oldLabels) : [];
            data.currentListId = defaultListId;
          }
        } catch (error) {
          console.error('Migration error:', error);
        }
        
        setOfflineData(data);
      }
      
      // リスト一覧を作成
      const listArray: ListItem[] = Object.values(data.lists).map(list => ({
        id: list.id as ListId,
        name: list.name,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      }));
      
      setLists(listArray);
      
      // 現在のリストIDを設定
      const currentId = data.currentListId || Object.keys(data.lists)[0];
      setCurrentListIdState(currentId as ListId);
      
      // 現在のリストのデータを設定
      if (currentId && data.lists[currentId]) {
        setTodos(data.todos[currentId] || []);
        setProjects(data.projects[currentId] || []);
        setLabels(data.labels[currentId] || []);
      }
      
      setIsInitialized(true);
    };
    
    initializeData();
  }, []);

  // リストIDが変更されたときにデータを更新
  useEffect(() => {
    if (!isInitialized || !currentListId) return;
    
    const data = getOfflineData();
    if (!data) return;
    
    setTodos(data.todos[currentListId] || []);
    setProjects(data.projects[currentListId] || []);
    setLabels(data.labels[currentListId] || []);
  }, [currentListId, isInitialized]);

  // リスト追加
  const createList = useCallback((name: string) => {
    const newListId = addOfflineList(name);
    
    // リスト一覧を更新
    const data = getOfflineData();
    if (data) {
      const listArray: ListItem[] = Object.values(data.lists).map(list => ({
        id: list.id as ListId,
        name: list.name,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      }));
      setLists(listArray);
    }
    
    return newListId as ListId;
  }, []);

  // リスト更新
  const updateList = useCallback((listId: string, name: string) => {
    updateOfflineList(listId, name);
    
    // リスト一覧を更新
    const data = getOfflineData();
    if (data) {
      const listArray: ListItem[] = Object.values(data.lists).map(list => ({
        id: list.id as ListId,
        name: list.name,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      }));
      setLists(listArray);
    }
  }, []);

  // リスト削除
  const removeList = useCallback((listId: string) => {
    deleteOfflineList(listId);
    
    // リスト一覧を更新
    const data = getOfflineData();
    if (data) {
      const listArray: ListItem[] = Object.values(data.lists).map(list => ({
        id: list.id as ListId,
        name: list.name,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      }));
      setLists(listArray);
      
      // 現在のリストが削除されたら別のリストに切り替え
      if (currentListId === listId && data.currentListId) {
        setCurrentListIdState(data.currentListId as ListId);
      }
    }
  }, [currentListId]);

  // 現在のリストID変更
  const setCurrentListId = useCallback((listId: string) => {
    setStorageListId(listId);
    setCurrentListIdState(listId as ListId);
  }, []);

  // TODOの更新
  const updateTodos = useCallback((newTodos: TodoProps[]) => {
    const data = getOfflineData();
    if (!data || !currentListId) return;
    
    data.todos[currentListId] = newTodos;
    setOfflineData(data);
    setTodos(newTodos);
  }, [currentListId]);

  // プロジェクトの更新
  const updateProjects = useCallback((newProjects: ProjectProps[]) => {
    const data = getOfflineData();
    if (!data || !currentListId) return;
    
    data.projects[currentListId] = newProjects;
    setOfflineData(data);
    setProjects(newProjects);
  }, [currentListId]);

  // ラベルの更新
  const updateLabels = useCallback((newLabels: LabelProps[]) => {
    const data = getOfflineData();
    if (!data || !currentListId) return;
    
    data.labels[currentListId] = newLabels;
    setOfflineData(data);
    setLabels(newLabels);
  }, [currentListId]);

  return {
    currentListId,
    setCurrentListId,
    lists,
    todos,
    projects,
    labels,
    createList,
    updateList,
    removeList,
    updateTodos,
    updateProjects,
    updateLabels,
    isInitialized
  };
}