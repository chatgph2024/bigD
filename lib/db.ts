import { ref, get, set, update, remove, query, orderByChild, equalTo } from "firebase/database"
import { db } from "@/lib/firebase"

// Agents
export const getAgents = async () => {
  const snapshot = await get(ref(db, "agents"))
  return snapshot.exists() ? snapshot.val() : {}
}

export const getAgentById = async (id: string) => {
  const snapshot = await get(ref(db, `agents/${id}`))
  return snapshot.exists() ? snapshot.val() : null
}

// Customers
export const getCustomers = async () => {
  const snapshot = await get(ref(db, "customers"))
  return snapshot.exists() ? snapshot.val() : {}
}

export const getCustomerById = async (id: string) => {
  const snapshot = await get(ref(db, `customers/${id}`))
  return snapshot.exists() ? snapshot.val() : null
}

export const getCustomersByAgentId = async (agentId: string) => {
  const customersRef = ref(db, "customers")
  const customersQuery = query(customersRef, orderByChild("agent_id"), equalTo(agentId))
  const snapshot = await get(customersQuery)
  return snapshot.exists() ? snapshot.val() : {}
}

export const createCustomer = async (customer: any) => {
  const newCustomerRef = ref(db, `customers/${customer.id}`)
  await set(newCustomerRef, customer)
  return customer
}

export const updateCustomer = async (id: string, data: any) => {
  const customerRef = ref(db, `customers/${id}`)
  await update(customerRef, data)
  return { id, ...data }
}

export const deleteCustomer = async (id: string) => {
  const customerRef = ref(db, `customers/${id}`)
  await remove(customerRef)
  return id
}

// Orders
export const getOrders = async () => {
  const snapshot = await get(ref(db, "orders"))
  return snapshot.exists() ? snapshot.val() : {}
}

export const getOrderById = async (id: string) => {
  const snapshot = await get(ref(db, `orders/${id}`))
  return snapshot.exists() ? snapshot.val() : null
}

export const getOrdersByAgentId = async (agentId: string) => {
  const ordersRef = ref(db, "orders")
  const ordersQuery = query(ordersRef, orderByChild("agent_id"), equalTo(agentId))
  const snapshot = await get(ordersQuery)
  return snapshot.exists() ? snapshot.val() : {}
}

export const createOrder = async (order: any) => {
  const newOrderRef = ref(db, `orders/${order.id}`)
  await set(newOrderRef, order)
  return order
}

export const updateOrder = async (id: string, data: any) => {
  const orderRef = ref(db, `orders/${id}`)
  await update(orderRef, data)
  return { id, ...data }
}

// Products
export const getProducts = async () => {
  const snapshot = await get(ref(db, "products"))
  return snapshot.exists() ? snapshot.val() : {}
}

export const getProductById = async (id: string) => {
  const snapshot = await get(ref(db, `products/${id}`))
  return snapshot.exists() ? snapshot.val() : null
}

// Users
export const getUserById = async (id: string) => {
  const snapshot = await get(ref(db, `users/${id}`))
  return snapshot.exists() ? snapshot.val() : null
}

export const updateUser = async (id: string, data: any) => {
  const userRef = ref(db, `users/${id}`)
  await update(userRef, data)
  return { id, ...data }
}

