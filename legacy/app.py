from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from sqlalchemy import text
import os
import logging
from logging.handlers import RotatingFileHandler

from data_extractor import process_uploaded_file
from database import create_database, insert_data, ENGINE

# --- App Setup ---
app = Flask(__name__)
# IMPORTANT: Change this secret key for production
app.config['SECRET_KEY'] = 'a-very-secret-key' 
app.config['UPLOAD_FOLDER'] = os.path.join(os.getenv('TEMP'), 'VoterVantageUploads')

# --- Logging Setup ---
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'application.log')
handler = RotatingFileHandler(log_file_path, maxBytes=10000, backupCount=1)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)
app.logger.setLevel(logging.DEBUG)

# --- Login Manager Setup ---
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# --- User Model ---
# In a real app, this would be in the database.
# For this project, a simple hardcoded user is secure and sufficient.
class User(UserMixin):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

# Hardcoded user for admin access
# IMPORTANT: Change the password in a real deployment
admin_user = User(id='1', username='admin', password='password123')

@login_manager.user_loader
def load_user(user_id):
    if user_id == admin_user.id:
        return admin_user
    return None

# --- Routes ---
@app.route('/')
def index():
    app.logger.debug("Accessing public index page.")
    filer_name = request.args.get('filer_name')
    entity_name = request.args.get('entity_name')
    min_amount = request.args.get('min_amount')
    max_amount = request.args.get('max_amount')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    contributions_query = "SELECT * FROM contributions WHERE 1=1"
    expenditures_query = "SELECT * FROM expenditures WHERE 1=1"

    params = {}

    if filer_name:
        contributions_query += " AND filer_name LIKE :filer_name"
        expenditures_query += " AND filer_name LIKE :filer_name"
        params['filer_name'] = f'%{filer_name}%'
    if entity_name:
        contributions_query += " AND contributor_name LIKE :entity_name"
        expenditures_query += " AND payee_name LIKE :entity_name"
        params['entity_name'] = f'%{entity_name}%'
    if min_amount:
        contributions_query += " AND contribution_amount >= :min_amount"
        expenditures_query += " AND expenditure_amount >= :min_amount"
        params['min_amount'] = float(min_amount)
    if max_amount:
        contributions_query += " AND contribution_amount <= :max_amount"
        expenditures_query += " AND expenditure_amount <= :max_amount"
        params['max_amount'] = float(max_amount)
    if start_date:
        contributions_query += " AND contribution_date >= :start_date"
        expenditures_query += " AND expenditure_date >= :start_date"
        params['start_date'] = start_date
    if end_date:
        contributions_query += " AND contribution_date <= :end_date"
        expenditures_query += " AND expenditure_date <= :end_date"
        params['end_date'] = end_date

    with ENGINE.connect() as connection:
        contributions = connection.execute(text(contributions_query), params).fetchall()
        expenditures = connection.execute(text(expenditures_query), params).fetchall()
    app.logger.debug(f"Fetched {len(contributions)} contributions from DB.")
    app.logger.debug(f"Fetched {len(expenditures)} expenditures from DB.")
    return render_template('index.html', contributions=contributions, expenditures=expenditures)

@app.route('/login', methods=['GET', 'POST'])
def login():
    app.logger.debug("Accessing login page.")
    if current_user.is_authenticated:
        app.logger.info("User already authenticated, redirecting to admin.")
        return redirect(url_for('admin'))
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == admin_user.username and password == admin_user.password:
            login_user(admin_user)
            app.logger.info(f"User {username} logged in successfully.")
            return redirect(url_for('admin'))
        else:
            app.logger.warning(f"Failed login attempt for user: {username}")
            flash('Invalid username or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    app.logger.info(f"User {current_user.username} logged out.")
    logout_user()
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin():
    app.logger.debug("Accessing admin page.")
    """Admin page with file upload functionality."""
    return render_template('admin.html')

@app.route('/upload', methods=['POST'])
@login_required
def upload_files():
    app.logger.debug("Entering upload_files function.")
    if 'files[]' not in request.files:
        flash('No file part')
        app.logger.warning("No file part in upload request.")
        return redirect(url_for('admin'))
    
    files = request.files.getlist('files[]')
    app.logger.debug(f"Files received: {len(files)}")
    
    for file in files:
        app.logger.debug(f"Processing file: {file.filename}")
        if file.filename == '':
            app.logger.info("Skipping empty filename.")
            continue
        if file:
            filename = file.filename
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            app.logger.debug(f"Saving file to: {file_path}")
            file.save(file_path)
            app.logger.debug(f"Calling process_uploaded_file for: {file_path}")
            data = process_uploaded_file(file_path)
            app.logger.debug(f"Data returned from process_uploaded_file: {data}")
            if data:
                app.logger.info(f"Successfully processed {filename}")
                insert_data(data)
                flash(f'Successfully processed {filename}')
            else:
                flash(f'Failed to process {filename}: No data extracted.')
                flash(f'Failed to process {filename}')

    return redirect(url_for('admin'))

# --- Main Execution ---
if __name__ == '__main__':
    try:
        app.logger.info("Application starting up.")
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            app.logger.info(f"Created UPLOAD_FOLDER: {app.config['UPLOAD_FOLDER']}")
        create_database()
        app.run(debug=False, use_reloader=False)
    except Exception as e:
        app.logger.critical(f"Application crashed: {e}", exc_info=True)