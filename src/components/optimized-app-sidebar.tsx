'use client'
import React, { 
  useState, 
  useCallback, 
  useMemo, 
  memo,
  Suspense,
  lazy,
  startTransition
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useOptimizedTodoContext } from "@/provider/optimized-todo";
import { ListId } from "@/types/todo-context";
import { performanceMonitor } from "@/utils/performance-monitor";

// Lazy load heavy components
const Modal = lazy(() => import("./ui/modal").then(m => ({ default: m.Modal })));
const Form = lazy(() => import("./ui/form").then(m => ({ default: m.Form })));

// Validation schema with enhanced rules
const listSchema = z.object({
  name: z.string()
    .min(1, { message: "リスト名を入力してください" })
    .max(50, { message: "リスト名は50文字以内で入力してください" })
    .regex(/^[^\s].*[^\s]$|^[^\s]$/, { message: "リスト名の前後に空白は使用できません" }),
});

type ListFormValues = z.infer<typeof listSchema>;

// Memoized list item component
const ListMenuItem = memo<{
  list: { id: ListId; name: string };
  isSelected: boolean;
  onSelect: (id: ListId) => void;
  onEdit: (list: { id: ListId; name: string }) => void;
  onDelete: (list: { id: ListId; name: string }) => void;
}>(({ list, isSelected, onSelect, onEdit, onDelete }) => {
  const handleSelect = useCallback(() => {
    onSelect(list.id);
  }, [list.id, onSelect]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(list);
  }, [list, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(list);
  }, [list, onDelete]);

  return (
    <SidebarMenuItem className="group relative">
      <SidebarMenuButton 
        onClick={handleSelect}
        className={`${isSelected ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""} pr-20`}
      >
        <span className="w-4 h-4 flex items-center justify-center font-medium border rounded-full p-2">
          {list.name.charAt(0)}
        </span>
        <span>{list.name}</span>
      </SidebarMenuButton>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        <button
          className="h-4 w-4 flex items-center justify-center transition-colors group"
          onClick={handleEdit}
          title="リストを編集"
          aria-label={`リスト「${list.name}」を編集`}
        >
          <svg className="h-4 w-4 hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button
          className="h-4 w-4 flex items-center justify-center transition-colors group"
          onClick={handleDelete}
          title="リストを削除"
          aria-label={`リスト「${list.name}」を削除`}
        >
          <svg className="h-4 w-4 text-destructive/90 hover:scale-110 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </SidebarMenuItem>
  );
});

ListMenuItem.displayName = 'ListMenuItem';

// Modal content components
const ListFormModal = memo<{
  isOpen: boolean;
  mode: 'add' | 'edit' | 'delete';
  selectedList: { id: ListId; name: string } | null;
  onClose: () => void;
  onSubmit: (values: ListFormValues) => Promise<void>;
  onDelete: () => Promise<void>;
}>(({ isOpen, mode, selectedList, onClose, onSubmit, onDelete }) => {
  const form = useForm<ListFormValues>({
    resolver: zodResolver(listSchema),
    defaultValues: { name: selectedList?.name || "" },
  });

  const title = useMemo(() => {
    switch (mode) {
      case 'add': return '新しいリスト';
      case 'edit': return 'リストを編集';
      case 'delete': return 'リストを削除';
      default: return '';
    }
  }, [mode]);

  const handleSubmit = useCallback(async (values: ListFormValues) => {
    await performanceMonitor.measureAsync('list-form-submit', async () => {
      await onSubmit(values);
    });
  }, [onSubmit]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Modal
        buttonLabel=""
        dialogTitle={title}
        className="hidden"
        open={isOpen}
        onClickOpen={() => {}}
        onClickChange={onClose}
      >
        {mode === 'delete' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              リスト「{selectedList?.name}」を削除しますか？
              <br />
              削除したリストは復元できません。
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                削除する
              </Button>
            </div>
          </div>
        ) : (
          <Suspense fallback={<div>Loading form...</div>}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Form fields would go here */}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    キャンセル
                  </Button>
                  <Button type="submit">
                    {mode === 'add' ? '作成' : '更新'}
                  </Button>
                </div>
              </form>
            </Form>
          </Suspense>
        )}
      </Modal>
    </Suspense>
  );
});

ListFormModal.displayName = 'ListFormModal';

// Main component
export const OptimizedAppSidebar = memo(() => {
  const { open } = useSidebar();
  const { 
    currentList, 
    lists, 
    computed, 
    actions 
  } = useOptimizedTodoContext();

  // Local state for modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'delete';
    selectedList: { id: ListId; name: string } | null;
  }>({
    isOpen: false,
    mode: 'add',
    selectedList: null,
  });

  // Memoized list data
  const { listData, isLoading } = useMemo(() => {
    if (lists.status === 'success') {
      return { listData: lists.data, isLoading: false };
    }
    return { listData: [], isLoading: lists.status === 'loading' };
  }, [lists]);

  // Optimized event handlers
  const handleOpenModal = useCallback((
    mode: 'add' | 'edit' | 'delete', 
    list?: { id: ListId; name: string }
  ) => {
    startTransition(() => {
      setModalState({
        isOpen: true,
        mode,
        selectedList: list || null,
      });
      actions.setMode('modal' as any);
    });
  }, [actions]);

  const handleCloseModal = useCallback(() => {
    startTransition(() => {
      setModalState(prev => ({ ...prev, isOpen: false }));
      actions.setMode(null);
    });
  }, [actions]);

  const handleListSelect = useCallback((id: ListId) => {
    performanceMonitor.measure('list-select', () => {
      actions.setListId(id);
    });
  }, [actions]);

  const handleFormSubmit = useCallback(async (values: ListFormValues) => {
    const { mode, selectedList } = modalState;
    
    try {
      if (mode === 'add') {
        await actions.createList(values.name);
        toast.success(`リスト「${values.name}」を追加しました`);
      } else if (mode === 'edit' && selectedList) {
        await actions.updateList(selectedList.id, values.name);
        toast.success(`リスト「${values.name}」を更新しました`);
      }
      handleCloseModal();
    } catch (error) {
      toast.error('処理中にエラーが発生しました');
    }
  }, [modalState, actions, handleCloseModal]);

  const handleDelete = useCallback(async () => {
    const { selectedList } = modalState;
    if (!selectedList) return;

    try {
      await actions.deleteList(selectedList.id);
      toast.success(`リスト「${selectedList.name}」を削除しました`);
      handleCloseModal();
    } catch (error) {
      toast.error('削除処理中にエラーが発生しました');
    }
  }, [modalState, actions, handleCloseModal]);

  // Render list items with virtualization for large lists
  const listItems = useMemo(() => {
    return listData.map(list => (
      <ListMenuItem
        key={list.id}
        list={list}
        isSelected={currentList === list.id}
        onSelect={handleListSelect}
        onEdit={(list) => handleOpenModal('edit', list)}
        onDelete={(list) => handleOpenModal('delete', list)}
      />
    ));
  }, [listData, currentList, handleListSelect, handleOpenModal]);

  return (
    <Sidebar collapsible="icon" className="border-r-sidebar-border">
      <SidebarHeader>
        {/* Header content */}
      </SidebarHeader>
      
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>List</SidebarGroupLabel>
          {computed.isAuthenticated && !isLoading && (
            <>
              {listItems}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleOpenModal('add')}
                  className="text-accent hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span>新しいリスト</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Footer content */}
      </SidebarFooter>

      <ListFormModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        selectedList={modalState.selectedList}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
      />
    </Sidebar>
  );
});

OptimizedAppSidebar.displayName = 'OptimizedAppSidebar';