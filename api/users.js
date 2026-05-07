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
  
  if (req.method === 'GET') {
    await db.read()
    res.json(db.data.users)
  } else if (req.method === 'POST') {
    await db.read()
    const user = { id: db.data.nextId++, ...req.body }
    db.data.users.push(user)
    await db.write()
    res.json(user)
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}