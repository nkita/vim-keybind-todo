// オフラインストレージの型定義
export interface OfflineStorageStructure {
  // バージョン管理（マイグレーション用）
  version: number;
  
  // 複数リストを管理
  lists: {
    [listId: string]: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      isLocal?: boolean; // ローカルのみに存在するリストかどうか
      lastSyncedAt?: string; // 最後に同期した時刻
    };
  };
  
  // 各リストのTODO
  todos: {
    [listId: string]: Array<{
      id: string;
      text: string;
      priority?: string;
      is_complete?: boolean;
      completionDate?: string | null;
      creationDate?: string;
      detail?: string;
      projectId?: string;
      labelId?: string;
      startDate: string;
      endDate: string;
      inProgress?: number;
      isArchived?: boolean;
      sort?: number;
      limitDate?: string;
      indent?: number;
      updateDate?: string;
      isLocal?: boolean; // ローカルのみの変更かどうか
      syncStatus?: 'pending' | 'synced' | 'conflict';
    }>;
  };
  
  // 各リストのプロジェクト
  projects: {
    [listId: string]: Array<{
      id: string;
      name: string;
      isPublic: boolean;
      isTabDisplay: boolean;
      sort: number;
      isLocal?: boolean;
    }>;
  };
  
  // 各リストのラベル
  labels: {
    [listId: string]: Array<{
      id: string;
      name: string;
      isPublic: boolean;
      isLocal?: boolean;
    }>;
  };
  
  // 現在選択中のリストID
  currentListId: string | null;
  
  // オフライン時の操作キュー（同期時に使用）
  syncQueue?: Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    resource: 'list' | 'todo' | 'project' | 'label';
    listId: string;
    data: any;
    timestamp: string;
  }>;
  
  // その他の設定
  settings: {
    todo_is_first_visit?: boolean;
    ganttc?: any;
  };
}

// マイグレーション関数の型
export type MigrationFunction = (oldData: any) => OfflineStorageStructure;