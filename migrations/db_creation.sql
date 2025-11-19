-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Device Types table
CREATE TABLE device_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Problem Types table
CREATE TABLE problem_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Statuses table (with hardcoded Pending status)
CREATE TABLE statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL, -- HEX color code like #FF0000
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table (main entity)
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    -- Customer details
    customer_fname VARCHAR(100) NOT NULL,
    customer_lname VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Task details
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL, -- Rich text content
    
    -- Foreign keys
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    device_type_id INTEGER NOT NULL REFERENCES device_types(id) ON DELETE RESTRICT,
    problem_type_id INTEGER NOT NULL REFERENCES problem_types(id) ON DELETE RESTRICT,
    status_id INTEGER NOT NULL REFERENCES statuses(id) ON DELETE RESTRICT,
    created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP WITH TIME ZONE NULL
);

-- Many-to-many relationship between tasks and tags
CREATE TABLE task_tags (
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, tag_id)
);

-- Indexes for better performance
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_status_id ON tasks(status_id);
CREATE INDEX idx_tasks_location_id ON tasks(location_id);
CREATE INDEX idx_tasks_archived_at ON tasks(archived_at);
CREATE INDEX idx_tasks_customer_name ON tasks(customer_fname, customer_lname);
CREATE INDEX idx_tasks_customer_email ON tasks(customer_email);
CREATE INDEX idx_tasks_customer_phone ON tasks(customer_phone);
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
CREATE INDEX idx_users_username ON users(username);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables that have updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problem_types_updated_at BEFORE UPDATE ON problem_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_statuses_updated_at BEFORE UPDATE ON statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
-- Insert the default 'Pending' status (id will be 1 due to SERIAL)
INSERT INTO statuses (name) VALUES ('Pending');

-- Insert initial admin user (password will be set by the application)
-- Default password is 'admin' but should be changed immediately
-- Note: The password hash below is a placeholder - replace with actual bcrypt hash during setup
INSERT INTO users (username, password_hash, permissions) VALUES 
('admin', '$2b$10$defaultpasswordhashwillbesetbyapp', 
'["tasks", "locations", "tags", "device_types", "problem_types", "statuses", "users"]'::jsonb);

-- Create a view for active tasks (non-archived)
CREATE VIEW active_tasks AS
SELECT t.*,
       u.username as created_by_username,
       l.name as location_name,
       dt.name as device_type_name,
       pt.name as problem_type_name,
       s.name as status_name
FROM tasks t
LEFT JOIN users u ON t.created_by_user_id = u.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN device_types dt ON t.device_type_id = dt.id
LEFT JOIN problem_types pt ON t.problem_type_id = pt.id
LEFT JOIN statuses s ON t.status_id = s.id
WHERE t.archived_at IS NULL;

-- Create a view for archived tasks
CREATE VIEW archived_tasks AS
SELECT t.*,
       u.username as created_by_username,
       l.name as location_name,
       dt.name as device_type_name,
       pt.name as problem_type_name,
       s.name as status_name
FROM tasks t
LEFT JOIN users u ON t.created_by_user_id = u.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN device_types dt ON t.device_type_id = dt.id
LEFT JOIN problem_types pt ON t.problem_type_id = pt.id
LEFT JOIN statuses s ON t.status_id = s.id
WHERE t.archived_at IS NOT NULL;

-- Function to archive a task
CREATE OR REPLACE FUNCTION archive_task(task_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE tasks 
    SET archived_at = CURRENT_TIMESTAMP 
    WHERE id = task_id AND archived_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to restore an archived task
CREATE OR REPLACE FUNCTION restore_task(task_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE tasks 
    SET archived_at = NULL 
    WHERE id = task_id AND archived_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'System users with role-based permissions';
COMMENT ON COLUMN users.permissions IS 'JSON array of permitted actions: tasks, locations, tags, device_types, problem_types, statuses, users';
COMMENT ON TABLE tasks IS 'Main repair tasks with customer and device information';
COMMENT ON COLUMN tasks.archived_at IS 'Timestamp when task was archived (soft delete) - NULL means active';
COMMENT ON TABLE statuses IS 'Task statuses with hardcoded Pending status that cannot be deleted';
COMMENT ON COLUMN tasks.id IS 'Big integer ID for tasks to handle large volume of records';