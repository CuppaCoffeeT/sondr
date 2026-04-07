# main.py
from fasthtml.common import *
from components import UIComponents as ui
from datetime import datetime
import sqlite3
import hashlib
import os
import sys
import traceback
from PIL import Image
import io
import random
from pillow_heif import register_heif_opener

register_heif_opener()

# Global exception handler for better debugging
def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    print("\n" + "="*50)
    print("UNHANDLED EXCEPTION:")
    print("="*50)
    traceback.print_tb(exc_traceback)
    print(f"{exc_type.__name__}: {exc_value}")
    print("="*50 + "\n")

sys.excepthook = handle_exception

# App initialization with external CSS
app, rt = fast_app(
    pico=False,
    hdrs=(Link(rel="stylesheet", href="/static/styles.css"),)
)

# Static file serving
@rt("/static/{fname:path}.{ext:static}")
async def get(fname:str, ext:str): 
    return FileResponse(f'static/{fname}.{ext}')

# Daily writing prompts
WRITING_PROMPTS = [
    "What is red to you — and why?",
    "Your favorite $2 item — but worth so much more.",
    "Sometimes something so ordinary is more than it seems.",
    "That time you couldn't stop laughing — what led up to it?",
    "It was so small. Why did it have such a big impact?",
    "You almost didn't notice it.",
    "What it meant to you changed over time.",
    "That picture you wouldn't usually take - why did you?",
    "Show something that doesn't look important — tell us why it is.",
    "What felt different this time?",
    "That day something that surprised you — why?",
    "It's out of place — what is it? What makes it so?",
    "If this week had a color, what would it be — and why?",
    "It's unfinished — what's missing?",
    "You see it differently now."
]

# Ensure data directory exists
if not os.path.exists('data'):
    os.makedirs('data')
    print("Created data directory")

def get_todays_prompt():
    """Returns a prompt based on days since a fixed start date"""
    start_date = datetime(2026, 2, 28)
    today = datetime.utcnow()
    days_since = (today - start_date).days
    prompt_index = days_since % len(WRITING_PROMPTS)
    return prompt_index, WRITING_PROMPTS[prompt_index]

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('data/app.db')
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys = ON')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            image BLOB,
            prompt_index INTEGER NOT NULL,
            created_at TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

init_db()

def get_db():
    return database('data/app.db')

# Test route
@rt('/test-db')
def get():
    try:
        db = get_db()
        users = db.t.users
        count = len(users())
        return ui.container(
            ui.card(
                H1('✅ Database Test Successful'),
                P(f'Current users in database: {count}'),
                P('The system is ready for registration.'),
                ui.button('Go to home page', href='/')
            )
        )
    except Exception as e:
        return ui.container(
            ui.card(
                H1('❌ Database Error'),
                P(str(e)),
                P('Please check the console for details.'),
                ui.button('Try again', href='/', primary=False)
            )
        )

# Image serving route
@rt('/image/{post_id}')
def get(post_id: int):
    try:
        db = get_db()
        posts = db.t.posts
        post_list = posts(where="id = ?", where_args=(post_id,))
        
        if not post_list or len(post_list) == 0 or not post_list[0].get('image'):
            return Response(status_code=404)
        
        return Response(post_list[0]['image'], headers={'Content-Type': 'image/jpeg'})
    
    except Exception as e:
        print(f"IMAGE SERVE ERROR: {str(e)}")
        return Response(status_code=500)

# Home page
@rt('/')
def get(session):
    try:
        user_id = session.get('user_id')
        prompt_index, todays_prompt = get_todays_prompt()
        
        now_gmt = datetime.utcnow()
        start_of_day = datetime(now_gmt.year, now_gmt.month, now_gmt.day, 0, 0, 0).isoformat()
        end_of_day = datetime(now_gmt.year, now_gmt.month, now_gmt.day, 23, 59, 59).isoformat()
        
        if user_id:
            db = get_db()
            users = db.t.users
            posts = db.t.posts

            try:
                user = users[user_id]
            except NotFoundError:
                session.clear()
                return RedirectResponse('/', status_code=303)
            
            # Check if user has posted today
            today_posts = posts(where="user_id = ? AND created_at BETWEEN ? AND ?", 
                               where_args=(user_id, start_of_day, end_of_day))
            can_post = len(today_posts) == 0
            
            # Get user's recent posts
            recent_posts = posts(where="user_id = ?",
                               where_args=(user_id,),
                               order_by="created_at desc",
                               limit=10)
            
            # Get all posts from today
            all_today_posts = posts(where="created_at BETWEEN ? AND ?",
                                  where_args=(start_of_day, end_of_day))
            
            return ui.container(
                H1(f'Welcome back, {user["email"]}!'),
                ui.prompt_card(todays_prompt, prompt_index, len(WRITING_PROMPTS)),
                
                # Daily post status
                ui.status_message(
                    f"Daily post status: {'✅ You can post today' if can_post else '❌ You\'ve already posted today'}",
                    "success" if can_post else "info"
                ),
                
                # Post creation form or already posted message
                (ui.post_form(todays_prompt) if can_post else 
                 ui.empty_state("You've already posted today! Come back tomorrow for a new prompt.", "📝")),
                
                # Today's Gallery (only shown after posting)
                (ui.gallery(all_today_posts, WRITING_PROMPTS) if not can_post else None),
                
                # Recent posts section
                ui.recent_posts_section(recent_posts, WRITING_PROMPTS),
                
                ui.button('Logout', href='/logout', primary=False),
                
                style="max-width: 800px; margin: auto;"
            )
        else:
            # Visitor view
            db = get_db()
            posts = db.t.posts
            today_post_count = len(posts(where="created_at BETWEEN ? AND ?",
                                       where_args=(start_of_day, end_of_day)))
            
            return ui.container(
                H1('Welcome to Sondr', style="text-align: center;"),
                ui.today_preview(todays_prompt, today_post_count),
                
                Div(
                    ui.auth_card("Login", "/login"),
                    ui.auth_card("Register", "/register", confirm_password=True),
                    cls="auth-container"
                ),
                
                Div(
                    ui.button('Test Database Connection', href='/test-db', primary=False),
                    style="text-align: center; margin-top: 30px;"
                )
            )
    
    except Exception as e:
        print(f"HOME PAGE ERROR: {str(e)}")
        print(traceback.format_exc())
        return ui.error_page("Something went wrong", "An error occurred loading the page.")

