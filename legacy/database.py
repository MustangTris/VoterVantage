import sqlalchemy
from sqlalchemy import create_engine, Table, Column, Integer, String, Float, MetaData

DB_NAME = 'campaign_finance.db'
ENGINE = create_engine(f'sqlite:///{DB_NAME}')
METADATA = MetaData()

# Define the table structures
contributions_table = Table('contributions',
    METADATA,
    Column('id', Integer, primary_key=True),
    Column('filer_name', String),
    Column('contributor_name', String),
    Column('contribution_amount', Float),
    Column('contribution_date', String),
    Column('source_file', String)
)

expenditures_table = Table('expenditures',
    METADATA,
    Column('id', Integer, primary_key=True),
    Column('filer_name', String),
    Column('payee_name', String),
    Column('expenditure_amount', Float),
    Column('expenditure_date', String),
    Column('expenditure_description', String),
    Column('source_file', String)
)

def create_database():
    """Creates the database and tables if they don't already exist."""
    METADATA.create_all(ENGINE)
    print(f"Database '{DB_NAME}' and tables created successfully.")

def insert_data(data):
    """
    Inserts extracted data into the appropriate database tables.

    Args:
        data (dict): A dictionary containing 'contributions' and 'expenditures' lists.
    """
    with ENGINE.connect() as connection:
        if data.get('contributions'):
            connection.execute(contributions_table.insert(), data['contributions'])
            print(f"Inserted {len(data['contributions'])} records into the contributions table.")
        
        if data.get('expenditures'):
            connection.execute(expenditures_table.insert(), data['expenditures'])
            print(f"Inserted {len(data['expenditures'])} records into the expenditures table.")
