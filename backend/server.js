import express from 'express'
import cors from 'cors'
import * as XLSX from 'xlsx'
import { Readable } from 'stream'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const app = express()
app.use(cors())
app.use(express.json())

const adapter = new JSONFile('data.json')
const defaultData = {
  users: [
    { id: 1, name: '张三', email: 'zhangsan@example.com', phone: '13800138001', address: '北京市朝阳区' },
    { id: 2, name: '李四', email: 'lisi@example.com', phone: '13800138002', address: '上海市浦东新区' },
    { id: 3, name: '王五', email: 'wangwu@example.com', phone: '13800138003', address: '广州市天河区' }
  ],
  nextId: 4
}
const db = new Low(adapter, defaultData)

app.get('/api/users', async (req, res) => {
  await db.read()
  res.json(db.data.users)
})

app.post('/api/users', async (req, res) => {
  await db.read()
  const user = { id: db.data.nextId++, ...req.body }
  db.data.users.push(user)
  await db.write()
  res.json(user)
})

app.put('/api/users/:id', async (req, res) => {
  await db.read()
  const id = parseInt(req.params.id)
  const index = db.data.users.findIndex(u => u.id === id)
  if (index !== -1) {
    db.data.users[index] = { ...db.data.users[index], ...req.body }
    await db.write()
    res.json(db.data.users[index])
  } else {
    res.status(404).json({ message: '用户不存在' })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  await db.read()
  const id = parseInt(req.params.id)
  db.data.users = db.data.users.filter(u => u.id !== id)
  await db.write()
  res.json({ message: '删除成功' })
})

app.post('/api/users/import', async (req, res) => {
  await db.read()
  req.body.forEach(item => {
    db.data.users.push({ id: db.data.nextId++, ...item })
  })
  await db.write()
  res.json({ message: '导入成功' })
})

app.get('/api/users/export', async (req, res) => {
  await db.read()
  const worksheet = XLSX.utils.json_to_sheet(db.data.users)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '数据')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  const stream = Readable.from(buffer)
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx')
  stream.pipe(res)
})

app.listen(3009, () => {
  console.log('Server running on http://localhost:3009')
})