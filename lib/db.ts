import { neon } from "@neondatabase/serverless"

// Create a SQL client with the pooled connection
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to execute a query and return the results
export async function query<T>(queryText: string, params: any[] = []): Promise<T[]> {
  try {
    // Use sql.query for parameterized queries
    const result = await sql.query(queryText, params)
    // The result might be directly the rows array
    return result as any as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to execute a query and return a single result
export async function queryOne<T>(queryText: string, params: any[] = []): Promise<T | null> {
  try {
    const result = await sql.query(queryText, params)
    // Check if result exists and has at least one row
    if (result && Array.isArray(result) && result.length > 0) {
      return result[0] as T
    }
    return null
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
