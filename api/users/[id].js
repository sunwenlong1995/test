import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data.json')
const adapter = new JSONFile(dbPath)
const defaultData = {
  users: [
    { id: 1, name: '张三', email: 'zhangsan@example.com', phone: '13800138001', address: '北京市朝阳区' },
    { id: 2, name: '李四', email: 'lisi@example.com', phone: '13800138002', address: '上海市浦东新区' },
    { id: 3, name: '王五', email: 'wangwu@example.com', phone: '13800138003', address: '广州市天河区' }
  ],
  nextId: 4
}

export default async function handler(req, res) {
  const db = new Low(adapter, defaultData)
  const id = parseInt(req.query.id)
  
  if (req.method === 'GET') {
    await db.read()
    const user = db.data.users.find(u => u.id === id)
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: '用户不存在' })
    }
  } else if (req.method === 'PUT') {
    await db.read()
    const index = db.data.users.findIndex(u => u.id === id)
    if (index !== -1) {
      db.data.users[index] = { ...db.data.users[index], ...req.body }
      await db.write()
      res.json(db.data.users[index])
    } else {
      res.status(404).json({ message: '用户不存在' })
    }
  } else if (req.method === 'DELETE') {
    await db.read()
    db.data.users = db.data.users.filter(u => u.id !== id)
    await db.write()
    res.json({ message: '删除成功' })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}