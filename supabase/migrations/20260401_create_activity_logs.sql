-- Create activity_logs table to track project changes
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g. 'create_expense', 'delete_file', 'update_stage'
    entity_type TEXT NOT NULL, -- e.g. 'expense', 'file', 'stage', 'checklist', 'member'
    entity_id TEXT, -- ID of the affected entity
    details JSONB DEFAULT '{}'::jsonb, -- Additional context (e.g. { "name": "Invoice.pdf", "amount": 1500.00 })
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- RLS Policies
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Project members can see logs for their projects
CREATE POLICY "Project members can view activity logs" ON public.activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = activity_logs.project_id
            AND project_members.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = activity_logs.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- System can insert logs (server-side only)
CREATE POLICY "Anyone can insert activity logs (internal)" ON public.activity_logs
    FOR INSERT
    WITH CHECK (true);
