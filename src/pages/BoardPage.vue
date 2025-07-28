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
                          <q-item-label>Type:</q-item-label>
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
                        v-if="col.type === 'SINGLE_SELECT'"
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
                  <span class="resize-handle" @mousedown="startResize($event, index)"></span>
                </div>
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td>{{ props.rowIndex + 1 }}</q-td>
              <q-td>
                <q-btn color="red" @click="removeRow(props.row.id)" icon="delete" flat />
              </q-td>
              <q-td v-for="col in columns" :key="col.id">
                <template v-if="col.type === 'TEXT'">
                  <q-input
                    v-model="props.row[col.field].value"
                    dense
                    borderless
                    type="text"
                    :disable="col.name === 'id'"
                    @blur="updateCell(props.row[col.field], col.field, props.row.id)"
                    @keyup.enter="updateCell(props.row[col.field], col.field, props.row.id)"
                  />
                </template>

                <template v-else-if="col.type === 'NUMBER'">
                  <q-input
                    v-model="props.row[col.field].value"
                    dense
                    borderless
                    type="number"
                    @blur="updateCell(props.row[col.field], col.field, props.row.id)"
                    @keyup.enter="updateCell(props.row[col.field], col.field, props.row.id)"
                  />
                </template>

                <template v-else-if="col.type === 'DATE'">
                  <q-input
                    v-model="props.row[col.field].value"
                    dense
                    borderless
                    mask="####-##-##"
                    @blur="updateCell(props.row[col.field], col.field, props.row.id)"
                    @keyup.enter="updateCell(props.row[col.field], col.field, props.row.id)"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy
                          @hide="() => updateCell(props.row[col.field], col.field, props.row.id)"
                        >
                          <q-date v-model="props.row[col.field].value" mask="YYYY-MM-DD" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </template>

                <template v-else-if="col.type === 'SINGLE_SELECT'">
                  <q-select
                    v-model="props.row[col.field].value"
                    :options="col.settings?.options || []"
                    @update:model-value="
                      () => updateCell(props.row[col.field], col.field, props.row.id)
                    "
                    dense
                    borderless
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
          <q-input v-model="newColumnOption" label="New Option" @keyup.enter="addOption" />
          <q-list>
            <q-item v-for="(option, index) in selectedColumn?.settings?.options" :key="index">
              <q-item-section>{{ option }}</q-item-section>
              <q-item-section side>
                <q-btn icon="delete" flat dense @click="removeOption(index)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup @click="onCloseOptionsModal()" />
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
  updateBoard,
  createBoardRow,
  updateColumn,
  getBoardCell,
  updateBoardCell,
} from 'src/api/boards';
import { useBoardStore } from 'src/stores/boardStore';
import type {
  Cell,
  CellData,
  Column,
  CreateBoardColumn,
  Row,
  UpdateColumnPayload,
} from 'src/interfaces/board';

const boardStore = useBoardStore();
const route = useRoute();
const router = useRouter();

const boardId = computed(() => route.params.boardId as string);

const boardIcon = ref('');
const boardMenuOpen = ref(false);
const boardName = ref('');
const boardType = ref('');
const columns = ref<Column[]>([]);
const editedName = ref(boardName.value);
const isEditingName = ref(false);
const isOptionsModalOpen = ref(false);
const isRenameDialogOpen = ref(false);
const newColumnName = ref('');
const newColumnOption = ref('');
const pagination = ref({ rowsPerPage: 50 });
const renameTargetCol = ref<Column | null>(null);
const rows = ref<Row[]>([]);
const selectedColumn = ref<Column | null>(null);
const tableRef = ref();

