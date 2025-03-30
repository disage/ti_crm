<!-- eslint-disable vue/no-unused-vars -->
<template>
    <q-page class="q-pa-md">
      <q-card>
        <q-card-section>
          <q-btn color="primary" @click="addRow">Add Row</q-btn>
          <q-btn color="secondary" @click="addColumn">Add Column</q-btn>
        </q-card-section>
        <q-card-section class="table-container">
          <q-scroll-area style="height: 500px; width: 100%;">
            <div class="scroll-container">
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
                style="min-width: max-content;"
              >
                <template v-slot:header="props">
                  <q-tr>
                    <q-th v-for="(col, index) in columns" :key="col.name" :style="{ width: col.width + 'px' }">
                      <div class="resizable-header">
                        <span class="draggable-title" draggable="true" @dragstart="onDragStart(index)" @dragover.prevent @drop="onDrop(index)">{{ col.label }}</span>
                        <q-btn-dropdown flat dense>
                          <q-list>
                            <q-item clickable>
                              <q-item-section>
                                <q-item-label class="text-h6">Type:</q-item-label> <!-- Заголовок с большим текстом -->
                                <q-select 
                                  v-model="col.type" 
                                  :options="availableTypes" 
                                  dense 
                                  borderless 
                                  @update:model-value="onColumnTypeChange(col)" 
                                />
                              </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="renameColumn(col.name)">
                              <q-item-section>Rename</q-item-section>
                            </q-item>
                            <q-item clickable v-if="col.type === 'select'" flat dense icon="settings" @click="openOptionsModal(col)">
                              <q-item-section>Change options</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="removeColumn(col.name)">
                              <q-item-section>Delete</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                        <span class="resize-handle" @mousedown="startResize($event, index)">|</span>
                      </div>
                    </q-th>
                    <q-th>Actions</q-th>
                  </q-tr>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td v-for="col in columns" :key="col.name">
                      <template v-if="col.type === 'text' || col.type === 'number'">
                        <q-input v-model="props.row[col.field]" dense borderless :type="col.type" />
                      </template>
                      <template v-else-if="col.type === 'date'">
                        <q-input v-model="props.row[col.field]" dense borderless mask="####-##-##">
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
                        <q-select v-model="props.row[col.field]" :options="col.options || []" dense borderless />
                      </template>
                    </q-td>
                    <q-td>
                      <q-btn color="red" @click="removeRow(props.row.id)" icon="delete" flat />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-scroll-area>
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
    </q-page>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  interface Column {
    name: string;
    label: string;
    field: string;
    align: "left" | "right" | "center";
    width: number;
    type: "text" | "number" | "select" | "date";
    options?: string[];
  }
  
  interface Row {
    id: number;
    [key: string]: unknown;
  }
  
  const tableRef = ref();
  const availableTypes: Column["type"][] = ["text", "number", "date", "select"];
  
  const columns = ref<Column[]>([
    { name: 'id', label: 'ID', field: 'id', align: 'left', width: 100, type: 'number' },
    { name: 'name', label: 'Name', field: 'name', align: 'left', width: 150, type: 'text' },
    { name: 'age', label: 'Age', field: 'age', align: 'left', width: 100, type: 'number' },
    { name: 'birthdate', label: 'Birthdate', field: 'birthdate', align: 'left', width: 150, type: 'date' },
    { name: 'status', label: 'Status', field: 'status', align: 'left', width: 150, type: 'select', options: ['Active', 'Inactive', 'Pending'] }
  ]);
  
  const rows = ref<Row[]>([
    { id: 1, name: 'Alice', age: 25, birthdate: '1998-04-12', status: 'Active' },
    { id: 2, name: 'Bob', age: 30, birthdate: '1993-07-23', status: 'Inactive' },
    { id: 3, name: 'Charlie', age: 35, birthdate: '1988-09-15', status: 'Pending' }
  ]);
  
  const isOptionsModalOpen = ref(false);
  const selectedColumn = ref<Column | null>(null);
  const newOption = ref('');
  const pagination = ref({ rowsPerPage: 20 });
  let resizingColumnIndex: number | null = null;
  let draggedColumnIndex: number | null = null;
  
  const addRow = () => {
    const newId = rows.value.length ? Math.max(...rows.value.map(row => row.id)) + 1 : 1;
    const newRow: Row = { id: newId };
    columns.value.forEach(col => {
      if (col.field !== 'id') newRow[col.field] = col.type === 'number' ? 0 : '';
    });
    rows.value.push(newRow);
  };
  
  const addColumn = () => {
    const newColName = `col${columns.value.length + 1}`;
    columns.value.push({ name: newColName, label: newColName, field: newColName, align: 'left', width: 150, type: 'text' });
  };
  
  const removeRow = (id: number) => {
    rows.value = rows.value.filter(row => row.id !== id);
  };
  
  const renameColumn = (name: string) => {
    const col = columns.value.find(col => col.name === name);
    if (col) col.label = prompt("Enter new column name:", col.label) || col.label;
  };
  
  const removeColumn = (name: string) => {
    columns.value = columns.value.filter(col => col.name !== name);
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
        console.warn("Dragged column was not found.");
      }
      draggedColumnIndex = null;
    }};
  
  const startResize = (event: MouseEvent, index: number) => {
    resizingColumnIndex = index;
    document.addEventListener('mousemove', resizeColumn);
    document.addEventListener('mouseup', stopResize);
    event.preventDefault();
  }
  
  const resizeColumn = (event: MouseEvent) => {
    if (resizingColumnIndex !== null && resizingColumnIndex >= 0 && resizingColumnIndex < columns.value.length) {
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
    if (selectedColumn.value && newOption.value.trim()) {
      selectedColumn.value.options?.push(newOption.value.trim());
      newOption.value = '';
    }
  };
  
  const removeOption = (index: number) => {
    selectedColumn.value?.options?.splice(index, 1);
  };
  
  </script>
  
  
  <style scoped>
  
  .table-container {
    max-height: 500px;
    overflow-y: auto;
    display: block;
  }
  
  .scroll-container {
    overflow-x: auto;
    width: fit-content; /* Позволяет таблице расширяться */
  }
  
  .my-table {
    min-width: max-content; /* Позволяет таблице увеличиваться */
    white-space: nowrap;
  }
  
  .resizable-header {
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .resize-handle {
    width: 5px;
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
  
  </style>