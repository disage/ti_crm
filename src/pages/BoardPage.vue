<!-- eslint-disable vue/no-unused-vars -->
<template>
  <q-page class="q-pa-md">
    <div class="row items-center">
      <div class="q-mr-md" style="min-height: 32px">
        <template v-if="isEditingName">
          <q-input
            id="board-name-input"
            v-model="editedName"
            dense
            outlined
            autofocus
            @blur="finishEditing"
            @keyup.enter="finishEditing"
            class="board-name-input"
            input-class="q-pa-none"
            style="
              font-size: 1.5rem;
              font-weight: 500;
              min-height: 32px;
              margin: 16px 0;
              vertical-align: middle;
            "
          />
        </template>
        <h5 v-else @click="startEditing" class="cursor-pointer" style="margin: 20px 0">
          {{ boardName }}
        </h5>
      </div>
      <q-btn flat dense icon="settings" color="primary" @click="toggleBoardMenu">
        <q-menu anchor="bottom left" self="top left">
          <q-list>
            <q-item clickable @click="handleChangeType">
              <q-item-section>Change Type</q-item-section>
            </q-item>
            <q-item clickable @click="handleDeleteBoard">
              <q-item-section class="text-negative">Delete</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <q-card>
      <q-card-section>
        <q-btn color="primary" @click="addRow">Add Item</q-btn>
        <q-btn color="secondary" @click="addColumn">Add Column</q-btn>
      </q-card-section>
      <q-card-section class="table-container">
        <q-table
          ref="tableRef"
          :rows="rows"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          virtual-scroll
          flat
          bordered
          table-class="my-table"
          table-layout="auto"
          style="min-width: max-content"
        >
          <template v-slot:header="props">
            <q-tr>
              <q-th style="width: 10px">#</q-th>
              <q-th style="width: 10px">Actions</q-th>
              <q-th
                v-for="(col, index) in columns"
                :key="col.id"
                :style="{ width: col.width + 'px' }"
              >
                <div
                  class="resizable-header"
                  draggable="true"
                  @dragstart="onDragStart(index)"
                  @dragover.prevent
                  @drop="onDrop(index)"
                >
                  <span class="draggable-title">{{ col.label }}</span>
                  <q-btn-dropdown flat dense>
                    <q-list>
                      <q-item clickable>
                        <q-item-section>
                          <q-item-label class="text-h6">Type:</q-item-label>
                          <q-select
                            v-model="col.type"
                            :options="availableTypes"
                            dense
                            borderless
                            @update:model-value="onColumnTypeChange(col)"
                          />
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="openRenameDialog(col)">
                        <q-item-section>Rename</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-if="col.type === 'select'"
                        flat
                        dense
                        icon="settings"
                        @click="openOptionsModal(col)"
                      >
                        <q-item-section>Change options</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="removeColumn(col)">
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                  <span class="resize-handle" @mousedown="startResize($event, index)">|</span>
                </div>
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td>{{ props.rowIndex }}</q-td>
              <q-td>
                <q-btn color="red" @click="removeRow(props.row.id)" icon="delete" flat />
              </q-td>
              <q-td v-for="col in columns" :key="col.id">
                <template v-if="col.type === 'text' || col.type === 'number'">
                  <q-input
                    v-model="props.row[col.field]"
                    dense
                    borderless
                    :type="col.type"
                    :disable="col.name === 'id'"
                  />
                </template>

                <template v-else-if="col.type === 'date'">
                  <q-input
                    v-model="props.row[col.field]"
                    dense
                    borderless
                    mask="####-##-##"
                    :disabled="col.name === 'ID'"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy>
                          <q-date v-model="props.row[col.field]" mask="YYYY-MM-DD" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </template>

                <template v-else-if="col.type === 'select'">
                  <q-select
                    v-model="props.row[col.field]"
                    :options="col.options || []"
                    dense
                    borderless
                    :disabled="col.name === 'ID'"
                  />
                </template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <q-dialog v-model="isOptionsModalOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Edit Select Options</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newOption" label="New Option" @keyup.enter="addOption" />
          <q-list>
            <q-item v-for="(option, index) in selectedColumn?.options" :key="index">
              <q-item-section>{{ option }}</q-item-section>
              <q-item-section side>
                <q-btn icon="delete" flat dense @click="removeOption(index)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isRenameDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Rename Column</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newColumnName" label="New column name" autofocus dense outlined />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveRename" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  createBoardColumn,
  deleteBoard,
  getBoardById,
  deleteBoardColumn,
  deleteBoardRow,
  renameColumn,
  updateBoard,
  createBoardRow,
} from 'src/api/boards';
import { useBoardStore } from 'src/stores/boardStore';
import type { Column, CreateBoardColumn, Row } from 'src/interfaces/board';

