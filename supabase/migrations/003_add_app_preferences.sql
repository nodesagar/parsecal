ALTER TABLE profiles 
ADD COLUMN time_format TEXT NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
ADD COLUMN default_event_duration INT NOT NULL DEFAULT 30 CHECK (default_event_duration > 0),
ADD COLUMN default_reminder INT NOT NULL DEFAULT 10 CHECK (default_reminder >= 0);
