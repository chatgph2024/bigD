// Function to generate sequential IDs with a specified prefix and padding
export const generateId = async (prefix: string, currentCount: number, padLength = 4) => {
  const paddedNumber = String(currentCount + 1).padStart(padLength, "0")
  return `${prefix}-${paddedNumber}`
}

// Get the next agent ID
export const getNextAgentId = async (agents: Record<string, any>) => {
  // Get all agent IDs that match the BIGD pattern
  const agentIds = Object.values(agents || {})
    .map((agent: any) => agent.agent_id || "")
    .filter((id) => id.startsWith("BIGD-"))

  // Extract numbers from IDs and find the highest number
  const numbers = agentIds.map((id) => {
    const match = id.match(/BIGD-(\d+)/)
    return match ? Number.parseInt(match[1], 10) : 0
  })

  const highestNumber = numbers.length > 0 ? Math.max(...numbers) : 0

  // Generate the next ID
  return generateId("BIGD", highestNumber)
}

// Get the next customer ID
export const getNextCustomerId = async (customers: Record<string, any>) => {
  // Get all customer IDs that match the CUST pattern
  const customerIds = Object.values(customers || {})
    .map((customer: any) => customer.customer_id || "")
    .filter((id) => id.startsWith("CUST-"))

  // Extract numbers from IDs and find the highest number
  const numbers = customerIds.map((id) => {
    const match = id.match(/CUST-(\d+)/)
    return match ? Number.parseInt(match[1], 10) : 0
  })

  const highestNumber = numbers.length > 0 ? Math.max(...numbers) : 0

  // Generate the next ID
  return generateId("CUST", highestNumber)
}