const boardStore = useBoardStore();
const route = useRoute();
const router = useRouter();

// const boardId = route.params.boardId as string;
const boardId = computed(() => route.params.boardId as string);

const boardMenuOpen = ref(false);
const tableRef = ref();
const availableTypes: Column['type'][] = ['text', 'number', 'date', 'select'];

const columns = ref<Column[]>([]);
const rows = ref<Row[]>([]);
const boardName = ref('');
const boardIcon = ref('');
const boardType = ref('');
const isEditingName = ref(false);
const editedName = ref(boardName.value);
const isRenameDialogOpen = ref(false);
const renameTargetCol = ref<Column | null>(null);
const newColumnName = ref('');
const isOptionsModalOpen = ref(false);
const selectedColumn = ref<Column | null>(null);
const newOption = ref('');
const pagination = ref({ rowsPerPage: 50 });
let resizingColumnIndex: number | null = null;
let draggedColumnIndex: number | null = null;

const toggleBoardMenu = () => {
  boardMenuOpen.value = true;
};

const handleDeleteBoard = async () => {
  try {
    await deleteBoard(boardId.value);
    await boardStore.fetchBoards();
    await router.push('/');
  } catch (error) {
    console.error('Error', error);
  }
};

const handleChangeType = () => {
  console.log('Changing board type...');
};

const openRenameDialog = (col: Column) => {
  renameTargetCol.value = col;
  newColumnName.value = col.label;
  isRenameDialogOpen.value = true;
};

const saveRename = async () => {
  if (!renameTargetCol.value) return;

  try {
    await renameColumn(renameTargetCol.value.id, newColumnName.value);

    // После успешного запроса обновляем локально
    renameTargetCol.value.label = newColumnName.value;
    renameTargetCol.value.name = newColumnName.value; // если ты name == label хочешь
  } catch (error) {
    console.error('Ошибка при переименовании колонки:', error);
  } finally {
    isRenameDialogOpen.value = false;
    renameTargetCol.value = null;
    newColumnName.value = '';
  }
};

const addRow = async () => {
  try {
    const { data: createdRow } = await createBoardRow(boardId.value);

    const newFrontendRow: Row = {
      id: createdRow.id,
    };

    columns.value.forEach((column) => {
      newFrontendRow[column.name] = null;
    });

    rows.value.push(newFrontendRow);
  } catch (error) {
    console.error('Error creating new row:', error);
  }
};

const addColumn = async () => {
  const newColBase = 'New Column';
  let newColName = `${newColBase} ${columns.value.length + 1}`;

  let counter = 1;
  while (columns.value.some((col) => col.name === newColName)) {
    counter++;
    newColName = `${newColBase} ${counter}`;
  }

  const newColumnData: CreateBoardColumn = {
    boardId: boardId.value, // ID доски
    name: newColName, // Имя новой колонки
    type: 'TEXT', // Тип колонки по умолчанию
    order: columns.value.length + 1, // Индекс для сортировки
    settings: {}, // Пустой объект для настроек
  };

  try {
    const { data: createdColumn } = await createBoardColumn(newColumnData);

    // После успешного создания добавляем колонку в локальный массив колонок с дополнительными полями
    const newFrontendColumn: Column = {
      id: createdColumn.id,
      name: newColName,
      type: newColumnData.type.toLowerCase() as 'number' | 'text' | 'select' | 'date',
      label: newColName,
      field: newColName,
      align: 'left',
      width: 150,
      options: [],
      // options: newColumnData.settings.options || []
      //   order: newColumnData.order,
    };

    columns.value.push(newFrontendColumn);
  } catch (error) {
    console.error('Error creating new column:', error);
  }
};

const removeRow = async (id: string) => {
  try {
    rows.value = rows.value.filter((row) => row.id !== id);
    await deleteBoardRow(id);
  } catch (error) {
    console.error('Error while deleting row', error);
  }
};

