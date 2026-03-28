'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Receipt } from 'lucide-react'
import { createExpense, deleteExpense } from '@/app/(dashboard)/dashboard/projects/[id]/actions'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function ExpenseList({ 
  projectId, 
  expenses, 
  stages,
  canEdit = true
}: { 
  projectId: string, 
  expenses: any[], 
  stages: any[]
  canEdit?: boolean
}) {
  const { t, locale } = useTranslation()
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{t('expenses.title')}</h3>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('expenses.add_expense')}
          </Button>
        )}
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
                <label className="text-sm font-medium">{t('expenses.amount')} (zł)</label>
                <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('expenses.category')}</label>
                <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="materials">{t('expenses.category_materials')}</option>
                  <option value="labor">{t('expenses.category_labor')}</option>
                  <option value="other">{t('expenses.category_other')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('expenses.description')}</label>
                <Input name="description" placeholder={t('expenses.description')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('expenses.stage')} ({t('common.none')})</label>
                <select name="stage_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">{t('common.none')}</option>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('expenses.date')}</label>
                <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>{t('common.cancel')}</Button>
                <Button type="submit">{t('expenses.add_expense')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="text-left font-medium">
              <th className="p-4">{t('expenses.date')}</th>
              <th className="p-4">{t('expenses.description')}</th>
              <th className="p-4">{t('expenses.category')}</th>
              <th className="p-4">{t('expenses.stage')}</th>
              <th className="p-4 text-right">{t('expenses.amount')}</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                  {t('expenses.no_expenses')}
                </td>
              </tr>
            )}
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-muted/50">
                <td className="p-4">{new Date(expense.date).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US')}</td>
                <td className="p-4">
                  <p className="font-medium">{expense.description || t('common.none')}</p>
                </td>
                <td className="p-4 capitalize">
                  {expense.category === 'materials' ? t('expenses.category_materials') : 
                   expense.category === 'labor' ? t('expenses.category_labor') : 
                   t('expenses.category_other')}
                </td>
                <td className="p-4">
                  {stages.find(s => s.id === expense.stage_id)?.name || "-"}
                </td>
                <td className="p-4 text-right font-bold">
                  {Number(expense.amount).toLocaleString()} zł
                </td>
                <td className="p-4 text-right">
                  {canEdit && (
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteExpense(projectId, expense.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
