'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Receipt } from 'lucide-react'
import { createExpense, deleteExpense } from '@/app/(dashboard)/projects/[id]/actions'

export function ExpenseList({ projectId, expenses, stages }: { 
  projectId: string, 
  expenses: any[], 
  stages: any[] 
}) {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Expenses</h3>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-6">
            <form action={async (formData) => {
              const data = {
                amount: parseFloat(formData.get('amount') as string),
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                stage_id: formData.get('stage_id') as string || null,
                date: formData.get('date') as string
              }
              await createExpense(projectId, data)
              setIsAdding(false)
            }} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (zł)</label>
                <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="materials">Materials</option>
                  <option value="labor">Labor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="What was this for?" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage (Optional)</label>
                <select name="stage_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">None</option>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Add Expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="text-left font-medium">
              <th className="p-4">Date</th>
              <th className="p-4">Description</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stage</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-muted/50">
                <td className="p-4">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="p-4">
                  <p className="font-medium">{expense.description || "No description"}</p>
                </td>
                <td className="p-4 capitalize">{expense.category}</td>
                <td className="p-4">
                  {stages.find(s => s.id === expense.stage_id)?.name || "-"}
                </td>
                <td className="p-4 text-right font-bold">
                  {Number(expense.amount).toLocaleString()} zł
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteExpense(projectId, expense.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
