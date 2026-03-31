-- Migration: Add stage_id to project_files
-- Description: Allows associating project files with specific construction stages.

ALTER TABLE project_files 
ADD COLUMN stage_id UUID REFERENCES stages(id) ON DELETE SET NULL;

-- Index for better performance when filtering by stage
CREATE INDEX idx_project_files_stage_id ON project_files(stage_id);
