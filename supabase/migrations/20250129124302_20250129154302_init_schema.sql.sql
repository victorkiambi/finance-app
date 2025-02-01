-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
                       id UUID REFERENCES auth.users(id) PRIMARY KEY,
                       email TEXT UNIQUE NOT NULL,
                       full_name TEXT,
                       created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                       updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Accounts table
CREATE TABLE accounts (
                          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                          user_id UUID REFERENCES users(id) NOT NULL,
                          name TEXT NOT NULL,
                          type TEXT NOT NULL, -- 'checking', 'savings', 'credit', etc.
                          currency TEXT DEFAULT 'USD' NOT NULL,
                          initial_balance DECIMAL(12,2) NOT NULL,
                          current_balance DECIMAL(12,2) NOT NULL,
                          is_active BOOLEAN DEFAULT true,
                          created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                          updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                          CONSTRAINT positive_balance CHECK (current_balance >= 0)
);

-- Categories table
CREATE TABLE categories (
                            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                            user_id UUID REFERENCES users(id) NOT NULL,
                            name TEXT NOT NULL,
                            type TEXT NOT NULL, -- 'income' or 'expense'
                            color TEXT, -- hex color code
                            icon TEXT,
                            is_default BOOLEAN DEFAULT false,
                            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                            updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tags table
CREATE TABLE tags (
                      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                      user_id UUID REFERENCES users(id) NOT NULL,
                      name TEXT NOT NULL,
                      color TEXT, -- hex color code
                      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                      UNIQUE(user_id, name)
);

-- Transactions table
CREATE TABLE transactions (
                              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                              user_id UUID REFERENCES users(id) NOT NULL,
                              account_id UUID REFERENCES accounts(id) NOT NULL,
                              category_id UUID REFERENCES categories(id),
                              amount DECIMAL(12,2) NOT NULL,
                              type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
                              description TEXT,
                              date DATE NOT NULL,
                              is_recurring BOOLEAN DEFAULT false,
                              recurring_id UUID, -- references recurring_transactions if part of a recurring series
                              created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                              updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Transaction tags relation table
CREATE TABLE transaction_tags (
                                  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
                                  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
                                  PRIMARY KEY (transaction_id, tag_id)
);

-- Recurring transactions table
CREATE TABLE recurring_transactions (
                                        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                                        user_id UUID REFERENCES users(id) NOT NULL,
                                        account_id UUID REFERENCES accounts(id) NOT NULL,
                                        category_id UUID REFERENCES categories(id),
                                        amount DECIMAL(12,2) NOT NULL,
                                        type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
                                        description TEXT,
                                        frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
                                        start_date DATE NOT NULL,
                                        end_date DATE,
                                        last_generated_date DATE,
                                        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                                        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Budgets table
CREATE TABLE budgets (
                         id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                         user_id UUID REFERENCES users(id) NOT NULL,
                         category_id UUID REFERENCES categories(id) NOT NULL,
                         amount DECIMAL(12,2) NOT NULL,
                         period TEXT NOT NULL, -- 'monthly', 'yearly'
                         start_date DATE NOT NULL,
                         end_date DATE,
                         created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                         updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                         UNIQUE(user_id, category_id, period, start_date)
);

-- Savings goals table
CREATE TABLE savings_goals (
                               id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                               user_id UUID REFERENCES users(id) NOT NULL,
                               name TEXT NOT NULL,
                               target_amount DECIMAL(12,2) NOT NULL,
                               current_amount DECIMAL(12,2) DEFAULT 0 NOT NULL,
                               deadline DATE,
                               is_completed BOOLEAN DEFAULT false,
                               created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                               updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Bills table
CREATE TABLE bills (
                       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                       user_id UUID REFERENCES users(id) NOT NULL,
                       name TEXT NOT NULL,
                       amount DECIMAL(12,2) NOT NULL,
                       due_date DATE NOT NULL,
                       category_id UUID REFERENCES categories(id),
                       reminder_days INT[], -- Array of days before due date to send reminders
                       is_paid BOOLEAN DEFAULT false,
                       recurring_id UUID REFERENCES recurring_transactions(id),
                       created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
                       updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_recurring_transactions_user ON recurring_transactions(user_id);
CREATE INDEX idx_budgets_user_category ON budgets(user_id, category_id);
CREATE INDEX idx_bills_user_due_date ON bills(user_id, due_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- (Similar triggers for other tables with updated_at columns)

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (repeat for all tables)
CREATE POLICY "Users can only access their own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own accounts" ON accounts
    FOR ALL USING (auth.uid() = user_id);

-- Add more policies for other tables following the same pattern