<template>
  <div class="container">
    <h1>数据管理</h1>
    <div class="toolbar">
      <el-button type="primary" @click="openAddDialog">新增</el-button>
      <el-button @click="handleImport">导入Excel</el-button>
      <el-button @click="handleExport">导出Excel</el-button>
      <input type="file" ref="fileInput" style="display:none" accept=".xlsx,.xls" @change="onFileSelect">
    </div>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="phone" label="电话"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="400px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.phone"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const formData = ref({ name: '', email: '', phone: '', address: '' })
const fileInput = ref(null)
const editId = ref(null)

const loadData = async () => {
  const res = await axios.get('/api/users')
  tableData.value = res.data
}

const openAddDialog = () => {
  dialogTitle.value = '新增'
  formData.value = { name: '', email: '', phone: '', address: '' }
  editId.value = null
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  dialogTitle.value = '编辑'
  formData.value = { ...row }
  editId.value = row.id
  dialogVisible.value = true
}

const handleSave = async () => {
  if (editId.value) {
    await axios.put(`/api/users/${editId.value}`, formData.value)
  } else {
    await axios.post('/api/users', formData.value)
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = async (id) => {
  if (confirm('确定删除该记录？')) {
    await axios.delete(`/api/users/${id}`)
    loadData()
  }
}

const handleImport = () => {
  fileInput.value.click()
}

const onFileSelect = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (event) => {
    const data = new Uint8Array(event.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(sheet)
    await axios.post('/api/users/import', jsonData)
    loadData()
    e.target.value = ''
  }
  reader.readAsArrayBuffer(file)
}

const handleExport = async () => {
  const res = await axios.get('/api/users/export', { responseType: 'blob' })
  const url = window.URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)
}

onMounted(loadData)
</script>

<style scoped>
.container { padding: 20px; }
.toolbar { margin-bottom: 20px; }
.toolbar button { margin-right: 10px; }
</style>