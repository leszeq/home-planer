-- Migration: Expense Management Enhancements
-- Description: Adds ability to link files to expenses and stores reusable categories per project.

-- 1. Add file_id to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS file_id UUID REFERENCES public.project_files(id) ON DELETE SET NULL;

-- 2. Create index for file lookups
CREATE INDEX IF NOT EXISTS idx_expenses_file_id ON public.expenses(file_id);

-- 3. Create expense_categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, name)
);

-- 4. RLS for expense_categories
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories of projects they belong to" 
    ON public.expense_categories FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (
                p.user_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can create categories in their projects" 
    ON public.expense_categories FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND (
                p.user_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid() AND pm.role IN ('owner', 'editor'))
            )
        )
    );

-- 5. Add default categories for existing projects? 
-- (Maybe better to do this in the app logic or as a separate task)
