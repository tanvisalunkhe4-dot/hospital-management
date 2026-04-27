import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv
from app.db.models import Base
# 1. Load the .env file so we can get DATABASE_URL
load_dotenv()

# 2. This is the Alembic Config object
config = context.config

# 3. Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 4. SET THE DATABASE URL FROM .ENV
# This tells Alembic to ignore the placeholder in alembic.ini and use Supabase
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# 5. POINT TO YOUR MODELS
# This allows 'autogenerate' to detect your new 2FA columns
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    # Use the config that now has our Supabase URL
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