const availableTypes: Column['type'][] = ['TEXT', 'NUMBER', 'DATE', 'SINGLE_SELECT'];
let draggedColumnIndex: number | null = null;
let resizingColumnIndex: number | null = null;

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
    await updateColumn(renameTargetCol.value.id, { name: newColumnName.value });

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

    const cellMap = new Map<string, Cell>(
      (createdRow.cells as Cell[]).map((cell) => [cell.columnId, cell])
    );

    columns.value.forEach((column) => {
      const cell = cellMap.get(column.id);

      // Приводим value к string | number | null
      const val =
        cell?.value === undefined || cell?.value === null
          ? null
          : typeof cell.value === 'string' || typeof cell.value === 'number'
            ? cell.value
            : null;

      newFrontendRow[column.name] = {
        value: val,
        originalValue: val,
        cellId: cell?.id ?? '',
      };
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
    boardId: boardId.value,
    name: newColName,
    type: 'TEXT',
    order: columns.value.length + 1,
    settings: {},
  };

  try {
    const { data: createdColumn } = await createBoardColumn(newColumnData);

    // После успешного создания добавляем колонку в локальный массив колонок с дополнительными полями
    const newFrontendColumn: Column = {
      id: createdColumn.id,
      name: newColName,
      type: newColumnData.type,
      label: newColName,
      field: newColName,
      align: 'left',
      width: 150,
      settings: {},
      // options: newColumnData.settings.options || []
      //   order: newColumnData.order,
    };

    columns.value.push(newFrontendColumn);

    rows.value.forEach((row) => {
      row[newColName] = {
        value: null,
        originalValue: null,
        cellId: '',
      };
    });
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

const onColumnTypeChange = async (col: Column) => {
  if (col.type === 'SINGLE_SELECT') {
    if (!col.settings) {
      col.settings = {};
    }
    if (!col.settings.options) {
      col.settings.options = [];
    }
  }

  const payload: UpdateColumnPayload = {
    type: col.type.toUpperCase() as 'TEXT' | 'NUMBER' | 'SINGLE_SELECT' | 'DATE',
    ...(col.settings ? { settings: col.settings } : {}),
  };

  try {
    await updateColumn(col.id, payload);
  } catch (error) {
    console.error('Failed to update column type:', error);
  }
};

const openOptionsModal = (col: Column) => {
  selectedColumn.value = col;
  isOptionsModalOpen.value = true;
};

const addOption = async () => {
  const option = newColumnOption.value.trim();
  if (!selectedColumn.value || !option) return;

  // Initialize settings and options if they are missing
  if (!selectedColumn.value.settings) {
    selectedColumn.value.settings = { options: [] };
  }

  if (!Array.isArray(selectedColumn.value.settings.options)) {
    selectedColumn.value.settings.options = [];
  }

  selectedColumn.value.settings.options.push(option);

  const payload: UpdateColumnPayload = {
    settings: selectedColumn.value.settings,
  };

  try {
    await updateColumn(selectedColumn.value.id, payload);
    newColumnOption.value = '';
  } catch (error) {
    console.error('Failed to add option and update column:', error);
  }
};

const removeOption = async (index: number) => {
  if (
    !selectedColumn.value ||
    !selectedColumn.value.settings ||
    !Array.isArray(selectedColumn.value.settings.options)
  ) {
    return;
  }

  selectedColumn.value.settings.options.splice(index, 1);

  const payload: UpdateColumnPayload = {
    settings: selectedColumn.value.settings,
  };

  try {
    await updateColumn(selectedColumn.value.id, payload);
  } catch (error) {
    console.error('Failed to remove option and update column:', error);
  }
};

const onCloseOptionsModal = () => {
  newColumnOption.value = '';
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

const updateCell = async (cell: CellData, colField: string, rowId: string) => {
  try {
    const column = columns.value.find((c) => c.field === colField);
    if (!column) throw new Error('Column not found');

    // If there is no cellId, we try to find a cell on the server
    if (!cell.cellId) {
      const { data: existingCell } = await getBoardCell(rowId, column.id);
      if (existingCell) {
        cell.cellId = existingCell.id;
        cell.originalValue = existingCell.value;
      } else {
        console.warn('Cell not found on server, although expected');
        return; // или break, если не хотим продолжать без cellId
      }
    }

    const isChanged = JSON.stringify(cell.value) !== JSON.stringify(cell.originalValue);
    if (isChanged && cell.cellId) {
      await updateBoardCell(cell.cellId, cell.value);
      cell.originalValue = JSON.parse(JSON.stringify(cell.value));
    }
  } catch (err) {
    console.error('Error updating cell:', err);
  }
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
      type: col.type || 'TEXT',
      settings: col.settings || {},
    }));

    rows.value = boardData.rows.map((row: Row) => {
      const rowData: Row = {
        id: row.id,
      };

      boardData.columns.forEach((col: Column) => {
        const cell = row[col.name] as CellData | undefined;

        rowData[col.name] = {
          value: cell?.value ?? null,
          originalValue: JSON.parse(JSON.stringify(cell?.value ?? null)),
          cellId: cell?.cellId ?? '',
        };
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
  padding: 0 1px;
  height: 100%;
  position: absolute;
  right: -1px;
  top: 0;
  cursor: ew-resize;
  background-color: #ccc;
}

.resize-handle:hover {
  background-color: gray;
}

::v-deep(.q-table .q-field__native:focus) {
  border: 1px solid #ccc;
}

::v-deep(.q-table td) {
  padding: 5px;
}

::v-deep(.q-table th) {
  padding: 0 0 0 5px !important;
}

::v-deep(.q-table--horizontal-separator thead th),
::v-deep(.q-table--horizontal-separator tbody tr > td),
::v-deep(.q-table--cell-separator thead th),
::v-deep(.q-table--cell-separator) {
  border-right-width: 1px;
}
</style>