// const renameColumn = (column: Column) => {
//   const col = columns.value.find((col) => col.name === column.name);
//   if (col) col.label = prompt('Enter new column name:', col.label) || col.label;
// };

const removeColumn = async (column: Column) => {
  try {
    columns.value = columns.value.filter((col) => col.name !== column.name);
    await deleteBoardColumn(column.id);
  } catch (error) {
    console.error('Error while deleting column', error);
  }
};

const onDragStart = (index: number) => {
  draggedColumnIndex = index;
};

const onDrop = (index: number) => {
  if (draggedColumnIndex !== null) {
    const temp = columns.value.splice(draggedColumnIndex, 1)[0];
    if (temp !== undefined) {
      columns.value.splice(index, 0, temp);
    } else {
      console.warn('Dragged column was not found.');
    }
    draggedColumnIndex = null;
  }
};

const startResize = (event: MouseEvent, index: number) => {
  resizingColumnIndex = index;
  document.addEventListener('mousemove', resizeColumn);
  document.addEventListener('mouseup', stopResize);
  event.preventDefault();
};

const resizeColumn = (event: MouseEvent) => {
  if (
    resizingColumnIndex !== null &&
    resizingColumnIndex >= 0 &&
    resizingColumnIndex < columns.value.length
  ) {
    const column = columns.value[resizingColumnIndex];

    if (column) {
      column.width = Math.max(50, column.width + event.movementX);

      if (tableRef.value) {
        tableRef.value.$forceUpdate();
      }
    }
  }
};

const stopResize = () => {
  resizingColumnIndex = null;
  document.removeEventListener('mousemove', resizeColumn);
  document.removeEventListener('mouseup', stopResize);
};

const onColumnTypeChange = (col: Column) => {
  if (col.type === 'select' && !col.options) {
    col.options = [];
  }
};

const openOptionsModal = (col: Column) => {
  selectedColumn.value = col;
  isOptionsModalOpen.value = true;
};

const addOption = () => {
  // if (selectedColumn.value && newOption.value.trim()) {
  //     selectedColumn.value.options?.push(newOption.value.trim());
  //     newOption.value = '';
  // }
};

const removeOption = (index: number) => {
  selectedColumn.value?.options?.splice(index, 1);
};

const startEditing = async () => {
  editedName.value = boardName.value;
  isEditingName.value = true;
  await nextTick(() => {
    const input = document.getElementById('board-name-input');
    input?.focus();
  });
};

const finishEditing = async () => {
  if (editedName.value !== boardName.value) {
    try {
      await updateBoard(boardId.value, { name: editedName.value });
      boardName.value = editedName.value;
    } catch (err) {
      console.error('Failed to update board name', err);
    }
  }
  isEditingName.value = false;
};

onMounted(async () => {
  await loadBoard(boardId.value);
});

watch(boardId, async (newBoardId) => {
  await loadBoard(newBoardId);
});

const loadBoard = async (id: string) => {
  try {
    const boardData = await getBoardById(id);

    boardName.value = boardData.name;
    boardIcon.value = boardData.icon;
    boardType.value = boardData.type;
    columns.value = boardData.columns.map((col: Column) => ({
      id: col.id,
      name: col.name,
      label: col.name,
      field: col.name,
      align: 'left',
      width: 150,
      type: col.type || 'text',
      options: col.options || [],
    }));

    rows.value = boardData.rows.map((row: Row) => {
      const rowData: Row = { id: row.id };
      boardData.columns.forEach((col: Column) => {
        rowData[col.name] = row[col.name];
      });
      return rowData;
    });
  } catch (error) {
    console.error('Error loading board data', error);
  }
};
</script>

<style scoped>
:deep(.q-table) {
  width: auto !important;
}
.table-container {
  max-height: 500px;
  overflow-y: auto;
  display: block;
}

.scroll-container {
  overflow-x: auto;
  width: fit-content;
}

.my-table {
  min-width: max-content;
  white-space: nowrap;
}

.resizable-header {
  display: flex;
  align-items: center;
  position: relative;
}

.resize-handle {
  width: 4px;
  height: 100%;
  background-color: transparent;
  position: absolute;
  right: 0;
  top: 0;
  cursor: ew-resize;
}

.resize-handle:hover {
  background-color: gray;
}

::deep .q-field__native:focus {
  border: 1px solid #ccc;
}

::deep .q-table th,
.q-table td {
  padding: 5px;
}
</style>