# Registration handler
@rt('/register', methods=['post'])
def post(email: str, password: str, confirm_password: str, session):
    try:
        print(f"\n=== REGISTRATION ATTEMPT: {email}")
        
        if password != confirm_password:
            return ui.error_page("Error", "Passwords do not match", return_url="/")
        
        db = get_db()
        users = db.t.users
        existing = users(where="email = ?", where_args=(email,))
        
        if existing and len(existing) > 0:
            return ui.error_page("Error", "Email already registered", return_url="/")
        
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        user = users.insert(email=email, password=hashed_password)
        session['user_id'] = user['id']
        
        print(f"✅ Registration successful for user {user['id']}")
        return RedirectResponse('/', status_code=303)
    
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return ui.error_page("Registration Failed", str(e), return_url="/")

# Login handler
@rt('/login', methods=['post'])
def post(email: str, password: str, session):
    try:
        print(f"\n=== LOGIN ATTEMPT: {email}")
        
        db = get_db()
        users = db.t.users
        user_list = users(where="email = ?", where_args=(email,))
        
        if not user_list or len(user_list) == 0:
            return ui.error_page("Error", "User not found", return_url="/")
        
        user = user_list[0]
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        if user['password'] != hashed_password:
            return ui.error_page("Error", "Incorrect password", return_url="/")
        
        session['user_id'] = user['id']
        print(f"✅ Login successful for {user['email']}")
        return RedirectResponse('/', status_code=303)
    
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return ui.error_page("Login Failed", str(e), return_url="/")

# Create post handler
@rt('/create-post', methods=['post'])
def post(content: str, session, request, image: bytes = None):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return RedirectResponse('/', status_code=303)
        
        prompt_index, _ = get_todays_prompt()
        
        # Process image if uploaded
        image_data = None
        if image and hasattr(image, 'file') and image.file:
            file_content = image.file.read()
            file_size = len(file_content)
            
            if file_size > 5 * 1024 * 1024:
                size_in_mb = file_size // (1024 * 1024)
                return ui.error_page("❌ Image Too Large", 
                                   f'Your image is approximately {size_in_mb}MB. Maximum allowed is 5MB.')
            
            try:
                img = Image.open(io.BytesIO(file_content))
                
                # Fix orientation based on EXIF
                try:
                    exif = img.getexif()
                    orientation = exif.get(274)
                    if orientation:
                        if orientation == 3:
                            img = img.rotate(180, expand=True)
                        elif orientation == 6:
                            img = img.rotate(-90, expand=True)
                        elif orientation == 8:
                            img = img.rotate(90, expand=True)
                except:
                    pass
                
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    if img.mode == 'RGBA':
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[3])
                        img = background
                    else:
                        img = img.convert('RGB')
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize
                img.thumbnail((800, 800))
                
                # Save as JPEG
                output = io.BytesIO()
                img.save(output, format='JPEG', quality=85, optimize=True)
                image_data = output.getvalue()
                
            except Exception as e:
                print(f"Image processing error: {str(e)}")
                return ui.error_page("❌ Image Processing Failed", 
                                   "Please try a different image or format.")
        
        db = get_db()
        posts = db.t.posts
        
        # Check daily limit
        now_gmt = datetime.utcnow()
        start_of_day = datetime(now_gmt.year, now_gmt.month, now_gmt.day, 0, 0, 0).isoformat()
        end_of_day = datetime(now_gmt.year, now_gmt.month, now_gmt.day, 23, 59, 59).isoformat()
        
        today_posts = posts(where="user_id = ? AND created_at BETWEEN ? AND ?",
                          where_args=(user_id, start_of_day, end_of_day))
        
        if len(today_posts) > 0:
            return ui.error_page("Error", "You can only post once per day!")
        
        # Create post
        posts.insert(
            user_id=user_id,
            content=content,
            image=image_data,
            prompt_index=prompt_index,
            created_at=now_gmt
        )
        
        print(f"✅ Post created by user {user_id}")
        return RedirectResponse('/', status_code=303)
    
    except Exception as e:
        print(f"❌ Post creation error: {str(e)}")
        return ui.error_page("Error", "Failed to create post.", str(e))

# Logout handler
@rt('/logout')
def get(session):
    session.clear()
    return RedirectResponse('/', status_code=303)

print("\n" + "="*60)
print("🚀 Server starting...")
print("📁 Database location: data/app.db")
print("🌐 Visit: http://localhost:5001")
print("🔧 Test database: http://localhost:5001/test-db")
print("📸 Image upload enabled")
print(f"📝 Daily prompts active - {len(WRITING_PROMPTS)} prompts")
print("✨ Using modular component architecture")
print("="*60 + "\n")

serve()
